//
// Centralized error handling middleware
//

/**
 * PUBLIC_INTERFACE
 * errorHandler is an Express error-handling middleware that returns JSON errors.
 * It respects known error shapes and masks unexpected errors with a generic message.
 * @returns {import('express').ErrorRequestHandler}
 */
export function errorHandler(err, req, res, _next) {
  // If response is already sent, delegate to default Express handler
  if (res.headersSent) {
    return res.end();
  }

  // Known validation or not found errors may carry status
  const status = err.statusCode || err.status || 500;

  // Build safe payload
  const payload = {
    error: err.code || (status === 404 ? 'not_found' : status === 400 ? 'bad_request' : 'internal_error'),
    message: err.expose ? (err.message || '') : (status >= 500 ? 'Internal server error' : (err.message || 'Error')),
  };

  // Optionally include details if provided and safe to expose
  if (Array.isArray(err.errors)) {
    payload.errors = err.errors;
  }

  // Log server-side for diagnostics (avoid leaking stack to clients)
  // eslint-disable-next-line no-console
  console.error('Error:', { status, message: err.message, stack: err.stack });

  return res.status(status).json(payload);
}
