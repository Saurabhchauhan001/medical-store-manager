const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

router.get('/', async (req, res) => {
    try {
        const today = new Date();
        const alerts = [];
        const lowStockThreshold = Number(process.env.LOW_STOCK_THRESHOLD) || 20;
        const medicines = await Medicine.find();

        medicines.forEach(med => {
            if (med.stock <= lowStockThreshold) {
                alerts.push({
                    id: `ls-${med.id}`,
                    type: 'low_stock',
                    medicineId: med.id,
                    medicineName: med.name,
                    batch: med.batch,
                    message: med.stock === 0
                        ? 'This batch is out of stock. Restock it as soon as possible.'
                        : `Only ${med.stock} units left. Plan the next restock soon.`,
                    severity: med.stock === 0 ? 'critical' : 'high'
                });
            }

            const expiryDate = new Date(med.expiry);

            if (Number.isNaN(expiryDate.getTime())) {
                return;
            }

            const diffTime = expiryDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 0) {
                alerts.push({
                    id: `exp-${med.id}`,
                    type: 'expired',
                    medicineId: med.id,
                    medicineName: med.name,
                    batch: med.batch,
                    message: `Expired on ${expiryDate.toISOString().split('T')[0]}. Remove this batch from sale and review disposal.`,
                    severity: 'critical',
                    daysUntilExpiry: diffDays,
                    expiryDate
                });
            } else if (diffDays <= 30) {
                alerts.push({
                    id: `exp30-${med.id}`,
                    type: 'expiry_30',
                    medicineId: med.id,
                    medicineName: med.name,
                    batch: med.batch,
                    message: `Expires in ${diffDays} days. Prioritize this batch and avoid over-ordering.`,
                    severity: 'high',
                    daysUntilExpiry: diffDays,
                    expiryDate
                });
            } else if (diffDays <= 60) {
                alerts.push({
                    id: `exp60-${med.id}`,
                    type: 'expiry_60',
                    medicineId: med.id,
                    medicineName: med.name,
                    batch: med.batch,
                    message: `Expires in ${diffDays} days. Review remaining quantity and keep it moving.`,
                    severity: 'medium',
                    daysUntilExpiry: diffDays,
                    expiryDate
                });
            } else if (diffDays <= 90) {
                alerts.push({
                    id: `exp90-${med.id}`,
                    type: 'expiry_90',
                    medicineId: med.id,
                    medicineName: med.name,
                    batch: med.batch,
                    message: `Expires in ${diffDays} days. Keep this batch under watch.`,
                    severity: 'low',
                    daysUntilExpiry: diffDays,
                    expiryDate
                });
            }
        });

        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        alerts.sort((left, right) => {
            const severityDiff = severityOrder[left.severity] - severityOrder[right.severity];

            if (severityDiff !== 0) {
                return severityDiff;
            }

            return (left.daysUntilExpiry ?? Number.MAX_SAFE_INTEGER) - (right.daysUntilExpiry ?? Number.MAX_SAFE_INTEGER);
        });

        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
