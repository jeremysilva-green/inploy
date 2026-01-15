/**
 * Role-based access control middleware
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@inploy/shared';
import { prisma } from '../config/database';
import { getUserId } from './auth';
import { env } from '../config/env';

/**
 * Check if user has required role
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clerkId = getUserId(req);

      // Skip database check in development with placeholder keys
      if (
        env.NODE_ENV === 'development' &&
        env.CLERK_SECRET_KEY.includes('placeholder') &&
        clerkId === 'dev-user-id'
      ) {
        // Mock admin user for development
        req.user = { id: 'dev-user-id', role: UserRole.ADMIN };
        return next();
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { role: true, id: true },
      });

      if (!user) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'User not found in database',
            code: 'USER_NOT_FOUND',
            statusCode: 403,
          },
        });
      }

      // Check if user has required role
      if (!allowedRoles.includes(user.role as UserRole)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Insufficient permissions',
            code: 'FORBIDDEN',
            statusCode: 403,
          },
        });
      }

      // Attach user info to request
      req.user = { id: user.id, role: user.role as UserRole };

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Admin only middleware
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Check if user is accessing their own resource
 */
export const requireSelfOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clerkId = getUserId(req);
    const resourceEmployerId = req.params.employerId || req.body.employerId;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { employer: true },
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          statusCode: 403,
        },
      });
    }

    // Admins can access any resource
    if (user.role === UserRole.ADMIN) {
      req.user = { id: user.id, role: user.role as UserRole };
      return next();
    }

    // Employers can only access their own resource
    if (user.employer && user.employer.id === resourceEmployerId) {
      req.user = { id: user.id, role: user.role as UserRole };
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        message: 'Cannot access another employer\'s resource',
        code: 'FORBIDDEN',
        statusCode: 403,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
}
