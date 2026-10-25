const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

// Rejects a malformed MongoDB id in the URL with 400 before it reaches the controller
const validateObjectId = param => (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params[param])) {
    return next(ApiError.badRequest(`'${req.params[param]}' is not a valid ${param}`));
  }
  next();
};

module.exports = validateObjectId;
