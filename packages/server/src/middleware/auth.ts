/**
 * Authentication middleware using Clerk
 */

import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../config/clerk';
import { env } from '../config/env';

// Extend Express Request to include auth property
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
        claims?: Record<string, any>;
      };
    }
  }
}

/**
 * Verify Clerk JWT token and attach user info to request
 * In development with placeholder keys, skip auth validation
 */
export const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
  // Skip auth in development when using placeholder keys
  if (
    env.NODE_ENV === 'development' &&
    env.CLERK_SECRET_KEY.includes('placeholder')
  ) {
    // Mock auth for development
    req.auth = {
      userId: 'dev-user-id',
      sessionId: 'dev-session-id',
      claims: { role: 'admin' },
    };
    return next();
  }

  // Use real Clerk auth in production
  return requireAuth(req, res, next);
};

/**
 * Extract user ID from Clerk auth
 */
export const getUserId = (req: Request): string => {
  if (!req.auth?.userId) {
    throw new Error('Unauthorized: No user ID found');
  }
  return req.auth.userId;
};

/**
 * Optional auth - don't fail if no auth present
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If auth header present, verify it
  if (req.headers.authorization) {
    return verifyAuth(req, res, next);
  }
  // Otherwise, continue without auth
  next();
};
