// requireAuth: reads "Authorization: Bearer <token>", verifies the JWT and loads the user.
// Missing, invalid or expired token -> 401.
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { jwtSecret } = require('../config/env');

async function userFromToken(header) {
  const [scheme, token] = String(header || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw ApiError.unauthorized('Login required: send Authorization: Bearer <token>', 'TOKEN_MISSING');
  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Token has expired, please log in again', 'TOKEN_EXPIRED');
    throw ApiError.unauthorized('Invalid token', 'TOKEN_INVALID');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists', 'TOKEN_INVALID');
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, regNo: user.regNo };
}

async function requireAuth(req, res, next) {
  req.user = await userFromToken(req.get('Authorization'));
  next();
}

module.exports = requireAuth;
module.exports.userFromToken = userFromToken;
