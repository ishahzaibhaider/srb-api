const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const ApiError = require('../utils/ApiError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

function signToken(user) {
  // only the user id and role go into the token - never the password
  return jwt.sign({ sub: String(user._id), role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });
}

// Registration always creates a STUDENT, whatever role the client sends
async function register({ name, email, password, regNo }) {
  if (typeof password !== 'string' || password.length < 8) {
    throw ApiError.unprocessable('password must be at least 8 characters', 'VALIDATION_FAILED');
  }
  if (await User.exists({ email: String(email).toLowerCase().trim() })) {
    throw ApiError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
  }
  if (await User.exists({ regNo: String(regNo).toUpperCase().trim() })) {
    throw ApiError.conflict('An account with this regNo already exists', 'REGNO_TAKEN');
  }
  const user = await User.create({ name, email, password, regNo, role: 'student' });
  // keep Assignment 1's Student record in sync so the booking logic works unchanged
  await Student.updateOne(
    { regNo: user.regNo },
    { $setOnInsert: { regNo: user.regNo, name: user.name, email: user.email } },
    { upsert: true }
  );
  return user;
}

async function login({ email, password }) {
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  // same answer for "unknown email" and "wrong password"
  if (!user || !(await user.checkPassword(String(password)))) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }
  return { token: signToken(user), expiresIn: jwtExpiresIn, user };
}

module.exports = { register, login, signToken };
