/**
 * API server entry point
 * Express.js REST API server for intelligent-todo application
 */

import express from 'express';
import cors from 'cors';
import { createLogger } from '@intelligent-todo/shared';

const logger = createLogger('api');
const app = express();
const PORT = process.env.PORT || 3001;

/**
 * Initialize Express application
 */
function initializeApp(): express.Application {
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // API root endpoint
  app.get('/api', (_req, res) => {
    res.json({
      message: '🎉 Welcome to intelligent-todo API!',
      version: '1.0.0',
      endpoints: ['/health', '/api'],
    });
  });

  return app;
}

/**
 * Start the server
 */
function startServer(): void {
  const server = app.listen(PORT, () => {
    logger.info('API server started', { port: PORT });
    console.log(`🚀 API server running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

// Initialize app
initializeApp();

// Start server if this is the main module
if (require.main === module) {
  startServer();
}

export { app, initializeApp, startServer };