/**
 * Tests for delete command functionality
 * Validates task deletion with confirmation prompts, --force flag, and error handling
 */

import { createDeleteCommand } from '../../src/commands/delete';
import { SQLiteTaskRepository } from '@intelligent-todo/shared';
import { formatTaskDeleted, formatError } from '../../src/formatters/TaskFormatter';
import * as readline from 'readline';

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
  formatTaskDeleted: jest.fn(),
  formatError: jest.fn()
}));

jest.mock('readline', () => ({
  createInterface: jest.fn()
}));

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalProcessExit = process.exit;

describe('Delete Command', () => {
  let mockRepository: jest.Mocked<SQLiteTaskRepository>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;
  let mockReadlineInterface: any;

  const mockTask = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Task to delete',
    description: null,
    createdAt: new Date('2025-09-29T10:00:00Z'),
    completedAt: null,
    estimatedMinutes: 30,
    actualMinutes: null,
    isCompleted: false,
    tags: []
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup repository mock
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      close: jest.fn()
    } as any;

    (SQLiteTaskRepository as jest.Mock).mockImplementation(() => mockRepository);

    // Setup console spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    // Setup formatter mocks
    (formatTaskDeleted as jest.Mock).mockReturnValue('🗑️ Task deleted successfully!');
    (formatError as jest.Mock).mockReturnValue('Oops! Error occurred');

    // Setup readline mock
    mockReadlineInterface = {
      question: jest.fn(),
      close: jest.fn()
    };
    (readline.createInterface as jest.Mock).mockReturnValue(mockReadlineInterface);
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
  });

  describe('Task deletion with confirmation', () => {
    it('should delete task after user confirms', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockTask);
      mockRepository.delete.mockResolvedValue(true);

      // Mock user confirms deletion
      mockReadlineInterface.question.mockImplementation((_question: string, callback: (answer: string) => void) => {
        callback('y');
      });

      const command = createDeleteCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567']);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith('123e4567');
      expect(mockReadlineInterface.question).toHaveBeenCalledWith(
        'Are you sure you want to delete "Task to delete"? (y/N): ',
        expect.any(Function)
      );
      expect(mockRepository.delete).toHaveBeenCalledWith('123e4567');
      expect(formatTaskDeleted).toHaveBeenCalledWith('Task to delete');
      expect(consoleLogSpy).toHaveBeenCalledWith('🗑️ Task deleted successfully!');
    });

    it('should cancel deletion when user says no', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockTask);

      // Mock user cancels deletion
      mockReadlineInterface.question.mockImplementation((_question: string, callback: (answer: string) => void) => {
        callback('n');
      });

      const command = createDeleteCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567']);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith('123e4567');
      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('Deletion cancelled. Your task is safe! 🛡️');
    });

    it('should handle various confirmation responses', async () => {
      const testCases = [
        { input: 'yes', shouldDelete: true },
        { input: 'Y', shouldDelete: true },
        { input: 'YES', shouldDelete: true },
        { input: 'n', shouldDelete: false },
        { input: 'no', shouldDelete: false },
        { input: '', shouldDelete: false },
        { input: 'maybe', shouldDelete: false }
      ];

      for (const testCase of testCases) {
        // Arrange
        jest.clearAllMocks();
        mockRepository.findById.mockResolvedValue(mockTask);
        mockRepository.delete.mockResolvedValue(true);

        mockReadlineInterface.question.mockImplementation((_question: string, callback: (answer: string) => void) => {
          callback(testCase.input);
        });

        const command = createDeleteCommand();

        // Act
        await command.parseAsync(['node', 'test', '123e4567']);

        // Assert
        if (testCase.shouldDelete) {
          expect(mockRepository.delete).toHaveBeenCalled();
          expect(formatTaskDeleted).toHaveBeenCalled();
        } else {
          expect(mockRepository.delete).not.toHaveBeenCalled();
          expect(consoleLogSpy).toHaveBeenCalledWith('Deletion cancelled. Your task is safe! 🛡️');
        }
      }
    });
  });

  describe('Force deletion', () => {
    it('should delete task without confirmation when --force is used', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockTask);
      mockRepository.delete.mockResolvedValue(true);

      const command = createDeleteCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', '--force']);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith('123e4567');
      expect(mockReadlineInterface.question).not.toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalledWith('123e4567');
      expect(formatTaskDeleted).toHaveBeenCalledWith('Task to delete');
    });

    it('should delete task without confirmation when -f is used', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockTask);
      mockRepository.delete.mockResolvedValue(true);

      const command = createDeleteCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', '-f']);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith('123e4567');
      expect(mockReadlineInterface.question).not.toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalledWith('123e4567');
    });
  });

  describe('Short ID resolution', () => {
    it('should resolve short ID to full ID', async () => {
      // Arrange - Task with ID that matches short ID "123e456"
      const taskWithMatchingId = { ...mockTask, id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRepository.findById.mockResolvedValueOnce(null); // First call with short ID fails

      mockRepository.findAll.mockResolvedValue([taskWithMatchingId]);
      mockRepository.delete.mockResolvedValue(true);

      const command = createDeleteCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e456', '--force']);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith('123e456');
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should handle ambiguous short IDs', async () => {
      // Arrange - Two tasks that both start with "123"
      const task1 = { ...mockTask, id: '123e4567-e89b-12d3-a456-426614174000' };
      const task2 = { ...mockTask, id: '123f4567-e89b-12d3-a456-426614174001' };
      mockRepository.findById.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue([task1, task2]);

      const command = createDeleteCommand();

      // Act
      await command.parseAsync(['node', 'test', '123', '--force']);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(formatError).toHaveBeenCalledWith('Multiple tasks match that ID - please use a longer ID');
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent tasks', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue([]);

      const command = createDeleteCommand();

      // Act
      await command.parseAsync(['node', 'test', 'nonexistent', '--force']);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(formatError).toHaveBeenCalledWith('Task not found');
    });

    it('should handle deletion failure', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockTask);
      mockRepository.delete.mockResolvedValue(false);

      const command = createDeleteCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', '--force']);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(formatError).toHaveBeenCalledWith('Task not found');
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      const command = createDeleteCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', '--force']);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(formatError).toHaveBeenCalledWith('Database error');
    });
  });

  describe('Database operations', () => {
    it('should handle database connection cleanup', async () => {
      // Arrange
      const mockDb = { close: jest.fn(), open: true };
      const mockCreateConnection = require('@intelligent-todo/shared').createDatabaseConnection;
      mockCreateConnection.mockReturnValue(mockDb);

      mockRepository.findById.mockResolvedValue(mockTask);
      mockRepository.delete.mockResolvedValue(true);

      const command = createDeleteCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', '--force']);

      // Assert
      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should handle database cleanup errors gracefully', async () => {
      // Arrange
      const mockDb = {
        close: jest.fn().mockImplementation(() => { throw new Error('Close error'); }),
        open: true
      };
      const mockCreateConnection = require('@intelligent-todo/shared').createDatabaseConnection;
      mockCreateConnection.mockReturnValue(mockDb);

      mockRepository.findById.mockResolvedValue(mockTask);
      mockRepository.delete.mockResolvedValue(true);

      const command = createDeleteCommand();

      // Act & Assert - Should not throw
      await expect(command.parseAsync(['node', 'test', '123e4567', '--force'])).resolves.not.toThrow();
    });
  });
});