const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

// Turns every kind of error into the same JSON shape: { error: { status, message, code? } }
function toApiError(err) {
  if (err instanceof ApiError) return err;
  if (err.type === 'entity.parse.failed') return ApiError.badRequest('Request body is not valid JSON');
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map(e => e.message);
    return ApiError.unprocessable(messages.join('; '), 'VALIDATION_FAILED');
  }
  if (err instanceof mongoose.Error.CastError) return ApiError.badRequest(`Invalid value for ${err.path}`);
  if (err.code === 11000) { // MongoDB duplicate key
    const fields = Object.keys(err.keyValue || {}).join(', ');
    return ApiError.conflict(`A record with the same ${fields} already exists`, 'DUPLICATE');
  }
  return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let apiError = toApiError(err);
  if (!apiError) {
    console.error(err);
    apiError = new ApiError(500, 'Internal server error');
  }
  const body = { status: apiError.status, message: apiError.message };
  if (apiError.code) body.code = apiError.code;
  res.status(apiError.status).json({ error: body });
}

module.exports = errorHandler;
module.exports.toApiError = toApiError;
