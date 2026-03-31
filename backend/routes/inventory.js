const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const {
    ensureObjectId,
    escapeForRegex,
    parseDate,
    parsePositiveInteger,
    parseRequiredString
} = require('../utils/validation');

router.get('/', async (req, res) => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        const filters = {};

        if (search) {
            const searchRegex = new RegExp(escapeForRegex(search), 'i');
            filters.$or = [{ name: searchRegex }, { batch: searchRegex }];
        }

        const medicines = await Medicine.find(filters).sort({ createdAt: -1 });
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const name = parseRequiredString(req.body.name, 'Medicine name');
        const batch = parseRequiredString(req.body.batch, 'Batch number');
        const expiry = parseDate(req.body.expiry, 'Expiry date');
        const stock = parsePositiveInteger(req.body.stock, 'Initial stock', { allowZero: true });

        const existingMedicine = await Medicine.findOne({
            name: new RegExp(`^${escapeForRegex(name)}$`, 'i'),
            batch: new RegExp(`^${escapeForRegex(batch)}$`, 'i')
        });

        if (existingMedicine) {
            existingMedicine.expiry = expiry;
            existingMedicine.stock += stock;
            await existingMedicine.save();

            return res.status(200).json({
                message: 'Existing batch restocked successfully.',
                medicine: existingMedicine
            });
        }

        const medicine = await Medicine.create({
            name,
            batch,
            expiry,
            stock
        });

        res.status(201).json({
            message: 'Medicine added successfully.',
            medicine
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const id = ensureObjectId(req.params.id, 'Medicine ID');
        const medicine = await Medicine.findById(id);

        if (!medicine) {
            return res.status(404).json({ error: 'Medicine not found.' });
        }

        const name = parseRequiredString(req.body.name, 'Medicine name');
        const batch = parseRequiredString(req.body.batch, 'Batch number');
        const expiry = parseDate(req.body.expiry, 'Expiry date');

        const duplicateMedicine = await Medicine.findOne({
            _id: { $ne: medicine._id },
            name: new RegExp(`^${escapeForRegex(name)}$`, 'i'),
            batch: new RegExp(`^${escapeForRegex(batch)}$`, 'i')
        });

        if (duplicateMedicine) {
            return res.status(409).json({
                error: 'Another medicine with the same name and batch already exists.'
            });
        }

        medicine.name = name;
        medicine.batch = batch;
        medicine.expiry = expiry;
        await medicine.save();

        res.json({
            message: 'Medicine updated successfully.',
            medicine
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.patch('/:id/stock', async (req, res) => {
    try {
        const id = ensureObjectId(req.params.id, 'Medicine ID');
        const operation = req.body.operation || 'add';
        const quantity = parsePositiveInteger(
            req.body.quantity ?? req.body.qty,
            'Quantity',
            { allowZero: operation === 'set' }
        );
        const medicine = await Medicine.findById(id);

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        if (operation === 'set') {
            medicine.stock = quantity;
        } else if (operation === 'remove') {
            if (medicine.stock < quantity) {
                return res.status(400).json({ error: 'Not enough stock to remove that quantity.' });
            }

            medicine.stock -= quantity;
        } else if (operation === 'add') {
            medicine.stock += quantity;
        } else {
            return res.status(400).json({ error: 'Unsupported stock operation.' });
        }

        await medicine.save();

        res.json({
            message: 'Stock updated successfully.',
            medicine
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = ensureObjectId(req.params.id, 'Medicine ID');
        const medicine = await Medicine.findById(id);

        if (!medicine) {
            return res.status(404).json({ error: 'Medicine not found.' });
        }

        await medicine.deleteOne();

        res.json({
            message: 'Medicine deleted successfully.'
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
