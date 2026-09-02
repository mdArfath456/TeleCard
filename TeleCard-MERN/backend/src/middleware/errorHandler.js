// Centralized error handler. Controllers throw / call next(err) with either
// a plain Error (message) or one flagged with a .status.
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already in use` });
  }

  const status = err.status || 400;
  res.status(status).json({ message: err.message || 'Something went wrong' });
}

module.exports = errorHandler;

// Small helper so controllers can `throw apiError(404, 'Not found')`
function apiError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports.apiError = apiError;
