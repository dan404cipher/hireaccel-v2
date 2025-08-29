import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { logger } from '@/config/logger';
import { ApiError, ValidationIssue } from '@/types';
import { isDevelopment } from '@/config/env';

/**
 * Global error handling middleware
 * Converts various error types into standardized RFC7807 format
 */

/**
 * Create standardized error response following RFC7807
 */
const createErrorResponse = (
  status: number,
  title: string,
  detail: string,
  type?: string,
  issues?: ValidationIssue[]
): ApiError => ({
  type: type || `https://httpstatuses.com/${status}`,
  title,
  status,
  detail,
  ...(issues && { issues }),
});

/**
 * Handle Zod validation errors
 */
const handleZodError = (error: ZodError): ApiError => {
  const issues: ValidationIssue[] = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return createErrorResponse(
    400,
    'Validation Error',
    'The request contains invalid data',
    'https://tools.ietf.org/html/rfc7231#section-6.5.1',
    issues
  );
};

/**
 * Handle Mongoose validation errors
 */
const handleMongooseValidationError = (error: mongoose.Error.ValidationError): ApiError => {
  const issues: ValidationIssue[] = Object.values(error.errors).map((err) => ({
    field: err.path,
    message: err.message,
    code: 'invalid_type',
  }));

  return createErrorResponse(
    400,
    'Database Validation Error',
    'The data violates database constraints',
    'https://tools.ietf.org/html/rfc7231#section-6.5.1',
    issues
  );
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleMongoDuplicateKeyError = (error: any): ApiError => {
  const field = Object.keys(error.keyValue || {})[0];
  const value = field && error.keyValue ? error.keyValue[field] : 'unknown';

  return createErrorResponse(
    409,
    'Duplicate Resource',
    `A resource with ${field} '${value}' already exists`,
    'https://tools.ietf.org/html/rfc7231#section-6.5.8'
  );
};

/**
 * Handle Mongoose cast errors (invalid ObjectId, etc.)
 */
const handleMongoCastError = (error: mongoose.Error.CastError): ApiError => {
  return createErrorResponse(
    400,
    'Invalid Resource ID',
    `Invalid ${error.path}: ${error.value}`,
    'https://tools.ietf.org/html/rfc7231#section-6.5.1'
  );
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error: any): ApiError => {
  if (error.name === 'JsonWebTokenError') {
    return createErrorResponse(
      401,
      'Invalid Token',
      'The provided authentication token is invalid',
      'https://tools.ietf.org/html/rfc7235#section-3.1'
    );
  }

  if (error.name === 'TokenExpiredError') {
    return createErrorResponse(
      401,
      'Token Expired',
      'The authentication token has expired',
      'https://tools.ietf.org/html/rfc7235#section-3.1'
    );
  }

  return createErrorResponse(
    401,
    'Authentication Error',
    error.message,
    'https://tools.ietf.org/html/rfc7235#section-3.1'
  );
};

/**
 * Main error handling middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let errorResponse: ApiError;

  // Log the error for debugging
  logger.error('Error caught by error handler', {
    error: {
      name: error.name,
      message: error.message,
      stack: isDevelopment() ? error.stack : undefined,
    },
    request: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

  // Handle specific error types
  if (error instanceof ZodError) {
    errorResponse = handleZodError(error);
  } else if (error instanceof mongoose.Error.ValidationError) {
    errorResponse = handleMongooseValidationError(error);
  } else if (error.code === 11000) {
    // MongoDB duplicate key error
    errorResponse = handleMongoDuplicateKeyError(error);
  } else if (error instanceof mongoose.Error.CastError) {
    errorResponse = handleMongoCastError(error);
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    errorResponse = handleJWTError(error);
  } else if (error.status || error.statusCode) {
    // Error with status code (probably from middleware)
    errorResponse = createErrorResponse(
      error.status || error.statusCode,
      error.title || 'Request Error',
      error.message || 'An error occurred while processing the request'
    );
  } else {
    // Generic server error
    errorResponse = createErrorResponse(
      500,
      'Internal Server Error',
      isDevelopment() 
        ? error.message || 'An unexpected error occurred'
        : 'An unexpected error occurred. Please try again later.'
    );
  }

  // Add instance identifier for tracking
  errorResponse.instance = `${req.method} ${req.originalUrl}`;

  // Send error response
  res.status(errorResponse.status).json(errorResponse);
};

/**
 * Handle 404 errors for unknown routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse = createErrorResponse(
    404,
    'Resource Not Found',
    `The requested resource ${req.method} ${req.originalUrl} was not found`,
    'https://tools.ietf.org/html/rfc7231#section-6.5.4'
  );

  errorResponse.instance = `${req.method} ${req.originalUrl}`;

  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(404).json(errorResponse);
};

/**
 * Async error wrapper utility
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  public readonly status: number;
  public readonly title: string;
  public readonly type?: string;
  public readonly issues?: ValidationIssue[];

  constructor(
    status: number,
    title: string,
    message: string,
    type?: string,
    issues?: ValidationIssue[]
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.title = title;
    if (type) this.type = type;
    if (issues) this.issues = issues;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error factory functions
 */
export const createNotFoundError = (resource: string, id?: string) => {
  const detail = id 
    ? `${resource} with ID '${id}' was not found`
    : `${resource} was not found`;
  
  return new AppError(404, 'Resource Not Found', detail);
};

export const createUnauthorizedError = (message = 'Authentication required') => {
  return new AppError(401, 'Unauthorized', message);
};

export const createForbiddenError = (message = 'Insufficient permissions') => {
  return new AppError(403, 'Forbidden', message);
};

export const createBadRequestError = (message: string, issues?: ValidationIssue[]) => {
  return new AppError(400, 'Bad Request', message, undefined, issues);
};

export const createConflictError = (message: string) => {
  return new AppError(409, 'Conflict', message);
};

export const createInternalError = (message = 'An internal error occurred') => {
  return new AppError(500, 'Internal Server Error', message);
};
