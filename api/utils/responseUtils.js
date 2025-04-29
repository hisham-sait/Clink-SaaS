/**
 * @fileoverview Utility functions for standardized API responses and error handling
 * This file provides consistent response formatting across all API endpoints
 */

/**
 * Creates a standardized success response
 * @param {Object|Array} data - The data to include in the response
 * @param {string} [message] - Optional success message
 * @param {Object} [pagination] - Optional pagination information
 * @returns {Object} Standardized success response object
 */
const successResponse = (data, message = null, pagination = null) => {
  const response = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return response;
};

/**
 * Creates a standardized error response
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Object} [details] - Optional additional error details
 * @returns {Object} Standardized error response object
 */
const errorResponse = (message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: message
  };

  if (details) {
    response.details = details;
  }

  return {
    statusCode,
    body: response
  };
};

/**
 * Standard error types with consistent status codes and messages
 */
const ErrorTypes = {
  NOT_FOUND: (resource = 'Resource') => errorResponse(`${resource} not found`, 404),
  UNAUTHORIZED: (message = 'Unauthorized') => errorResponse(message, 401),
  FORBIDDEN: (message = 'Access denied') => errorResponse(message, 403),
  BAD_REQUEST: (message = 'Invalid request') => errorResponse(message, 400),
  CONFLICT: (message = 'Resource already exists') => errorResponse(message, 409),
  INTERNAL: (message = 'Internal server error', details = null) => errorResponse(message, 500, details),
  VALIDATION: (errors) => errorResponse('Validation error', 400, { errors })
};

/**
 * Express middleware for handling errors consistently
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.message === 'Not found' || err.message.includes('not found')) {
    const resource = err.resource || 'Resource';
    const { statusCode, body } = ErrorTypes.NOT_FOUND(resource);
    return res.status(statusCode).json(body);
  }
  
  if (err.message === 'Access denied' || err.message === 'Unauthorized') {
    const { statusCode, body } = ErrorTypes.FORBIDDEN(err.message);
    return res.status(statusCode).json(body);
  }
  
  if (err.name === 'ValidationError') {
    const { statusCode, body } = ErrorTypes.VALIDATION(err.errors);
    return res.status(statusCode).json(body);
  }
  
  // Default to internal server error
  const { statusCode, body } = ErrorTypes.INTERNAL(
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    process.env.NODE_ENV === 'production' ? null : { stack: err.stack }
  );
  
  res.status(statusCode).json(body);
};

/**
 * Express middleware for handling async route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  successResponse,
  errorResponse,
  ErrorTypes,
  errorHandler,
  asyncHandler
};
