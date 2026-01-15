/**
 * Database connection and Prisma client setup
 */

import { PrismaClient } from '@prisma/client';
import { config } from './env';

// Singleton Prisma client
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: config.server.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (config.server.nodeEnv !== 'production') {
  global.prisma = prisma;
}

// Graceful shutdown
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

// Health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};
