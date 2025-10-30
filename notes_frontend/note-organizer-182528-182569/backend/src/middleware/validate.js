//
// Basic request validation helper middleware
//

/**
 * PUBLIC_INTERFACE
 * validateBody creates an Express middleware that validates req.body against a validator function.
 * If validation fails, responds with 400 and a standardized error payload.
 * @param {(body: any) => { valid: boolean, errors?: string[], value?: any }} validator - validator function returning validity and optional sanitized value
 * @returns {import('express').RequestHandler}
 */
export function validateBody(validator) {
  return (req, res, next) => {
    try {
      const result = validator(req.body ?? {});
      if (!result || result.valid === false) {
        const errors = (result && Array.isArray(result.errors) && result.errors.length)
          ? result.errors
          : ['Invalid request body'];
        return res.status(400).json({ error: 'validation_error', errors });
      }
      // Optionally replace body with sanitized value if provided
      if (result.value !== undefined) {
        req.body = result.value;
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

/**
 * PUBLIC_INTERFACE
 * validateQuery creates a middleware to validate req.query.
 * @param {(query: any) => { valid: boolean, errors?: string[], value?: any }} validator
 * @returns {import('express').RequestHandler}
 */
export function validateQuery(validator) {
  return (req, res, next) => {
    try {
      const result = validator(req.query ?? {});
      if (!result || result.valid === false) {
        const errors = (result && Array.isArray(result.errors) && result.errors.length)
          ? result.errors
          : ['Invalid query parameters'];
        return res.status(400).json({ error: 'validation_error', errors });
      }
      if (result.value !== undefined) {
        req.query = result.value;
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
