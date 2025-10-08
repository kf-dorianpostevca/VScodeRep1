/**
 * Error Handler Middleware
 * Centralized error handling for the Express application
 * Transforms technical errors into user-friendly messages with celebration-focused tone
 */

import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@intelligent-todo/shared';

const logger = createLogger('ErrorHandler');

/**
 * Global error handler middleware
 * Catches all unhandled errors and returns user-friendly responses
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error for debugging
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });

  // Don't send error response if headers already sent
  if (res.headersSent) {
    return next(error);
  }

  // Determine status code
  let statusCode = 500;
  let message = 'Oops! Something unexpected happened. Please try again.';
  let celebrationTip = 'Don\'t worry - your data is safe and we\'re here to help! 🌟';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Please check your input and try again.';
    celebrationTip = 'Getting the details right helps you stay organized! 📝';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format. Please check and try again.';
    celebrationTip = 'Double-check that task ID - we\'ve all been there! 🔍';
  } else if ((error as any).type === 'entity.parse.failed' || error.message.includes('Unexpected token') || error.message.includes('JSON')) {
    statusCode = 400;
    message = 'Invalid JSON format. Please check your request data.';
    celebrationTip = 'Double-check that JSON syntax - proper formatting keeps things smooth! 📝';
  } else if (error.message.includes('SQLITE_CONSTRAINT')) {
    statusCode = 400;
    message = 'That operation conflicts with existing data. Please try a different approach.';
    celebrationTip = 'Keeping data consistent helps maintain your task organization! ✨';
  } else if (error.message.includes('not found')) {
    statusCode = 404;
    message = 'The requested resource wasn\'t found.';
    celebrationTip = 'Check your task list to see what\'s available! 🔍';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    celebrationTip,
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        message: error.message,
        stack: error.stack
      }
    })
  });
}

/**
 * 404 handler for unknown endpoints
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `The endpoint ${req.method} ${req.path} doesn't exist.`,
    celebrationTip: 'Check the API documentation for available endpoints! 📚',
    availableEndpoints: [
      'GET /health',
      'GET /api',
      'GET /api/v1/tasks',
      'POST /api/v1/tasks',
      'GET /api/v1/tasks/:id',
      'PUT /api/v1/tasks/:id',
      'DELETE /api/v1/tasks/:id',
      'POST /api/v1/tasks/:id/complete'
    ]
  });
}