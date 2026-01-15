/**
 * Clerk authentication configuration
 */

import { clerkMiddleware, requireAuth as clerkRequireAuth } from '@clerk/express';
import { config } from './env';

// Export Clerk middleware
export const requireAuth = clerkRequireAuth();

// Export Clerk middleware (needed for Express app)
export const clerkAuth = clerkMiddleware();

// Export configuration for client
export const clerkConfig = {
  publishableKey: config.clerk.publishableKey,
  secretKey: config.clerk.secretKey,
};
