const Joi = require('joi');

// Validation schema for getting all chat messages
const getAllChatMessagesSchema = {
  params: Joi.object({
    chatId: Joi.string().required().messages({
      'string.base': 'chatId must be a string',
      'any.required': 'chatId is required',
    }),
  }),
  query: Joi.object({
    page: Joi.number().integer().positive().default(1).required().messages({
      'number.base': 'page must be a number',
      'number.positive': 'page must be a positive number',
      'any.required': 'page is required',

    }),
    limit: Joi.number().integer().positive().default(20).required().messages({
      'number.base': 'limit must be a number',
      'number.positive': 'limit must be a positive number',
      'any.required': 'limit is required',

    }),
  }),
};

module.exports ={getAllChatMessagesSchema}
