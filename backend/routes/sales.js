const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const Sale = require('../models/Sale');
const {
    ensureObjectId,
    parsePositiveInteger,
    parsePositiveNumber,
    roundCurrency
} = require('../utils/validation');

router.get('/', async (req, res) => {
    try {
        const requestedLimit = Number(req.query.limit);
        const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
            ? Math.min(requestedLimit, 100)
            : 20;

        const sales = await Sale.find().sort({ date: -1 }).limit(limit);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const medicineId = ensureObjectId(req.body.medicineId, 'Medicine ID');
        const quantity = parsePositiveInteger(req.body.quantity, 'Quantity');
        const medicine = await Medicine.findById(medicineId);

        if (!medicine) {
            return res.status(404).json({ error: 'Medicine not found.' });
        }

        if (medicine.stock < quantity) {
            return res.status(400).json({ error: 'Not enough stock to complete this sale.' });
        }

        const unitPrice = req.body.unitPrice !== undefined && req.body.unitPrice !== ''
            ? roundCurrency(parsePositiveNumber(req.body.unitPrice, 'Unit price'))
            : roundCurrency(medicine.price);

        const total = roundCurrency(unitPrice * quantity);
        const profit = roundCurrency((unitPrice - (medicine.costPrice || 0)) * quantity);

        medicine.stock -= quantity;
        await medicine.save();

        const sale = await Sale.create({
            medicineId: medicine._id,
            medicineName: medicine.name,
            quantity,
            unitPrice,
            total,
            profit
        });

        res.status(201).json({
            message: 'Sale recorded successfully.',
            sale,
            medicine
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
