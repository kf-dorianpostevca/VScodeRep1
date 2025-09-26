/**
 * Database utilities and helper functions for task operations.
 * Provides common database operations and schema validation.
 */

import Database from 'better-sqlite3';
import { createLogger } from './logger';

const logger = createLogger('database-utils');

/**
 * Validates if a string is a valid UUID format
 * @param id - String to validate as UUID
 * @returns True if valid UUID format
 * @example
 * ```typescript
 * const isValid = isValidUUID('123e4567-e89b-12d3-a456-426614174000'); // true
 * const isInvalid = isValidUUID('not-a-uuid'); // false
 * ```
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Generates a new UUID for task creation
 * @returns New UUID string
 * @example
 * ```typescript
 * const taskId = generateTaskId(); // "123e4567-e89b-12d3-a456-426614174000"
 * ```
 */
export function generateTaskId(): string {
  // Use crypto.randomUUID if available (Node.js 14.17.0+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback to manual UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Converts SQLite row data to proper JavaScript types
 * @param row - Raw SQLite row object
 * @returns Properly typed row object
 * @example
 * ```typescript
 * const rawRow = { created_at: '2025-09-26T10:00:00Z', is_completed: 1 };
 * const typedRow = convertSQLiteRow(rawRow);
 * // { created_at: Date, is_completed: boolean }
 * ```
 */
export function convertSQLiteRow(row: any): any {
  if (!row) return row;

  const converted = { ...row };

  // Convert datetime strings to Date objects
  if (converted.created_at && typeof converted.created_at === 'string') {
    converted.created_at = new Date(converted.created_at);
  }
  if (converted.completed_at && typeof converted.completed_at === 'string') {
    converted.completed_at = new Date(converted.completed_at);
  }

  // Convert SQLite integers to booleans
  if (typeof converted.is_completed === 'number') {
    converted.is_completed = converted.is_completed === 1;
  }

  // Parse JSON tags array
  if (converted.tags && typeof converted.tags === 'string') {
    try {
      converted.tags = JSON.parse(converted.tags);
    } catch (error) {
      logger.warn('Failed to parse tags JSON', { tags: converted.tags, error });
      converted.tags = [];
    }
  }

  return converted;
}

/**
 * Converts JavaScript objects to SQLite-compatible format
 * @param data - Object to convert for SQLite storage
 * @returns SQLite-compatible object
 * @example
 * ```typescript
 * const jsData = { created_at: new Date(), is_completed: true, tags: ['work'] };
 * const sqliteData = convertToSQLiteFormat(jsData);
 * // { created_at: '2025-09-26T10:00:00Z', is_completed: 1, tags: '["work"]' }
 * ```
 */
export function convertToSQLiteFormat(data: any): any {
  if (!data) return data;

  const converted = { ...data };

  // Convert Date objects to ISO strings
  if (converted.created_at instanceof Date) {
    converted.created_at = converted.created_at.toISOString();
  }
  if (converted.completed_at instanceof Date) {
    converted.completed_at = converted.completed_at.toISOString();
  }

  // Convert booleans to integers
  if (typeof converted.is_completed === 'boolean') {
    converted.is_completed = converted.is_completed ? 1 : 0;
  }

  // Convert tags array to JSON string
  if (Array.isArray(converted.tags)) {
    converted.tags = JSON.stringify(converted.tags);
  }

  return converted;
}

/**
 * Validates task data constraints before database operations
 * @param data - Task data to validate
 * @throws Error if validation fails
 * @example
 * ```typescript
 * try {
 *   validateTaskData({ title: 'Valid task' });
 *   // Validation passed
 * } catch (error) {
 *   console.error('Validation failed:', error.message);
 * }
 * ```
 */
export function validateTaskData(data: any): void {
  // Title validation
  if (data.title === undefined || data.title === null || typeof data.title !== 'string') {
    throw new Error('Task title is required and must be a string');
  }
  if (data.title.length === 0 || data.title.length > 200) {
    throw new Error('Task title must be between 1 and 200 characters');
  }

  // Description validation
  if (data.description !== null && data.description !== undefined) {
    if (typeof data.description !== 'string') {
      throw new Error('Task description must be a string or null');
    }
    if (data.description.length > 1000) {
      throw new Error('Task description cannot exceed 1000 characters');
    }
  }

  // Time estimate validation
  if (data.estimated_minutes !== null && data.estimated_minutes !== undefined) {
    if (typeof data.estimated_minutes !== 'number' || !Number.isInteger(data.estimated_minutes)) {
      throw new Error('Estimated minutes must be an integer or null');
    }
    if (data.estimated_minutes < 1 || data.estimated_minutes > 1440) {
      throw new Error('Estimated minutes must be between 1 and 1440 (1 day)');
    }
  }

  // Tags validation
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      throw new Error('Tags must be an array');
    }
    for (const tag of data.tags) {
      if (typeof tag !== 'string') {
        throw new Error('All tags must be strings');
      }
      if (tag.length === 0 || tag.length > 50) {
        throw new Error('Tag length must be between 1 and 50 characters');
      }
    }
  }
}

/**
 * Executes a database operation with proper error handling and logging
 * @param db - Database instance
 * @param operation - Function to execute
 * @param operationName - Name for logging purposes
 * @returns Operation result
 * @throws User-friendly error messages
 * @example
 * ```typescript
 * const result = executeWithErrorHandling(
 *   db,
 *   () => stmt.run(data),
 *   'create task'
 * );
 * ```
 */
export function executeWithErrorHandling<T>(
  _db: Database.Database,
  operation: () => T,
  operationName: string
): T {
  try {
    return operation();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Database operation failed: ${operationName}`, { error: errorMessage });

    // Transform technical errors into user-friendly messages
    if (errorMessage.includes('UNIQUE constraint failed')) {
      throw new Error('This task already exists. Please try a different title.');
    }
    if (errorMessage.includes('NOT NULL constraint failed')) {
      throw new Error('Required task information is missing. Please check all required fields.');
    }
    if (errorMessage.includes('CHECK constraint failed')) {
      throw new Error('Task information doesn\'t meet requirements. Please check field limits.');
    }
    if (errorMessage.includes('FOREIGN KEY constraint failed')) {
      throw new Error('Referenced task or data no longer exists.');
    }

    // Generic database error
    throw new Error(`Unable to complete task operation. Please try again.`);
  }
}