/**
 * Database module exports
 * Provides database connection, migration, and utility functions
 */

export {
  createDatabaseConnection,
  createTestDatabase,
  closeDatabaseConnection,
  type DatabaseOptions,
} from './connection';

export {
  MigrationRunner,
  initializeDatabase,
  type Migration,
} from './migrations';