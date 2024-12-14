const Joi = require('joi');

// Validation schema for getting all chats
const getAllChatsSchema = {
  params: Joi.object({
    userId: Joi.string().required().messages({
      'string.base': 'userId must be a string',
      'any.required': 'userId is required',
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

// Validation schema for creating a chat
const createChatSchema = {
  body: Joi.object({
    chatTitle: Joi.string().min(3).max(100).required().messages({
      'string.base': 'chatTitle must be a string',
      'string.min': 'chatTitle must be at least 3 characters long',
      'string.max': 'chatTitle must not exceed 100 characters',
      'any.required': 'chatTitle is required',
    }),
    participants: Joi.array().items(Joi.string()).min(2).required().messages({
      'array.base': 'participants must be an array',
      'array.min': 'participants must contain at least 2 user IDs',
      'any.required': 'participants are required',
    }),
  }),
};

// Validation schema for updating a chat
const updateChatSchema = {
  params: Joi.object({
    chatId: Joi.string().required().messages({
      'string.base': 'chatId must be a string',
      'any.required': 'chatId is required',
    }),
  }),
  body: Joi.object({
    chatTitle: Joi.string().min(3).max(100).optional().messages({
      'string.base': 'chatTitle must be a string',
      'string.min': 'chatTitle must be at least 3 characters long',
      'string.max': 'chatTitle must not exceed 100 characters',
    }),
    participants: Joi.array().items(Joi.string()).min(2).optional().messages({
      'array.base': 'participants must be an array',
      'array.min': 'participants must contain at least 2 user IDs',
    }),
  }),
};

module.exports = {
  getAllChatsSchema,
  createChatSchema,
  updateChatSchema,
};
