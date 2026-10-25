const ApiError = require('../utils/ApiError');

function notFound(req, res, next) {
  next(ApiError.notFound('Route not found'));
}

module.exports = notFound;
