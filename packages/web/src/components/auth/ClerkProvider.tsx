/**
 * Clerk Authentication Provider
 * Note: For web-only, we use @clerk/clerk-react instead of clerk-expo
 */

import React from 'react';
import { ClerkProvider as BaseClerkProvider, SignIn, SignUp, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY || '';

interface ClerkProviderProps {
  children: React.ReactNode;
}

export const ClerkProvider: React.FC<ClerkProviderProps> = ({ children }) => {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn('Clerk publishable key not found. Authentication will not work.');
  }

  return (
    <BaseClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      {children}
    </BaseClerkProvider>
  );
};

export { SignIn, SignUp, SignedIn, SignedOut, UserButton };
