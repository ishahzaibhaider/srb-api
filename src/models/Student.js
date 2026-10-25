const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  regNo: {
    type: String, required: true, unique: true, uppercase: true, trim: true,
    match: [/^(FA|SP)\d{2}-[A-Z]{3}-\d{3}$/, 'regNo must look like FA23-BCS-045']
  },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email is not valid']
  }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Student', studentSchema);
