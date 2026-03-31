const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const Purchase = require('../models/Purchase');
const Medicine = require('../models/Medicine');
const {
    ensureObjectId,
    escapeForRegex,
    parsePositiveInteger,
    parsePositiveNumber,
    parseRequiredString,
    roundCurrency
} = require('../utils/validation');

router.get('/', async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ createdAt: -1 });
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const name = parseRequiredString(req.body.name, 'Supplier name');
        const contact = parseRequiredString(req.body.contact, 'Contact');
        const phone = parseRequiredString(req.body.phone, 'Phone');

        const existingSupplier = await Supplier.findOne({
            $or: [
                { name: new RegExp(`^${escapeForRegex(name)}$`, 'i') },
                { phone }
            ]
        });

        if (existingSupplier) {
            return res.status(409).json({ error: 'A supplier with that name or phone already exists.' });
        }

        const supplier = await Supplier.create({ name, contact, phone });

        res.status(201).json({
            message: 'Supplier added successfully.',
            supplier
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/purchases', async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .sort({ date: -1 })
            .populate('supplierId', 'name')
            .populate('medicineId', 'name batch');

        res.json(purchases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/purchases', async (req, res) => {
    try {
        const supplierId = ensureObjectId(req.body.supplierId, 'Supplier ID');
        const medicineId = ensureObjectId(req.body.medicineId, 'Medicine ID');
        const quantity = parsePositiveInteger(req.body.quantity, 'Quantity');

        const hasUnitCost = req.body.unitCost !== undefined && req.body.unitCost !== '';
        const hasTotalCost = req.body.totalCost !== undefined && req.body.totalCost !== '';
        let unitCost = 0;
        let totalCost = 0;

        if (hasUnitCost || hasTotalCost) {
            unitCost = hasUnitCost
                ? roundCurrency(parsePositiveNumber(req.body.unitCost, 'Unit cost'))
                : null;

            totalCost = hasTotalCost
                ? roundCurrency(parsePositiveNumber(req.body.totalCost, 'Total cost'))
                : null;

            if (unitCost === null) {
                unitCost = roundCurrency(totalCost / quantity);
            }

            if (totalCost === null) {
                totalCost = roundCurrency(unitCost * quantity);
            }
        }

        const [supplier, medicine] = await Promise.all([
            Supplier.findById(supplierId),
            Medicine.findById(medicineId)
        ]);

        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found.' });
        }

        if (!medicine) {
            return res.status(404).json({ error: 'Medicine not found.' });
        }

        medicine.stock += quantity;
        await medicine.save();

        const purchase = await Purchase.create({
            supplierId: supplier._id,
            supplierName: supplier.name,
            medicineId: medicine._id,
            medicineName: medicine.name,
            quantity,
            unitCost,
            totalCost
        });

        await purchase.populate('supplierId', 'name');
        await purchase.populate('medicineId', 'name batch');

        res.status(201).json({
            message: 'Restock recorded and stock updated successfully.',
            purchase,
            medicine
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
