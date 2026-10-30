const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/roles');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email is not valid']
  },
  // only the bcrypt hash is stored; select:false keeps it out of every normal query
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ROLES, default: 'student' },
  regNo: {
    type: String, uppercase: true, trim: true, unique: true, sparse: true,  // staff/admin have no regNo
    match: [/^(FA|SP)\d{2}-[A-Z]{3}-\d{3}$/, 'regNo must look like FA23-BCS-045']
  }
}, {
  timestamps: true, versionKey: false,
  toJSON: { transform: (doc, ret) => { delete ret.password; return ret; } }   // never send the hash back
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
