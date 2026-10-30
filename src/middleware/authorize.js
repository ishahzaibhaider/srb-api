// Role checks, used AFTER requireAuth. The rules themselves live in config/roles.js.
const ApiError = require('../utils/ApiError');
const { can, canUseBookingsOf } = require('../config/roles');

// allow('rooms:edit') -> 403 unless the user's role may do that action
const allow = action => (req, res, next) => {
  if (!can(req.user.role, action)) {
    return next(ApiError.forbidden(`Your role (${req.user.role}) is not allowed to do this`, 'FORBIDDEN'));
  }
  next();
};

// For /students/:regNo/... -> a student only for their own regNo, staff/admin for anyone
const allowOwnRegNo = (req, res, next) => {
  if (!canUseBookingsOf(req.user, req.params.regNo)) {
    return next(ApiError.forbidden('Students can only access their own bookings', 'NOT_YOUR_REGNO'));
  }
  next();
};

module.exports = { allow, allowOwnRegNo };
