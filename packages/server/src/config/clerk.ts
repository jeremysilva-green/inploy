/**
 * Clerk authentication configuration
 */

import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { config } from './env';

// Export Clerk middleware
export const requireAuth = ClerkExpressRequireAuth();

// Export configuration for client
export const clerkConfig = {
  publishableKey: config.clerk.publishableKey,
  secretKey: config.clerk.secretKey,
};
