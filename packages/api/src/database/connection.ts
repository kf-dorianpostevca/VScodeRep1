/**
 * Database connection management for API
 * Ensures consistent database instances across requests and tests
 */

import Database from 'better-sqlite3';
import { createDatabaseConnection, initializeDatabase } from '@intelligent-todo/shared';
import { createLogger } from '@intelligent-todo/shared';

const logger = createLogger('api-database');

let databaseInstance: Database.Database | null = null;

/**
 * Get or create a database connection singleton
 * Uses in-memory database for tests, file database for production
 */
export function getDatabaseConnection(): Database.Database {
  if (!databaseInstance) {
    const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : process.env.TODO_DB_PATH || './data/todo.db';

    logger.info('Creating database connection', { path: dbPath, env: process.env.NODE_ENV });

    databaseInstance = createDatabaseConnection({ filePath: dbPath });

    // Initialize database with migrations
    initializeDatabase(databaseInstance);

    logger.info('Database initialized successfully');
  }

  return databaseInstance;
}

/**
 * Close the database connection (for cleanup in tests)
 */
export function closeDatabaseConnection(): void {
  if (databaseInstance) {
    databaseInstance.close();
    databaseInstance = null;
    logger.info('Database connection closed');
  }
}

/**
 * Reset database connection (for tests)
 */
export function resetDatabaseConnection(): void {
  closeDatabaseConnection();
  // Next call to getDatabaseConnection() will create a new instance
}