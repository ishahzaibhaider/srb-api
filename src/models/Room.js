const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String, required: true, unique: true, uppercase: true, trim: true,
    match: [/^ROOM-\d{2,}$/, 'roomCode must look like ROOM-01']
  },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  building: { type: String, required: true, trim: true, maxlength: 100 },
  seats: { type: Number, required: true, min: [1, 'seats must be at least 1'], max: 500 }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Room', roomSchema);
