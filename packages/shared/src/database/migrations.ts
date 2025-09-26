/**
 * Database migration system
 * Handles schema versioning and migration execution
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { createLogger } from '../utils/logger';

const logger = createLogger('migrations');

/**
 * Migration information
 */
export interface Migration {
  /** Migration version number */
  version: number;
  /** Migration file name */
  filename: string;
  /** Migration SQL content */
  sql: string;
}

/**
 * Migration runner for database schema updates
 */
export class MigrationRunner {
  private db: Database.Database;
  private migrationsDir: string;

  /**
   * Creates a new migration runner
   * @param db - Database connection
   * @param migrationsDir - Directory containing migration files
   */
  constructor(db: Database.Database, migrationsDir?: string) {
    this.db = db;
    this.migrationsDir = migrationsDir || path.join(__dirname, '../../migrations');
  }

  /**
   * Runs all pending migrations
   * @returns Number of migrations applied
   * @throws Error if migration fails
   */
  public async runMigrations(): Promise<number> {
    logger.info('Starting database migrations');

    // Create migrations table if it doesn't exist
    this.createMigrationsTable();

    // Get current database version
    const currentVersion = this.getCurrentVersion();
    logger.info('Current database version', { version: currentVersion });

    // Load and sort migration files
    const migrations = this.loadMigrations();
    const pendingMigrations = migrations.filter(m => m.version > currentVersion);

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations found');
      return 0;
    }

    logger.info('Found pending migrations', { count: pendingMigrations.length });

    // Run migrations in transaction
    const transaction = this.db.transaction(() => {
      for (const migration of pendingMigrations) {
        this.runMigration(migration);
      }
    });

    try {
      transaction();
      logger.info('All migrations completed successfully', {
        applied: pendingMigrations.length
      });
      return pendingMigrations.length;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Migration failed', { error: errorMessage });
      throw new Error(`Migration failed: ${errorMessage}`);
    }
  }

  /**
   * Gets the current database version
   * @returns Current version number
   */
  private getCurrentVersion(): number {
    try {
      const result = this.db
        .prepare('SELECT version FROM migrations ORDER BY version DESC LIMIT 1')
        .get() as { version: number } | undefined;

      return result?.version || 0;
    } catch {
      // Table doesn't exist yet
      return 0;
    }
  }

  /**
   * Creates the migrations tracking table
   */
  private createMigrationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL UNIQUE,
        filename TEXT NOT NULL,
        executed_at DATETIME NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  /**
   * Loads migration files from the migrations directory
   * @returns Array of sorted migrations
   */
  private loadMigrations(): Migration[] {
    if (!fs.existsSync(this.migrationsDir)) {
      logger.warn('Migrations directory not found', { dir: this.migrationsDir });
      return [];
    }

    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    const migrations: Migration[] = [];

    for (const filename of files) {
      const match = filename.match(/^(\d+)_/);
      if (!match) {
        logger.warn('Ignoring migration file with invalid name format', { filename });
        continue;
      }

      const version = parseInt(match[1], 10);
      const filePath = path.join(this.migrationsDir, filename);
      const sql = fs.readFileSync(filePath, 'utf8');

      migrations.push({ version, filename, sql });
    }

    return migrations.sort((a, b) => a.version - b.version);
  }

  /**
   * Runs a single migration
   * @param migration - Migration to execute
   */
  private runMigration(migration: Migration): void {
    logger.info('Running migration', {
      version: migration.version,
      filename: migration.filename
    });

    try {
      // Execute migration SQL
      this.db.exec(migration.sql);

      // Record migration execution
      this.db
        .prepare('INSERT INTO migrations (version, filename) VALUES (?, ?)')
        .run(migration.version, migration.filename);

      logger.info('Migration completed', { version: migration.version });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Migration failed', {
        version: migration.version,
        filename: migration.filename,
        error: errorMessage
      });
      throw error;
    }
  }
}

/**
 * Initializes database with migrations
 * @param db - Database connection
 * @param migrationsDir - Optional migrations directory
 * @returns Number of migrations applied
 */
export async function initializeDatabase(
  db: Database.Database,
  migrationsDir?: string
): Promise<number> {
  const runner = new MigrationRunner(db, migrationsDir);
  return await runner.runMigrations();
}