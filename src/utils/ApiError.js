// An error that already knows its HTTP status (and an optional machine-readable code)
class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }

  static badRequest(message, code) { return new ApiError(400, message, code); }
  static notFound(message, code) { return new ApiError(404, message, code); }
  static conflict(message, code) { return new ApiError(409, message, code); }
  static unprocessable(message, code) { return new ApiError(422, message, code); }
}

module.exports = ApiError;
