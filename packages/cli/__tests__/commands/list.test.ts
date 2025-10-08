/**
 * Tests for list command
 * Validates task listing functionality and filtering options
 */

import { createListCommand } from '../../src/commands/list';
import { Command } from 'commander';
import { Task } from '@intelligent-todo/shared';

// Mock dependencies
jest.mock('@intelligent-todo/shared', () => {
  const actual = jest.requireActual('@intelligent-todo/shared');
  return {
    ...actual,
    createDatabaseConnection: jest.fn(),
    SQLiteTaskRepository: jest.fn()
  };
});

describe('list command', () => {
  let command: Command;
  let mockRepository: any;
  let mockDb: any;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  // Test data
  const pendingTask: Task = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Pending task',
    description: null,
    createdAt: new Date('2025-09-29T10:00:00Z'),
    completedAt: null,
    estimatedMinutes: 30,
    actualMinutes: null,
    isCompleted: false,
    tags: []
  };

  const completedTask: Task = {
    id: '987f6543-a21c-34b5-6789-012345678901',
    title: 'Completed task',
    description: null,
    createdAt: new Date('2025-09-29T09:00:00Z'),
    completedAt: new Date('2025-09-29T10:30:00Z'),
    estimatedMinutes: 60,
    actualMinutes: 90,
    isCompleted: true,
    tags: []
  };

  beforeEach(() => {
    // Setup mocks
    mockDb = {
      close: jest.fn()
    };

    mockRepository = {
      findAll: jest.fn()
    };

    (require('@intelligent-todo/shared').createDatabaseConnection as jest.Mock).mockReturnValue(mockDb);
    (require('@intelligent-todo/shared').SQLiteTaskRepository as jest.Mock).mockReturnValue(mockRepository);

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    // Create command
    command = createListCommand();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('command configuration', () => {
    it('should have correct name and description', () => {
      expect(command.name()).toBe('list');
      expect(command.description()).toBe('List tasks');
    });

    it('should have --all option', () => {
      const options = command.options;
      const allOption = options.find(opt => opt.long === '--all');

      expect(allOption).toBeDefined();
      expect(allOption?.short).toBe('-a');
      expect(allOption?.description).toBe('show both pending and completed tasks');
    });
  });

  describe('listing pending tasks only (default)', () => {
    it('should list pending tasks with proper filter', async () => {
      mockRepository.findAll.mockResolvedValue([pendingTask]);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list']);

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        isCompleted: false
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🎯 Your Active Tasks')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Pending task')
      );
      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should show celebration message for empty pending list', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list']);

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        isCompleted: false
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🎉 No pending tasks')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('crushing it')
      );
    });

    it('should show task count for pending tasks', async () => {
      const multipleTasks = [
        pendingTask,
        { ...pendingTask, id: 'different-id', title: 'Another pending task' }
      ];
      mockRepository.findAll.mockResolvedValue(multipleTasks);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list']);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('2 tasks pending 🚀')
      );
    });
  });

  describe('listing all tasks (--all flag)', () => {
    it('should list all tasks with proper filter', async () => {
      mockRepository.findAll.mockResolvedValue([pendingTask, completedTask]);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list', '--all']);

      expect(mockRepository.findAll).toHaveBeenCalledWith({});
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📋 All Your Tasks')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Pending task')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Completed task')
      );
    });

    it('should use short flag -a', async () => {
      mockRepository.findAll.mockResolvedValue([pendingTask, completedTask]);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list', '-a']);

      expect(mockRepository.findAll).toHaveBeenCalledWith({});
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📋 All Your Tasks')
      );
    });

    it('should show completion stats for all tasks', async () => {
      mockRepository.findAll.mockResolvedValue([pendingTask, completedTask]);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list', '--all']);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🎯 1 pending, ✅ 1 completed')
      );
    });

    it('should show amazing work message when all tasks completed', async () => {
      mockRepository.findAll.mockResolvedValue([completedTask]);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list', '--all']);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Amazing work! 🌟')
      );
    });

    it('should show celebration message for completely empty list', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list', '--all']);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🎉 No tasks found')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('all caught up')
      );
    });
  });

  describe('error handling', () => {
    it('should handle database access errors', async () => {
      const error = new Error('SQLITE_CANTOPEN: unable to open database file');
      mockRepository.findAll.mockRejectedValue(error);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not access task database')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should handle database not initialized error', async () => {
      const error = new Error('no such table: tasks');
      mockRepository.findAll.mockRejectedValue(error);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Task database not initialized')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('todo add "your first task"')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle generic database errors', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findAll.mockRejectedValue(error);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to retrieve tasks')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle non-Error objects', async () => {
      mockRepository.findAll.mockRejectedValue('String error');

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Oops!')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('cleanup', () => {
    it('should always close database connection on success', async () => {
      mockRepository.findAll.mockResolvedValue([pendingTask]);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list']);

      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should close database connection even on error', async () => {
      const error = new Error('Database error');
      mockRepository.findAll.mockRejectedValue(error);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'list']);

      expect(mockDb.close).toHaveBeenCalled();
    });
  });
});