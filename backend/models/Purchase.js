const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    supplierName: { type: String, required: true, trim: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    medicineName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, default: 0, min: 0 },
    date: { type: Date, default: Date.now },
    totalCost: { type: Number, default: 0, min: 0 }
}, {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false }
});

purchaseSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

module.exports = mongoose.model('Purchase', purchaseSchema);
