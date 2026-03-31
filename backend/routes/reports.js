const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const { roundCurrency } = require('../utils/validation');

router.get('/daily', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaysSales = await Sale.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ date: -1 });

        const totalRevenue = roundCurrency(todaysSales.reduce((acc, sale) => acc + sale.total, 0));
        const totalProfit = roundCurrency(todaysSales.reduce((acc, sale) => acc + sale.profit, 0));

        res.json({
            date: startOfDay.toISOString().split('T')[0],
            salesCount: todaysSales.length,
            totalRevenue,
            totalProfit,
            sales: todaysSales
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/fast-moving', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const topSelling = await Sale.aggregate([
            { $match: { date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: '$medicineId',
                    name: { $first: '$medicineName' },
                    totalSold: { $sum: '$quantity' },
                    totalRevenue: { $sum: '$total' }
                }
            },
            { $sort: { totalSold: -1, totalRevenue: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    medicineId: '$_id',
                    name: { $ifNull: ['$name', 'Unknown medicine'] },
                    totalSold: 1,
                    totalRevenue: 1
                }
            }
        ]);

        res.json(topSelling.map((item) => ({
            ...item,
            totalRevenue: roundCurrency(item.totalRevenue)
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
