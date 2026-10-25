const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  regNo: { type: String, required: true, uppercase: true, index: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true, index: true }
}, { timestamps: true, versionKey: false });

// a student cannot book the same slot twice
bookingSchema.index({ regNo: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
