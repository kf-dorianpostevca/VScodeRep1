/**
 * Tests for TaskFormatter
 * Validates task display formatting and celebration elements
 */

import { Task } from '@intelligent-todo/shared';
import {
  formatTask,
  formatTaskList,
  formatTaskCreated,
  formatTaskCompleted,
  formatError
} from '../../src/formatters/TaskFormatter';

describe('TaskFormatter', () => {
  // Test data setup
  const mockTask: Task = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test task title',
    description: 'Test description',
    createdAt: new Date('2025-09-29T10:00:00Z'),
    completedAt: null,
    estimatedMinutes: 30,
    actualMinutes: null,
    isCompleted: false,
    tags: ['test']
  };

  const completedTask: Task = {
    ...mockTask,
    id: '987f6543-a21c-34b5-6789-012345678901',
    title: 'Completed task',
    isCompleted: true,
    completedAt: new Date('2025-09-29T11:00:00Z')
  };

  describe('formatTask', () => {
    it('should format pending task with all details', () => {
      const result = formatTask(mockTask, true);

      expect(result).toContain('⭕'); // Pending icon
      expect(result).toContain('#123e456'); // Short ID
      expect(result).toContain('Test task title'); // Title
      expect(result).toContain('[30m]'); // Time estimate
      expect(result).toContain('Created'); // Time info
    });

    it('should format completed task', () => {
      const result = formatTask(completedTask, true);

      expect(result).toContain('✅'); // Completed icon
      expect(result).toContain('#987f654'); // Short ID
      expect(result).toContain('Completed task'); // Title
    });

    it('should format task without time estimate', () => {
      const taskWithoutEstimate = { ...mockTask, estimatedMinutes: null };
      const result = formatTask(taskWithoutEstimate, true);

      expect(result).toContain('Test task title');
      expect(result).not.toContain('['); // No time estimate brackets
    });

    it('should format task without details when showDetails is false', () => {
      const result = formatTask(mockTask, false);

      expect(result).toContain('Test task title');
      expect(result).not.toContain('Created');
      expect(result).not.toContain('[30m]');
    });
  });

  describe('formatTaskList', () => {
    it('should format empty list with celebration message', () => {
      const result = formatTaskList([], false);

      expect(result).toContain('🎉');
      expect(result).toContain('No pending tasks');
      expect(result).toContain('crushing it');
    });

    it('should format list with pending tasks only', () => {
      const tasks = [mockTask];
      const result = formatTaskList(tasks, false);

      expect(result).toContain('🎯 Your Active Tasks');
      expect(result).toContain('Test task title');
      expect(result).toContain('1 task pending 🚀');
    });

    it('should format list with all tasks when includeCompleted is true', () => {
      const tasks = [mockTask, completedTask];
      const result = formatTaskList(tasks, true);

      expect(result).toContain('📋 All Your Tasks');
      expect(result).toContain('✅ Completed Tasks');
      expect(result).toContain('🎯 1 pending, ✅ 1 completed');
    });

    it('should show celebration for all completed tasks', () => {
      const tasks = [completedTask];
      const result = formatTaskList(tasks, true);

      expect(result).toContain('Amazing work! 🌟');
    });

    it('should handle multiple tasks with proper pluralization', () => {
      const tasks = [mockTask, { ...mockTask, id: 'different-id' }];
      const result = formatTaskList(tasks, false);

      expect(result).toContain('2 tasks pending 🚀');
    });

    it('should handle single task without pluralization', () => {
      const tasks = [mockTask];
      const result = formatTaskList(tasks, false);

      expect(result).toContain('1 task pending 🚀');
    });
  });

  describe('formatTaskCreated', () => {
    it('should format creation success with celebration', () => {
      const result = formatTaskCreated(mockTask);

      expect(result).toContain('✅ Task created successfully!');
      expect(result).toContain('#123e456'); // Short ID
      expect(result).toContain('📝 Test task title');
      expect(result).toContain('[30m]'); // Time estimate
    });

    it('should format creation success without time estimate', () => {
      const taskWithoutEstimate = { ...mockTask, estimatedMinutes: null };
      const result = formatTaskCreated(taskWithoutEstimate);

      expect(result).toContain('✅ Task created successfully!');
      expect(result).toContain('📝 Test task title');
      expect(result).not.toContain('['); // No time estimate
    });
  });

  describe('formatError', () => {
    it('should format error string with celebration tone', () => {
      const result = formatError('Something went wrong');

      expect(result).toContain('Oops!');
      expect(result).toContain('Something went wrong');
      expect(result).toContain('💭');
      expect(result).toContain('todo --help');
    });

    it('should format Error object', () => {
      const error = new Error('Test error message');
      const result = formatError(error);

      expect(result).toContain('Oops!');
      expect(result).toContain('Test error message');
      expect(result).toContain('💭');
    });
  });

  describe('formatTaskCompleted', () => {
    const completedTaskWithTime: Task = {
      ...mockTask,
      id: '987f6543-a21c-34b5-6789-012345678901',
      title: 'Completed task with time',
      isCompleted: true,
      completedAt: new Date('2025-09-29T10:30:00Z'),
      estimatedMinutes: 30,
      actualMinutes: 25
    };

    it('should format newly completed task with time comparison', () => {
      const result = formatTaskCompleted(completedTaskWithTime);

      expect(result).toContain('🎉 Task completed!');
      expect(result).toContain('#987f654');
      expect(result).toContain('Completed task with time');
      expect(result).toContain('Estimated 30m, took 25m');
      expect(result).toContain('Great job staying 5m under time! ✨');
    });

    it('should format completed task over estimate', () => {
      const overTask: Task = {
        ...completedTaskWithTime,
        actualMinutes: 45 // 15m over 30m estimate
      };

      const result = formatTaskCompleted(overTask);

      expect(result).toContain('🎉 Task completed!');
      expect(result).toContain('Estimated 30m, took 45m');
      expect(result).toContain('15m over estimate, but progress is progress! 💪');
    });

    it('should format completed task with perfect timing', () => {
      const perfectTask: Task = {
        ...completedTaskWithTime,
        actualMinutes: 30 // Exactly on estimate
      };

      const result = formatTaskCompleted(perfectTask);

      expect(result).toContain('Perfect timing! 🎯');
    });

    it('should format completed task without estimate', () => {
      const noEstimateTask: Task = {
        ...completedTaskWithTime,
        estimatedMinutes: null
      };

      const result = formatTaskCompleted(noEstimateTask);

      expect(result).toContain('🎉 Task completed!');
      expect(result).toContain('Completed task with time');
      expect(result).not.toContain('Estimated');
    });

    it('should format completed task with estimate only', () => {
      const estimateOnlyTask: Task = {
        ...completedTaskWithTime,
        actualMinutes: 25,
        estimatedMinutes: null
      };

      const result = formatTaskCompleted(estimateOnlyTask);

      expect(result).toContain('🎉 Task completed!');
      expect(result).toContain('Completed task with time');
    });

    it('should format completed task with estimate but no actual calculation', () => {
      const noCalculationTask: Task = {
        ...completedTaskWithTime,
        actualMinutes: null,
        estimatedMinutes: 30,
        isCompleted: false // Not marked as already completed
      };

      const result = formatTaskCompleted(noCalculationTask);

      expect(result).toContain('🎉 Task completed!');
      expect(result).toContain('Originally estimated 30m');
    });

    it('should format already completed task (idempotent)', () => {
      const alreadyCompleted: Task = {
        ...completedTaskWithTime,
        actualMinutes: null // Indicates already completed
      };

      const result = formatTaskCompleted(alreadyCompleted);

      expect(result).toContain('This task is already done!');
      expect(result).toContain('You\'re on top of things! 🌟');
    });
  });

  describe('enhanced formatError', () => {
    it('should provide specific message for task not found', () => {
      const result = formatError('Task not found');

      expect(result).toContain('Hmm, I couldn\'t find that task. 🤔');
      expect(result).toContain('Try: todo list to see your active tasks');
    });

    it('should provide generic message for other errors', () => {
      const result = formatError('Some other error');

      expect(result).toContain('Oops! Some other error 💭');
      expect(result).toContain('Try: todo --help for usage examples');
    });
  });

  describe('time formatting integration', () => {
    it('should handle various time estimates correctly', () => {
      const tasks = [
        { ...mockTask, estimatedMinutes: 30 },
        { ...mockTask, id: 'task2', estimatedMinutes: 120 },
        { ...mockTask, id: 'task3', estimatedMinutes: 90 }
      ];

      const result = formatTaskList(tasks, false);

      expect(result).toContain('[30m]');
      expect(result).toContain('[2h]');
      expect(result).toContain('[1h30m]');
    });
  });
});