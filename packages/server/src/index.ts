/**
 * InPloy API Server
 * Main entry point for the Express application
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { checkDatabaseConnection, disconnectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { clerkAuth } from './config/clerk';

// Import routes
import employersRouter from './routes/employers';
import checkinsRouter from './routes/checkins';
import metricsRouter from './routes/metrics';
import daysoffRouter from './routes/daysoff';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      config.server.nodeEnv === 'development'
        ? '*'
        : process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true,
  })
);

// Clerk authentication middleware
app.use(clerkAuth);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbConnected = await checkDatabaseConnection();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    environment: config.server.nodeEnv,
  });
});

// API routes
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/employers`, employersRouter);
app.use(`${API_PREFIX}/check-ins`, checkinsRouter);
app.use(`${API_PREFIX}/metrics`, metricsRouter);
app.use(`${API_PREFIX}/days-off`, daysoffRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Check database connection
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    console.log('✓ Database connected');

    // Start listening
    const server = app.listen(config.server.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 InPloy API Server                                    ║
║                                                           ║
║   Environment: ${config.server.nodeEnv.padEnd(43)}║
║   Port:        ${String(config.server.port).padEnd(43)}║
║   API URL:     ${config.server.apiUrl.padEnd(43)}║
║                                                           ║
║   Health:      ${`${config.server.apiUrl}/health`.padEnd(43)}║
║   API:         ${`${config.server.apiUrl}/api/v1`.padEnd(43)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('HTTP server closed');

        await disconnectDatabase();
        console.log('Database disconnected');

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
