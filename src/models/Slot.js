const mongoose = require('mongoose');

const START_HOURS = [8, 10, 12, 14, 16]; // two-hour slots

const slotSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, uppercase: true, trim: true, index: true },
  date: {
    type: String, required: true,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'date must be in the format YYYY-MM-DD'],
    validate: {
      validator: v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().startsWith(v),
      message: 'date is not a real calendar date'
    }
  },
  startHour: {
    type: Number, required: true,
    enum: { values: START_HOURS, message: 'startHour must be one of 8, 10, 12, 14 or 16' }
  },
  seats: { type: Number, required: true, min: 1 }, // copied from the room when the slot is created
  booked: { type: Number, default: 0, min: 0 }
}, {
  timestamps: true, versionKey: false,
  toJSON: { virtuals: true }, toObject: { virtuals: true }
});

slotSchema.virtual('seatsLeft').get(function () { return this.seats - this.booked; });

// one slot per room, date and start hour
slotSchema.index({ roomCode: 1, date: 1, startHour: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
module.exports.START_HOURS = START_HOURS;
