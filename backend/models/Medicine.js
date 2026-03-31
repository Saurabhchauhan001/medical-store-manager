const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    batch: { type: String, required: true, trim: true },
    expiry: { type: Date, required: true },
    price: { type: Number, default: 0, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 }
}, {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false }
});

medicineSchema.index({ name: 1, batch: 1 });

medicineSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

module.exports = mongoose.model('Medicine', medicineSchema);
