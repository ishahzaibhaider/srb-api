const ApiError = require('../utils/ApiError');

// 400 when the body is missing or a required field is absent (bad input).
// Values that are present but invalid are checked by the Mongoose model (422).
const requireFields = (...fields) => (req, res, next) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return next(ApiError.badRequest('Request body must be a JSON object'));
  }
  const missing = fields.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length) return next(ApiError.badRequest(`Missing required field(s): ${missing.join(', ')}`));
  next();
};

module.exports = requireFields;
