/**
 * Database connection and initialization utilities
 * Provides SQLite database connection with proper configuration
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createLogger } from '../utils/logger';

const logger = createLogger('database');

/**
 * Database connection options
 */
export interface DatabaseOptions {
  /** Database file path */
  filePath?: string;
  /** Enable read-only mode */
  readonly?: boolean;
  /** Enable foreign key constraints */
  foreignKeys?: boolean;
  /** Journal mode */
  journalMode?: 'DELETE' | 'TRUNCATE' | 'MEMORY' | 'WAL' | 'OFF';
}

/**
 * Creates and configures a SQLite database connection
 * @param options - Database configuration options
 * @returns Configured database instance
 */
export function createDatabaseConnection(options: DatabaseOptions = {}): Database.Database {
  const {
    filePath = path.join(os.homedir(), '.intelligent-todo', 'todo.db'),
    readonly = false,
    foreignKeys = true,
    journalMode = 'WAL',
  } = options;

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  logger.info('Opening database connection', { filePath, readonly });

  // Create database connection
  const db = new Database(filePath, { readonly });

  // Configure database settings
  db.pragma('journal_mode = ' + journalMode);
  if (foreignKeys) {
    db.pragma('foreign_keys = ON');
  }

  // Performance optimizations
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = 1000');
  db.pragma('temp_store = memory');

  return db;
}

/**
 * Creates an in-memory database for testing
 * @returns In-memory database instance
 */
export function createTestDatabase(): Database.Database {
  logger.info('Creating in-memory test database');

  const db = new Database(':memory:');

  // Configure test database
  db.pragma('journal_mode = MEMORY');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = OFF');

  return db;
}

/**
 * Closes database connection safely
 * @param db - Database instance to close
 */
export function closeDatabaseConnection(db: Database.Database): void {
  if (db.open) {
    logger.info('Closing database connection');
    db.close();
  }
}