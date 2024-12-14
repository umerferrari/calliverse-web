const CustomError = require('../utils/customError');

/**
 * Middleware to validate requests using Joi schemas.
 * @param {Object} schemas - Joi validation schemas for `params`, `query`, and `body`.
 * Example: { params: paramsSchema, query: querySchema, body: bodySchema }
 */
const validateRequest = (schemas) => {
  return (req, res, next) => {
    try {
        console.log('Params:', req.params); // Debug log
        console.log('Query:', req.query); // Debug log
      // Validate each section (params, query, body) if the schema is provided
      ['params', 'query', 'body'].forEach((key) => {
        if (schemas[key]) {
          const { error } = schemas[key].validate(req[key], { abortEarly: false });
          if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            throw new CustomError(errorMessage, 400);
          }
        }
      });

      // Merge validated data for convenience
      req.validatedData = {
        ...schemas.params ? req.params : {},
        ...schemas.query ? req.query : {},
        ...schemas.body ? req.body : {},
      };

      next(); // Proceed to the next middleware/controller
    } catch (error) {
      next(error); // Pass error to the global error handler
    }
  };
};

module.exports = validateRequest;
