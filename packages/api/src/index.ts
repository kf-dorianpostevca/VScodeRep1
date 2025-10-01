/**
 * API server entry point
 * Express.js REST API server for intelligent-todo application
 */

import express from 'express';
import cors from 'cors';
import { createLogger, createDatabaseConnection, SQLiteTaskRepository } from '@intelligent-todo/shared';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { performanceMonitor } from './middleware/performanceMonitor';

const logger = createLogger('api');
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize shared task repository for analytics BEFORE importing routes
export const taskRepository = new SQLiteTaskRepository(createDatabaseConnection());

// Import routes AFTER repository initialization
import { tasksRouter } from './routes/tasks';
import { docsRouter } from './routes/docs';
import { metricsRouter } from './routes/metrics';
import analyticsRouter from './routes/analytics';

/**
 * Initialize Express application
 */
function initializeApp(): express.Application {
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Performance monitoring middleware
  app.use(performanceMonitor);

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
      endpoints: [
        '/health',
        '/api',
        '/api/v1/tasks',
        '/api/v1/tasks/:id',
        '/api/v1/tasks/:id/complete',
        '/api/v1/analytics/monthly',
        '/api/v1/analytics/monthly/:year/:month'
      ],
      documentation: 'Visit /api/docs for full API documentation'
    });
  });

  // API v1 routes
  app.use('/api/v1/tasks', tasksRouter);
  app.use('/api/v1/analytics', analyticsRouter);

  // API documentation routes
  app.use('/api/docs', docsRouter);

  // Performance metrics routes
  app.use('/api/metrics', metricsRouter);

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

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