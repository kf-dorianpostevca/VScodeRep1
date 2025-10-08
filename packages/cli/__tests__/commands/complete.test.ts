/**
 * Tests for complete command functionality
 * Validates task completion with timestamps, idempotent behavior, and error handling
 */

import { createCompleteCommand, createDoneCommand } from '../../src/commands/complete';
import { SQLiteTaskRepository } from '@intelligent-todo/shared';
import { formatTaskCompleted, formatError } from '../../src/formatters/TaskFormatter';

// Mock dependencies
jest.mock('@intelligent-todo/shared', () => ({
  SQLiteTaskRepository: jest.fn(),
  createDatabaseConnection: jest.fn(),
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn()
  }))
}));

jest.mock('../../src/formatters/TaskFormatter', () => ({
  formatTaskCompleted: jest.fn(),
  formatError: jest.fn()
}));

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalProcessExit = process.exit;

describe('Complete Command', () => {
  let mockRepository: jest.Mocked<SQLiteTaskRepository>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  const mockTask = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test task',
    description: null,
    createdAt: new Date('2025-09-29T10:00:00Z'),
    completedAt: new Date('2025-09-29T10:30:00Z'),
    estimatedMinutes: 30,
    actualMinutes: 30,
    isCompleted: true,
    tags: []
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock repository
    mockRepository = {
      completeTask: jest.fn()
    } as any;

    (SQLiteTaskRepository as jest.Mock).mockImplementation(() => mockRepository);

    // Mock console and process
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    // Mock formatters
    (formatTaskCompleted as jest.Mock).mockReturnValue('🎉 Task completed! #1234567');
    (formatError as jest.Mock).mockReturnValue('Oops! Something went wrong');
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
  });

  describe('createCompleteCommand', () => {
    test('should create complete command with correct configuration', () => {
      const command = createCompleteCommand();

      expect(command.name()).toBe('complete');
      expect(command.description()).toBe('Mark a task as complete');
      expect(command.registeredArguments).toHaveLength(1);
      expect(command.registeredArguments[0].required).toBe(true);
      expect(command.registeredArguments[0].name()).toBe('taskId');
    });

    test('should complete task successfully with valid ID', async () => {
      mockRepository.completeTask.mockResolvedValue(mockTask);

      const command = createCompleteCommand();
      await command.parseAsync(['node', 'test', '1234567']);

      expect(mockRepository.completeTask).toHaveBeenCalledWith('1234567');
      expect(formatTaskCompleted).toHaveBeenCalledWith(mockTask);
      expect(consoleLogSpy).toHaveBeenCalledWith('🎉 Task completed! #1234567');
    });

    test('should handle task not found error', async () => {
      mockRepository.completeTask.mockRejectedValue(new Error('Task not found'));

      const command = createCompleteCommand();

      try {
        await command.parseAsync(['node', 'test', 'invalid']);
      } catch (error) {
        // Expected due to process.exit mock
      }

      expect(mockRepository.completeTask).toHaveBeenCalledWith('invalid');
      expect(formatError).toHaveBeenCalledWith('Task not found');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Oops! Something went wrong');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should handle database connection errors', async () => {
      mockRepository.completeTask.mockRejectedValue(new Error('Database connection failed'));

      const command = createCompleteCommand();

      try {
        await command.parseAsync(['node', 'test', '1234567']);
      } catch (error) {
        // Expected due to process.exit mock
      }

      expect(formatError).toHaveBeenCalledWith('Database connection failed');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should handle already completed task (idempotent behavior)', async () => {
      const alreadyCompletedTask = { ...mockTask, isCompleted: true };
      mockRepository.completeTask.mockResolvedValue(alreadyCompletedTask);
      (formatTaskCompleted as jest.Mock).mockReturnValue('This task is already done! You\'re on top of things! 🌟');

      const command = createCompleteCommand();
      await command.parseAsync(['node', 'test', '1234567']);

      expect(mockRepository.completeTask).toHaveBeenCalledWith('1234567');
      expect(consoleLogSpy).toHaveBeenCalledWith('This task is already done! You\'re on top of things! 🌟');
    });

    test('should handle non-Error exceptions', async () => {
      mockRepository.completeTask.mockRejectedValue('String error');

      const command = createCompleteCommand();

      try {
        await command.parseAsync(['node', 'test', '1234567']);
      } catch (error) {
        // Expected due to process.exit mock
      }

      expect(formatError).toHaveBeenCalledWith('String error');
    });

    test('should use environment database path when provided', async () => {
      const originalEnv = process.env.TODO_DB_PATH;
      process.env.TODO_DB_PATH = '/custom/path/todo.db';

      mockRepository.completeTask.mockResolvedValue(mockTask);

      const command = createCompleteCommand();
      await command.parseAsync(['node', 'test', '1234567']);

      // Restore environment
      process.env.TODO_DB_PATH = originalEnv;

      expect(mockRepository.completeTask).toHaveBeenCalled();
    });
  });

  describe('createDoneCommand', () => {
    test('should create done command with correct configuration', () => {
      const command = createDoneCommand();

      expect(command.name()).toBe('done');
      expect(command.description()).toBe('Mark a task as complete (alias for complete)');
      expect(command.registeredArguments).toHaveLength(1);
      expect(command.registeredArguments[0].required).toBe(true);
      expect(command.registeredArguments[0].name()).toBe('taskId');
    });

    test('should function as alias for complete command', async () => {
      mockRepository.completeTask.mockResolvedValue(mockTask);

      const command = createDoneCommand();
      await command.parseAsync(['node', 'test', '1234567']);

      expect(mockRepository.completeTask).toHaveBeenCalledWith('1234567');
      expect(formatTaskCompleted).toHaveBeenCalledWith(mockTask);
      expect(consoleLogSpy).toHaveBeenCalledWith('🎉 Task completed! #1234567');
    });
  });

  describe('Integration with TaskFormatter', () => {
    test('should format completion message with time comparison', async () => {
      const taskWithEstimate = {
        ...mockTask,
        estimatedMinutes: 30,
        actualMinutes: 25
      };

      mockRepository.completeTask.mockResolvedValue(taskWithEstimate);
      (formatTaskCompleted as jest.Mock).mockReturnValue(
        '🎉 Task completed! #1234567\n   ✅ Test task\n   ⏱️  Estimated 30m, took 25m - Great job staying 5m under time! ✨'
      );

      const command = createCompleteCommand();
      await command.parseAsync(['node', 'test', '1234567']);

      expect(formatTaskCompleted).toHaveBeenCalledWith(taskWithEstimate);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '🎉 Task completed! #1234567\n   ✅ Test task\n   ⏱️  Estimated 30m, took 25m - Great job staying 5m under time! ✨'
      );
    });

    test('should format error messages appropriately', async () => {
      mockRepository.completeTask.mockRejectedValue(new Error('Task not found'));
      (formatError as jest.Mock).mockReturnValue('Hmm, I couldn\'t find that task. 🤔\n  Try: todo list to see your active tasks');

      const command = createCompleteCommand();

      try {
        await command.parseAsync(['node', 'test', 'nonexistent']);
      } catch (error) {
        // Expected due to process.exit mock
      }

      expect(formatError).toHaveBeenCalledWith('Task not found');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Hmm, I couldn\'t find that task. 🤔\n  Try: todo list to see your active tasks');
    });
  });
});