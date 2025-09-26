/**
 * Unit tests for Task data model interfaces and type definitions.
 * Tests type safety, validation logic, and interface contracts.
 */

import { Task, TaskCreate, TaskUpdate, TaskFilter } from '../../src/models/Task.js';

describe('Task Model Interfaces', () => {
  describe('Task Interface', () => {
    it('should define a complete task with all required fields', () => {
      const task: Task = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Complete project documentation',
        description: 'Write comprehensive docs for the new feature',
        createdAt: new Date('2025-09-26T10:00:00Z'),
        completedAt: null,
        estimatedMinutes: 60,
        actualMinutes: null,
        isCompleted: false,
        tags: ['documentation', 'priority']
      };

      expect(task.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(task.title).toBe('Complete project documentation');
      expect(task.description).toBe('Write comprehensive docs for the new feature');
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.completedAt).toBeNull();
      expect(task.estimatedMinutes).toBe(60);
      expect(task.actualMinutes).toBeNull();
      expect(task.isCompleted).toBe(false);
      expect(task.tags).toEqual(['documentation', 'priority']);
    });

    it('should allow null description and timestamps', () => {
      const task: Task = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Simple task',
        description: null,
        createdAt: new Date(),
        completedAt: null,
        estimatedMinutes: null,
        actualMinutes: null,
        isCompleted: false,
        tags: []
      };

      expect(task.description).toBeNull();
      expect(task.completedAt).toBeNull();
      expect(task.estimatedMinutes).toBeNull();
      expect(task.actualMinutes).toBeNull();
      expect(task.tags).toEqual([]);
    });

    it('should support completed task with completion timestamp', () => {
      const completedAt = new Date('2025-09-26T11:00:00Z');
      const task: Task = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Completed task',
        description: null,
        createdAt: new Date('2025-09-26T10:00:00Z'),
        completedAt,
        estimatedMinutes: 30,
        actualMinutes: 60,
        isCompleted: true,
        tags: ['done']
      };

      expect(task.completedAt).toEqual(completedAt);
      expect(task.actualMinutes).toBe(60);
      expect(task.isCompleted).toBe(true);
    });
  });

  describe('TaskCreate Interface', () => {
    it('should create task with minimal required fields', () => {
      const taskCreate: TaskCreate = {
        title: 'New task'
      };

      expect(taskCreate.title).toBe('New task');
      expect(taskCreate.description).toBeUndefined();
      expect(taskCreate.estimatedMinutes).toBeUndefined();
      expect(taskCreate.tags).toBeUndefined();
    });

    it('should create task with all optional fields', () => {
      const taskCreate: TaskCreate = {
        title: 'Complete feature',
        description: 'Implement user authentication',
        estimatedMinutes: 120,
        tags: ['auth', 'feature']
      };

      expect(taskCreate.title).toBe('Complete feature');
      expect(taskCreate.description).toBe('Implement user authentication');
      expect(taskCreate.estimatedMinutes).toBe(120);
      expect(taskCreate.tags).toEqual(['auth', 'feature']);
    });

    it('should allow null values for optional fields', () => {
      const taskCreate: TaskCreate = {
        title: 'Task with nulls',
        description: null,
        estimatedMinutes: null,
        tags: []
      };

      expect(taskCreate.title).toBe('Task with nulls');
      expect(taskCreate.description).toBeNull();
      expect(taskCreate.estimatedMinutes).toBeNull();
      expect(taskCreate.tags).toEqual([]);
    });
  });

  describe('TaskUpdate Interface', () => {
    it('should update task with minimal fields', () => {
      const taskUpdate: TaskUpdate = {
        id: '123e4567-e89b-12d3-a456-426614174000'
      };

      expect(taskUpdate.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(taskUpdate.title).toBeUndefined();
    });

    it('should update task with all optional fields', () => {
      const taskUpdate: TaskUpdate = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated task title',
        description: 'Updated description',
        estimatedMinutes: 90,
        isCompleted: true,
        tags: ['updated', 'completed']
      };

      expect(taskUpdate.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(taskUpdate.title).toBe('Updated task title');
      expect(taskUpdate.description).toBe('Updated description');
      expect(taskUpdate.estimatedMinutes).toBe(90);
      expect(taskUpdate.isCompleted).toBe(true);
      expect(taskUpdate.tags).toEqual(['updated', 'completed']);
    });

    it('should allow null values for optional fields', () => {
      const taskUpdate: TaskUpdate = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        description: null,
        estimatedMinutes: null
      };

      expect(taskUpdate.description).toBeNull();
      expect(taskUpdate.estimatedMinutes).toBeNull();
    });
  });

  describe('TaskFilter Interface', () => {
    it('should create empty filter', () => {
      const filter: TaskFilter = {};

      expect(Object.keys(filter)).toHaveLength(0);
    });

    it('should create filter with completion status', () => {
      const filter: TaskFilter = {
        isCompleted: false
      };

      expect(filter.isCompleted).toBe(false);
    });

    it('should create filter with date ranges', () => {
      const createdAfter = new Date('2025-09-01');
      const createdBefore = new Date('2025-09-30');
      const filter: TaskFilter = {
        createdAfter,
        createdBefore,
        limit: 10,
        offset: 0
      };

      expect(filter.createdAfter).toEqual(createdAfter);
      expect(filter.createdBefore).toEqual(createdBefore);
      expect(filter.limit).toBe(10);
      expect(filter.offset).toBe(0);
    });

    it('should create filter with text search', () => {
      const filter: TaskFilter = {
        titleContains: 'project',
        descriptionContains: 'urgent',
        tags: ['high-priority']
      };

      expect(filter.titleContains).toBe('project');
      expect(filter.descriptionContains).toBe('urgent');
      expect(filter.tags).toEqual(['high-priority']);
    });

    it('should create comprehensive filter', () => {
      const filter: TaskFilter = {
        isCompleted: true,
        tags: ['project', 'completed'],
        createdAfter: new Date('2025-09-01'),
        completedBefore: new Date('2025-09-30'),
        titleContains: 'feature',
        limit: 50
      };

      expect(filter.isCompleted).toBe(true);
      expect(filter.tags).toEqual(['project', 'completed']);
      expect(filter.createdAfter).toBeInstanceOf(Date);
      expect(filter.completedBefore).toBeInstanceOf(Date);
      expect(filter.titleContains).toBe('feature');
      expect(filter.limit).toBe(50);
    });
  });

  describe('Type Safety', () => {
    it('should enforce readonly fields on Task interface', () => {
      const task: Task = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test task',
        description: null,
        createdAt: new Date(),
        completedAt: null,
        estimatedMinutes: null,
        actualMinutes: null,
        isCompleted: false,
        tags: []
      };

      // These should be compile-time errors (readonly fields)
      // task.id = 'different-id'; // Should fail
      // task.createdAt = new Date(); // Should fail
      // task.actualMinutes = 30; // Should fail

      // These should be allowed (mutable fields)
      task.title = 'Updated title';
      task.description = 'Updated description';
      task.isCompleted = true;
      task.tags = ['updated'];

      expect(task.title).toBe('Updated title');
      expect(task.description).toBe('Updated description');
      expect(task.isCompleted).toBe(true);
      expect(task.tags).toEqual(['updated']);
    });
  });
});