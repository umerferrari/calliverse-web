const Joi = require('joi');
const CustomError = require('../utils/customError');

/**
 * Middleware to validate WebSocket payloads using Joi schemas.
 * @param {Object} schema - Joi schema with `params`, `query`, or `body`.
 */
const validateSocketRequest = (schema) => {
  return (payload, callback, next) => {
    try {
      const mappedPayload = {};

      // Map flat payload to schema structure
      if (schema.params) {
        mappedPayload.params = {};
        for (const key in schema.params.describe().keys) {
          if (payload[key] !== undefined) {
            mappedPayload.params[key] = payload[key];
          }
        }
      }

      if (schema.query) {
        mappedPayload.query = {};
        for (const key in schema.query.describe().keys) {
          if (payload[key] !== undefined) {
            mappedPayload.query[key] = payload[key];
          }
        }
      }

      if (schema.body) {
        mappedPayload.body = {};
        for (const key in schema.body.describe().keys) {
          if (payload[key] !== undefined) {
            mappedPayload.body[key] = payload[key];
          }
        }
      }

      // Validate each section (params, query, body) if defined in the schema
      ['params', 'query', 'body'].forEach((section) => {
        if (schema[section]) {
          const { error, value } = schema[section].validate(mappedPayload[section], {
            abortEarly: false,
          });

          if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            if (callback) {
              return callback({ success: false, error: errorMessage });
            }
            throw new CustomError(errorMessage, 400);
          }

          // Attach validated data
          mappedPayload[section] = value;
        }
      });

      // Combine validated params, query, and body for convenience
      payload.validatedData = {
        ...mappedPayload.params,
        ...mappedPayload.query,
        ...mappedPayload.body,
      };

      next(); // Proceed to the event logic
    } catch (error) {
      if (callback) {
        callback({ success: false, error: error.message });
      }
    }
  };
};

module.exports = validateSocketRequest;
