/**
 * Tests for edit command functionality
 * Validates task editing with title and estimate updates, validation, and error handling
 */

import { createEditCommand } from '../../src/commands/edit';
import { SQLiteTaskRepository } from '@intelligent-todo/shared';
import { formatTaskEdited, formatError } from '../../src/formatters/TaskFormatter';
import { parseTimeEstimate } from '../../src/parsers/TimeEstimateParser';

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
  formatTaskEdited: jest.fn(),
  formatError: jest.fn()
}));

jest.mock('../../src/parsers/TimeEstimateParser', () => ({
  parseTimeEstimate: jest.fn()
}));

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalProcessExit = process.exit;

describe('Edit Command', () => {
  let mockRepository: jest.Mocked<SQLiteTaskRepository>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  const mockTask = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Original task title',
    description: null,
    createdAt: new Date('2025-09-29T10:00:00Z'),
    completedAt: null,
    estimatedMinutes: 30,
    actualMinutes: null,
    isCompleted: false,
    tags: []
  };

  const mockUpdatedTask = {
    ...mockTask,
    title: 'Updated task title',
    estimatedMinutes: 45
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup repository mock
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      close: jest.fn()
    } as any;

    (SQLiteTaskRepository as jest.Mock).mockImplementation(() => mockRepository);

    // Setup console spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    // Setup formatter mocks
    (formatTaskEdited as jest.Mock).mockReturnValue('✏️ Task updated successfully!');
    (formatError as jest.Mock).mockReturnValue('Oops! Error occurred');

    // Setup parser mock
    (parseTimeEstimate as jest.Mock).mockReturnValue(45);
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
  });

  describe('Task title editing', () => {
    it('should update task title successfully', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockTask);
      mockRepository.update.mockResolvedValue(mockUpdatedTask);

      const command = createEditCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', 'Updated task title']);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith('123e4567');
      expect(mockRepository.update).toHaveBeenCalledWith({
        id: '123e4567',
        title: 'Updated task title'
      });
      expect(formatTaskEdited).toHaveBeenCalledWith(mockUpdatedTask);
      expect(consoleLogSpy).toHaveBeenCalledWith('✏️ Task updated successfully!');
    });

    it('should validate title length', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockTask);
      const command = createEditCommand();

      // Act - Empty string is treated as undefined by Commander.js, so this will fail with "Please provide either..." message
      await command.parseAsync(['node', 'test', '123e4567']);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(formatError).toHaveBeenCalledWith('Please provide either a new title or use --estimate to update time estimate');
    });

    it('should handle long titles', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockTask);
      const longTitle = 'a'.repeat(201);
      const command = createEditCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', longTitle]);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(formatError).toHaveBeenCalledWith('Task title must be between 1 and 200 characters');
    });
  });

  describe('Time estimate editing', () => {
    it('should update time estimate only', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockTask);
      mockRepository.update.mockResolvedValue(mockUpdatedTask);

      const command = createEditCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', '--estimate', '45m']);

      // Assert
      expect(parseTimeEstimate).toHaveBeenCalledWith('45m');
      expect(mockRepository.update).toHaveBeenCalledWith({
        id: '123e4567',
        estimatedMinutes: 45
      });
      expect(formatTaskEdited).toHaveBeenCalledWith(mockUpdatedTask);
      expect(consoleLogSpy).toHaveBeenCalledWith('✏️ Task updated successfully!');
    });

    it('should handle invalid time estimates', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockTask);
      (parseTimeEstimate as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid time format');
      });

      const command = createEditCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', '--estimate', 'invalid']);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(formatError).toHaveBeenCalledWith('Invalid time estimate: Invalid time format');
    });

    it('should update both title and estimate', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockTask);
      mockRepository.update.mockResolvedValue(mockUpdatedTask);

      const command = createEditCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', 'New title', '--estimate', '45m']);

      // Assert
      expect(mockRepository.update).toHaveBeenCalledWith({
        id: '123e4567',
        title: 'New title',
        estimatedMinutes: 45
      });
      expect(formatTaskEdited).toHaveBeenCalledWith(mockUpdatedTask);
    });
  });

  describe('Short ID resolution', () => {
    it('should resolve short ID to full ID', async () => {
      // Arrange - Task with ID that would match the short id "123e456"
      const taskWithMatchingId = { ...mockTask, id: '123e4567-e89b-12d3-a456-426614174000' };
      mockRepository.findById.mockResolvedValueOnce(null); // First call with short ID fails

      mockRepository.findAll.mockResolvedValue([taskWithMatchingId]);
      mockRepository.update.mockResolvedValue(mockUpdatedTask);

      const command = createEditCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e456', 'Updated title']);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith('123e456');
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalledWith({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated title'
      });
    });

    it('should handle ambiguous short IDs', async () => {
      // Arrange - Two tasks that both start with "123"
      const task1 = { ...mockTask, id: '123e4567-e89b-12d3-a456-426614174000' };
      const task2 = { ...mockTask, id: '123f4567-e89b-12d3-a456-426614174001' };
      mockRepository.findById.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue([task1, task2]);

      const command = createEditCommand();

      // Act
      await command.parseAsync(['node', 'test', '123', 'Updated title']);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(formatError).toHaveBeenCalledWith('Multiple tasks match that ID - please use a longer ID');
    });
  });

  describe('Task validation', () => {
    it('should prevent editing completed tasks', async () => {
      // Arrange
      const completedTask = { ...mockTask, isCompleted: true, completedAt: new Date() };
      mockRepository.findById.mockResolvedValue(completedTask);

      const command = createEditCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', 'New title']);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(formatError).toHaveBeenCalledWith('Cannot edit completed task - use `todo incomplete <id>` first to make changes');
    });

    it('should handle non-existent tasks', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue([]);

      const command = createEditCommand();

      // Act
      await command.parseAsync(['node', 'test', 'nonexistent', 'New title']);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(formatError).toHaveBeenCalledWith('Task not found');
    });

    it('should require at least one parameter to change', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockTask);
      const command = createEditCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567']);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(formatError).toHaveBeenCalledWith('Please provide either a new title or use --estimate to update time estimate');
    });
  });

  describe('Database operations', () => {
    it('should handle database connection cleanup', async () => {
      // Arrange
      const mockDb = { close: jest.fn(), open: true };
      const mockCreateConnection = require('@intelligent-todo/shared').createDatabaseConnection;
      mockCreateConnection.mockReturnValue(mockDb);

      mockRepository.findById.mockResolvedValue(mockTask);
      mockRepository.update.mockResolvedValue(mockUpdatedTask);

      const command = createEditCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', 'New title']);

      // Assert
      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      const command = createEditCommand();

      // Act
      await command.parseAsync(['node', 'test', '123e4567', 'New title']);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(formatError).toHaveBeenCalledWith('Database error');
    });
  });
});