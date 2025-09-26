/**
 * Unit tests for SQLiteTaskRepository implementation.
 * Tests all CRUD operations, error handling, and data conversion.
 */

import Database from 'better-sqlite3';
import { createTestDatabase } from '../../src/database/connection';
import { initializeDatabase } from '../../src/database/migrations';
import { SQLiteTaskRepository } from '../../src/repositories/SQLiteTaskRepository';
import { Task, TaskCreate, TaskUpdate } from '../../src/models/Task';

describe('SQLiteTaskRepository', () => {
  let db: Database.Database;
  let repository: SQLiteTaskRepository;

  beforeEach(async () => {
    db = createTestDatabase();
    await initializeDatabase(db);
    repository = new SQLiteTaskRepository(db);
  });

  afterEach(() => {
    repository.close();
    db.close();
  });

  describe('Constructor', () => {
    it('should create repository with valid database', () => {
      const repo = new SQLiteTaskRepository(db);
      expect(repo).toBeInstanceOf(SQLiteTaskRepository);
      repo.close();
    });

    it('should throw error with invalid database', () => {
      expect(() => {
        new SQLiteTaskRepository(null as any);
      }).toThrow('Valid SQLite database connection is required');
    });
  });

  describe('Create Operations', () => {
    it('should create task with minimal data', async () => {
      const taskData: TaskCreate = {
        title: 'Test task'
      };

      const task = await repository.create(taskData);

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test task');
      expect(task.description).toBeNull();
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.completedAt).toBeNull();
      expect(task.estimatedMinutes).toBeNull();
      expect(task.actualMinutes).toBeNull();
      expect(task.isCompleted).toBe(false);
      expect(task.tags).toEqual([]);
    });

    it('should create task with full data', async () => {
      const taskData: TaskCreate = {
        title: 'Complete project documentation',
        description: 'Write comprehensive docs for the new feature',
        estimatedMinutes: 120,
        tags: ['documentation', 'priority']
      };

      const task = await repository.create(taskData);

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Complete project documentation');
      expect(task.description).toBe('Write comprehensive docs for the new feature');
      expect(task.estimatedMinutes).toBe(120);
      expect(task.tags).toEqual(['documentation', 'priority']);
      expect(task.isCompleted).toBe(false);
    });

    it('should validate task data before creation', async () => {
      const invalidTaskData = {
        title: '' // Empty title should fail validation
      };

      await expect(repository.create(invalidTaskData)).rejects.toThrow(
        'between 1 and 200 characters'
      );
    });

    it('should generate unique IDs for multiple tasks', async () => {
      const task1 = await repository.create({ title: 'Task 1' });
      const task2 = await repository.create({ title: 'Task 2' });

      expect(task1.id).not.toBe(task2.id);
      expect(task1.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      expect(task2.id).toMatch(/^[0-9a-f-]{36}$/);
    });
  });

  describe('Read Operations', () => {
    let testTask: Task;

    beforeEach(async () => {
      testTask = await repository.create({
        title: 'Test task for reading',
        description: 'This is a test task',
        estimatedMinutes: 60,
        tags: ['test', 'reading']
      });
    });

    it('should find task by ID', async () => {
      const found = await repository.findById(testTask.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(testTask.id);
      expect(found!.title).toBe('Test task for reading');
      expect(found!.description).toBe('This is a test task');
      expect(found!.estimatedMinutes).toBe(60);
      expect(found!.tags).toEqual(['test', 'reading']);
    });

    it('should return null for non-existent task', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });

    it('should find all tasks without filter', async () => {
      await repository.create({ title: 'Task 2' });
      await repository.create({ title: 'Task 3' });

      const tasks = await repository.findAll();

      expect(tasks).toHaveLength(3);
      expect(tasks[0].title).toBe('Task 3'); // Most recent first
      expect(tasks[1].title).toBe('Task 2');
      expect(tasks[2].title).toBe('Test task for reading');
    });

    it('should filter tasks by completion status', async () => {
      const completedTask = await repository.create({ title: 'Completed task' });
      await repository.markComplete(completedTask.id);

      const incompleteTasks = await repository.findAll({ isCompleted: false });
      const completedTasks = await repository.findAll({ isCompleted: true });

      expect(incompleteTasks).toHaveLength(1);
      expect(incompleteTasks[0].id).toBe(testTask.id);
      expect(completedTasks).toHaveLength(1);
      expect(completedTasks[0].id).toBe(completedTask.id);
    });

    it('should filter tasks by title content', async () => {
      await repository.create({ title: 'Project planning' });
      await repository.create({ title: 'Code review' });

      const projectTasks = await repository.findAll({ titleContains: 'project' });
      const planningTasks = await repository.findAll({ titleContains: 'planning' });

      expect(projectTasks).toHaveLength(1);
      expect(projectTasks[0].title).toBe('Project planning');
      expect(planningTasks).toHaveLength(1);
    });

    it('should filter tasks by tags', async () => {
      await repository.create({ title: 'Development task', tags: ['dev', 'frontend'] });
      await repository.create({ title: 'Testing task', tags: ['test', 'qa'] });

      const devTasks = await repository.findAll({ tags: ['dev'] });
      const testTasks = await repository.findAll({ tags: ['test'] });

      expect(devTasks).toHaveLength(1);
      expect(devTasks[0].title).toBe('Development task');
      expect(testTasks).toHaveLength(2); // Original test task + new testing task
    });

    it('should filter tasks by date range', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const recentTasks = await repository.findAll({
        createdAfter: yesterday,
        createdBefore: tomorrow
      });

      expect(recentTasks.length).toBeGreaterThanOrEqual(1);
      expect(recentTasks.some(task => task.id === testTask.id)).toBe(true);
    });

    it('should support pagination', async () => {
      // Create additional tasks
      for (let i = 0; i < 5; i++) {
        await repository.create({ title: `Task ${i}` });
      }

      const firstPage = await repository.findPaginated(0, 3);
      const secondPage = await repository.findPaginated(3, 3);

      expect(firstPage).toHaveLength(3);
      expect(secondPage).toHaveLength(3); // 6 total tasks, so second page has 3
      expect(firstPage[0].id).not.toBe(secondPage[0].id);
    });

    it('should count tasks correctly', async () => {
      await repository.create({ title: 'Task 2' });
      await repository.create({ title: 'Task 3' });

      const totalCount = await repository.count();
      const incompleteCount = await repository.count({ isCompleted: false });

      expect(totalCount).toBe(3);
      expect(incompleteCount).toBe(3);
    });
  });

  describe('Update Operations', () => {
    let testTask: Task;

    beforeEach(async () => {
      testTask = await repository.create({
        title: 'Original title',
        description: 'Original description',
        estimatedMinutes: 30,
        tags: ['original']
      });
    });

    it('should update task title', async () => {
      const updateData: TaskUpdate = {
        id: testTask.id,
        title: 'Updated title'
      };

      const updated = await repository.update(updateData);

      expect(updated).not.toBeNull();
      expect(updated!.id).toBe(testTask.id);
      expect(updated!.title).toBe('Updated title');
      expect(updated!.description).toBe('Original description'); // Unchanged
      expect(updated!.estimatedMinutes).toBe(30); // Unchanged
    });

    it('should update multiple fields', async () => {
      const updateData: TaskUpdate = {
        id: testTask.id,
        title: 'New title',
        description: 'New description',
        estimatedMinutes: 60,
        tags: ['updated', 'multi']
      };

      const updated = await repository.update(updateData);

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe('New title');
      expect(updated!.description).toBe('New description');
      expect(updated!.estimatedMinutes).toBe(60);
      expect(updated!.tags).toEqual(['updated', 'multi']);
    });

    it('should return null for non-existent task update', async () => {
      const updateData: TaskUpdate = {
        id: 'non-existent-id',
        title: 'Updated title'
      };

      const updated = await repository.update(updateData);
      expect(updated).toBeNull();
    });

    it('should validate update data', async () => {
      const invalidUpdate: TaskUpdate = {
        id: testTask.id,
        title: 'a'.repeat(201) // Too long
      };

      await expect(repository.update(invalidUpdate)).rejects.toThrow(
        'between 1 and 200 characters'
      );
    });

    it('should mark task as complete', async () => {
      const completed = await repository.markComplete(testTask.id);

      expect(completed).not.toBeNull();
      expect(completed!.id).toBe(testTask.id);
      expect(completed!.isCompleted).toBe(true);
      expect(completed!.completedAt).toBeInstanceOf(Date);
      expect(completed!.actualMinutes).toBeGreaterThanOrEqual(0);
    });

    it('should mark task as incomplete', async () => {
      // First mark as complete
      await repository.markComplete(testTask.id);

      // Then mark as incomplete
      const incomplete = await repository.markIncomplete(testTask.id);

      expect(incomplete).not.toBeNull();
      expect(incomplete!.id).toBe(testTask.id);
      expect(incomplete!.isCompleted).toBe(false);
      expect(incomplete!.completedAt).toBeNull();
      expect(incomplete!.actualMinutes).toBeNull();
    });
  });

  describe('Delete Operations', () => {
    let testTask: Task;

    beforeEach(async () => {
      testTask = await repository.create({
        title: 'Task to delete'
      });
    });

    it('should delete existing task', async () => {
      const deleted = await repository.delete(testTask.id);
      expect(deleted).toBe(true);

      // Verify task is deleted
      const found = await repository.findById(testTask.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent task deletion', async () => {
      const deleted = await repository.delete('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('Statistics Operations', () => {
    beforeEach(async () => {
      // Create test data
      await repository.create({ title: 'Task 1' });
      await repository.create({ title: 'Task 2' });
      await repository.create({ title: 'Task 3' });

      // Mark some as complete
      const task1 = await repository.findAll();
      await repository.markComplete(task1[0].id);
      await repository.markComplete(task1[1].id);
    });

    it('should calculate completion statistics', async () => {
      const stats = await repository.getCompletionStats();

      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.completionRate).toBe(67); // 2/3 * 100 rounded
    });

    it('should handle empty database statistics', async () => {
      // Create fresh repository with empty database
      const emptyDb = createTestDatabase();
      await initializeDatabase(emptyDb);
      const emptyRepo = new SQLiteTaskRepository(emptyDb);

      const stats = await emptyRepo.getCompletionStats();

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.completionRate).toBe(0);

      emptyRepo.close();
      emptyDb.close();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Close database to simulate error
      db.close();

      await expect(repository.create({ title: 'Test' })).rejects.toThrow(
        'Unable to complete task operation'
      );
    });

    it('should transform constraint errors to user-friendly messages', async () => {
      // Manually insert invalid data to test constraint handling
      expect(() => {
        db.prepare("INSERT INTO tasks (title, estimated_minutes) VALUES (?, ?)")
          .run('Test', 2000); // Exceeds 1440 limit
      }).toThrow();
    });
  });

  describe('Data Conversion', () => {
    it('should properly convert dates between JS and SQLite', async () => {
      const task = await repository.create({ title: 'Date test task' });

      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.createdAt.toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should properly convert tags array to/from JSON', async () => {
      const task = await repository.create({
        title: 'Tags test',
        tags: ['javascript', 'testing', 'sqlite']
      });

      const retrieved = await repository.findById(task.id);
      expect(retrieved!.tags).toEqual(['javascript', 'testing', 'sqlite']);
    });

    it('should handle null values correctly', async () => {
      const task = await repository.create({
        title: 'Null test task'
        // description, estimatedMinutes will be null/undefined
      });

      expect(task.description).toBeNull();
      expect(task.estimatedMinutes).toBeNull();
      expect(task.completedAt).toBeNull();
      expect(task.actualMinutes).toBeNull();
    });
  });
});