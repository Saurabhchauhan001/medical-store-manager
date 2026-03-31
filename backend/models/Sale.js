const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    medicineName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    total: { type: Number, required: true, min: 0 },
    profit: { type: Number, required: true, default: 0 }
}, {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false }
});

saleSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

module.exports = mongoose.model('Sale', saleSchema);
