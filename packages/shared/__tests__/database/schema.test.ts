/**
 * Tests for database schema setup and migration system.
 * Ensures proper table creation, constraints, and data integrity.
 */

import Database from 'better-sqlite3';
import { createTestDatabase } from '../../src/database/connection';
import { initializeDatabase } from '../../src/database/migrations';
import { generateTaskId, validateTaskData, convertSQLiteRow, convertToSQLiteFormat } from '../../src/utils/database';

describe('Database Schema Setup', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDatabase();
  });

  afterEach(() => {
    db.close();
  });

  describe('Schema Migration', () => {
    it('should apply migrations successfully', async () => {
      const migrationsApplied = await initializeDatabase(db);
      expect(migrationsApplied).toBeGreaterThanOrEqual(0);

      // Verify migrations table exists
      const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'").get();
      expect(result).toBeDefined();
    });

    it('should create tasks table with proper structure', async () => {
      await initializeDatabase(db);

      // Check table exists
      const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'").get();
      expect(table).toBeDefined();

      // Check table schema
      const schema = db.prepare("PRAGMA table_info(tasks)").all();
      const columnNames = schema.map((col: any) => col.name);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('title');
      expect(columnNames).toContain('description');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('completed_at');
      expect(columnNames).toContain('estimated_minutes');
      expect(columnNames).toContain('actual_minutes');
      expect(columnNames).toContain('is_completed');
      expect(columnNames).toContain('tags');
    });

    it('should create proper indexes', async () => {
      await initializeDatabase(db);

      // Check indexes exist
      const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all();
      const indexNames = indexes.map((idx: any) => idx.name);

      expect(indexNames).toContain('idx_tasks_is_completed');
      expect(indexNames).toContain('idx_tasks_created_at');
      expect(indexNames).toContain('idx_tasks_completed_at');
    });

    it('should create triggers for timestamp management', async () => {
      await initializeDatabase(db);

      // Check triggers exist
      const triggers = db.prepare("SELECT name FROM sqlite_master WHERE type='trigger'").all();
      const triggerNames = triggers.map((trigger: any) => trigger.name);

      expect(triggerNames).toContain('update_tasks_timestamp');
      expect(triggerNames).toContain('calculate_actual_minutes_on_completion');
    });
  });

  describe('Data Constraints', () => {
    beforeEach(async () => {
      await initializeDatabase(db);
    });

    it('should enforce title length constraints', () => {
      // Empty title should fail
      expect(() => {
        db.prepare("INSERT INTO tasks (title) VALUES ('')").run();
      }).toThrow();

      // Title too long should fail (>200 chars)
      const longTitle = 'a'.repeat(201);
      expect(() => {
        db.prepare("INSERT INTO tasks (title) VALUES (?)").run(longTitle);
      }).toThrow();

      // Valid title should succeed
      expect(() => {
        db.prepare("INSERT INTO tasks (title) VALUES (?)").run('Valid task');
      }).not.toThrow();
    });

    it('should enforce description length constraints', () => {
      // Description too long should fail (>1000 chars)
      const longDescription = 'a'.repeat(1001);
      expect(() => {
        db.prepare("INSERT INTO tasks (title, description) VALUES (?, ?)").run('Task', longDescription);
      }).toThrow();

      // Valid description should succeed
      const validDescription = 'a'.repeat(1000);
      expect(() => {
        db.prepare("INSERT INTO tasks (title, description) VALUES (?, ?)").run('Task', validDescription);
      }).not.toThrow();
    });

    it('should enforce time constraints', () => {
      // Zero minutes should fail
      expect(() => {
        db.prepare("INSERT INTO tasks (title, estimated_minutes) VALUES (?, ?)").run('Task', 0);
      }).toThrow();

      // Too many minutes should fail (>1440)
      expect(() => {
        db.prepare("INSERT INTO tasks (title, estimated_minutes) VALUES (?, ?)").run('Task', 1441);
      }).toThrow();

      // Valid minutes should succeed
      expect(() => {
        db.prepare("INSERT INTO tasks (title, estimated_minutes) VALUES (?, ?)").run('Task', 60);
      }).not.toThrow();
    });

    it('should validate tags JSON format', () => {
      // Invalid JSON should fail
      expect(() => {
        db.prepare("INSERT INTO tasks (title, tags) VALUES (?, ?)").run('Task', 'invalid-json');
      }).toThrow();

      // Valid JSON array should succeed
      expect(() => {
        db.prepare("INSERT INTO tasks (title, tags) VALUES (?, ?)").run('Task', '["tag1", "tag2"]');
      }).not.toThrow();
    });

    it('should set proper default values', () => {
      const result = db.prepare("INSERT INTO tasks (title) VALUES (?) RETURNING *").get('Test task') as any;

      expect(result.id).toBeDefined();
      expect(result.title).toBe('Test task');
      expect(result.description).toBeNull();
      expect(result.created_at).toBeDefined();
      expect(result.completed_at).toBeNull();
      expect(result.estimated_minutes).toBeNull();
      expect(result.actual_minutes).toBeNull();
      expect(result.is_completed).toBe(0);
      expect(result.tags).toBe('[]');
    });
  });

  describe('Automatic Timestamp Capture', () => {
    beforeEach(async () => {
      await initializeDatabase(db);
    });

    it('should set created_at automatically', () => {
      const beforeInsert = new Date();
      const result = db.prepare("INSERT INTO tasks (title) VALUES (?) RETURNING *").get('Test task') as any;
      const afterInsert = new Date();

      expect(result.created_at).toBeDefined();
      expect(result.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO format

      const createdAt = new Date(result.created_at);
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeInsert.getTime() - 5000); // 5 second tolerance
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterInsert.getTime() + 5000);
    });

    it('should set completed_at when task is marked complete', () => {
      // Insert task
      const task = db.prepare("INSERT INTO tasks (title) VALUES (?) RETURNING *").get('Test task') as any;
      expect(task.completed_at).toBeNull();

      // Mark as complete
      const beforeComplete = new Date();
      db.prepare("UPDATE tasks SET is_completed = 1 WHERE id = ?").run(task.id);
      const afterComplete = new Date();

      // Check completed_at was set
      const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(task.id) as any;
      expect(updatedTask.completed_at).not.toBeNull();
      expect(updatedTask.completed_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO format

      const completedAt = new Date(updatedTask.completed_at);
      expect(completedAt.getTime()).toBeGreaterThanOrEqual(beforeComplete.getTime() - 5000); // 5 second tolerance
      expect(completedAt.getTime()).toBeLessThanOrEqual(afterComplete.getTime() + 5000);
    });

    it('should calculate actual_minutes on completion', () => {
      // Insert task with estimated time
      const task = db.prepare("INSERT INTO tasks (title, estimated_minutes) VALUES (?, ?) RETURNING *")
        .get('Test task', 30) as any;

      // Mark as complete
      db.prepare("UPDATE tasks SET is_completed = 1 WHERE id = ?").run(task.id);

      // Check actual_minutes was calculated
      const completedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(task.id) as any;
      expect(completedTask.actual_minutes).not.toBeNull();
      expect(completedTask.actual_minutes).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Database Utilities', () => {
  describe('UUID Generation', () => {
    it('should generate valid UUIDs', () => {
      const uuid = generateTaskId();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateTaskId();
      const uuid2 = generateTaskId();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('Data Validation', () => {
    it('should validate task title', () => {
      expect(() => validateTaskData({ title: 'Valid title' })).not.toThrow();

      expect(() => validateTaskData({ title: '' })).toThrow('between 1 and 200');
      expect(() => validateTaskData({ title: 'a'.repeat(201) })).toThrow('between 1 and 200');
      expect(() => validateTaskData({})).toThrow('required');
    });

    it('should validate task description', () => {
      expect(() => validateTaskData({ title: 'Test', description: null })).not.toThrow();
      expect(() => validateTaskData({ title: 'Test', description: 'Valid description' })).not.toThrow();

      expect(() => validateTaskData({ title: 'Test', description: 'a'.repeat(1001) })).toThrow('1000 characters');
    });

    it('should validate estimated minutes', () => {
      expect(() => validateTaskData({ title: 'Test', estimated_minutes: null })).not.toThrow();
      expect(() => validateTaskData({ title: 'Test', estimated_minutes: 60 })).not.toThrow();

      expect(() => validateTaskData({ title: 'Test', estimated_minutes: 0 })).toThrow('between 1 and 1440');
      expect(() => validateTaskData({ title: 'Test', estimated_minutes: 1441 })).toThrow('between 1 and 1440');
    });

    it('should validate tags array', () => {
      expect(() => validateTaskData({ title: 'Test', tags: [] })).not.toThrow();
      expect(() => validateTaskData({ title: 'Test', tags: ['tag1', 'tag2'] })).not.toThrow();

      expect(() => validateTaskData({ title: 'Test', tags: 'not-array' })).toThrow('must be an array');
      expect(() => validateTaskData({ title: 'Test', tags: [''] })).toThrow('between 1 and 50');
      expect(() => validateTaskData({ title: 'Test', tags: ['a'.repeat(51)] })).toThrow('between 1 and 50');
    });
  });

  describe('Data Conversion', () => {
    it('should convert SQLite row to proper types', () => {
      const sqliteRow = {
        id: 'test-id',
        title: 'Test task',
        created_at: '2025-09-26T10:00:00.000Z',
        completed_at: null,
        is_completed: 0,
        tags: '["tag1", "tag2"]'
      };

      const converted = convertSQLiteRow(sqliteRow);

      expect(converted.created_at).toBeInstanceOf(Date);
      expect(converted.is_completed).toBe(false);
      expect(converted.tags).toEqual(['tag1', 'tag2']);
    });

    it('should convert JavaScript data to SQLite format', () => {
      const jsData = {
        title: 'Test task',
        created_at: new Date('2025-09-26T10:00:00.000Z'),
        is_completed: true,
        tags: ['tag1', 'tag2']
      };

      const converted = convertToSQLiteFormat(jsData);

      expect(converted.created_at).toBe('2025-09-26T10:00:00.000Z');
      expect(converted.is_completed).toBe(1);
      expect(converted.tags).toBe('["tag1","tag2"]');
    });
  });
});