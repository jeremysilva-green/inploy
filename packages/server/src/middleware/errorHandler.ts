/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Global error handler
 */
export const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Safely log error without crashing on circular references
  console.error('Error occurred:', err.message || 'Unknown error');
  if (err.stack) {
    console.error('Stack:', err.stack);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: err.errors,
      },
    });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Resource already exists',
          code: 'DUPLICATE_ERROR',
          statusCode: 409,
          details: { field: err.meta?.target },
        },
      });
    }

    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Resource not found',
          code: 'NOT_FOUND',
          statusCode: 404,
        },
      });
    }

    // Foreign key constraint violation
    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid reference',
          code: 'FOREIGN_KEY_ERROR',
          statusCode: 400,
        },
      });
    }
  }

  // Custom API errors
  if ('statusCode' in err) {
    const apiErr = err as ApiError;
    return res.status(apiErr.statusCode || 500).json({
      success: false,
      error: {
        message: apiErr.message,
        code: apiErr.code || 'API_ERROR',
        statusCode: apiErr.statusCode || 500,
        details: apiErr.details,
      },
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    },
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
      statusCode: 404,
    },
  });
};

/**
 * Async handler wrapper to catch promise rejections
 */
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
