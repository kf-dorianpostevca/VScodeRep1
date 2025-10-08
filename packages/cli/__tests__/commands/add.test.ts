/**
 * Tests for add command
 * Validates task creation functionality and error handling
 */

import { createAddCommand } from '../../src/commands/add';
import { Command } from 'commander';
import { SQLiteTaskRepository } from '@intelligent-todo/shared';

// Mock dependencies
jest.mock('@intelligent-todo/shared', () => {
  const actual = jest.requireActual('@intelligent-todo/shared');
  return {
    ...actual,
    createDatabaseConnection: jest.fn(),
    SQLiteTaskRepository: jest.fn()
  };
});

describe('add command', () => {
  let command: Command;
  let mockRepository: jest.Mocked<SQLiteTaskRepository>;
  let mockDb: any;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    // Setup mocks
    mockDb = {
      close: jest.fn()
    };

    mockRepository = {
      create: jest.fn()
    } as any;

    (require('@intelligent-todo/shared').createDatabaseConnection as jest.Mock).mockReturnValue(mockDb);
    (require('@intelligent-todo/shared').SQLiteTaskRepository as jest.Mock).mockReturnValue(mockRepository);

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    // Create command
    command = createAddCommand();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('command configuration', () => {
    it('should have correct name and description', () => {
      expect(command.name()).toBe('add');
      expect(command.description()).toBe('Create a new task');
    });

    it('should have required title argument', () => {
      // Check that the command has the title argument configured
      // We can test this by checking the command's usage string or helpInformation
      const usage = command.usage();
      expect(usage).toContain('<title>');

      // Alternative: Check command's help information contains the argument
      const help = command.helpInformation();
      expect(help).toContain('title');
    });

    it('should have optional estimate and description options', () => {
      const options = command.options;
      const estimateOption = options.find(opt => opt.long === '--estimate');
      const descriptionOption = options.find(opt => opt.long === '--description');

      expect(estimateOption).toBeDefined();
      expect(estimateOption?.short).toBe('-e');
      expect(descriptionOption).toBeDefined();
      expect(descriptionOption?.short).toBe('-d');
    });
  });

  describe('successful task creation', () => {
    it('should create basic task without options', async () => {
      const mockTask = {
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

      mockRepository.create.mockResolvedValue(mockTask);

      // Simulate command execution
      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'add', 'Test task']);

      expect(mockRepository.create).toHaveBeenCalledWith({
        title: 'Test task',
        description: null
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✅ Task created successfully!'));
      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should create task with time estimate', async () => {
      const mockTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test task',
        description: null,
        createdAt: new Date(),
        completedAt: null,
        estimatedMinutes: 30,
        actualMinutes: null,
        isCompleted: false,
        tags: []
      };

      mockRepository.create.mockResolvedValue(mockTask);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'add', 'Test task', '--estimate', '30m']);

      expect(mockRepository.create).toHaveBeenCalledWith({
        title: 'Test task',
        description: null,
        estimatedMinutes: 30
      });
    });

    it('should create task with description and estimate', async () => {
      const mockTask = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test task',
        description: 'Test description',
        createdAt: new Date(),
        completedAt: null,
        estimatedMinutes: 120,
        actualMinutes: null,
        isCompleted: false,
        tags: []
      };

      mockRepository.create.mockResolvedValue(mockTask);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync([
        'node', 'test', 'add', 'Test task',
        '--description', 'Test description',
        '--estimate', '2h'
      ]);

      expect(mockRepository.create).toHaveBeenCalledWith({
        title: 'Test task',
        description: 'Test description',
        estimatedMinutes: 120
      });
    });
  });

  describe('validation errors', () => {
    it('should handle empty title', async () => {
      const program = new Command();
      program.addCommand(command);

      await program.parseAsync(['node', 'test', 'add', '']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Task title is required')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle title too long', async () => {
      const longTitle = 'a'.repeat(201);
      const program = new Command();
      program.addCommand(command);

      await program.parseAsync(['node', 'test', 'add', longTitle]);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Task title must be 200 characters or less')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle invalid time estimate', async () => {
      const program = new Command();
      program.addCommand(command);

      await program.parseAsync(['node', 'test', 'add', 'Test task', '--estimate', 'invalid']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid time estimate')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle description too long', async () => {
      const longDescription = 'a'.repeat(1001);
      const program = new Command();
      program.addCommand(command);

      await program.parseAsync([
        'node', 'test', 'add', 'Test task',
        '--description', longDescription
      ]);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Task description must be 1000 characters or less')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('database errors', () => {
    it('should handle unique constraint error', async () => {
      const error = new Error('UNIQUE constraint failed: tasks.title');
      mockRepository.create.mockRejectedValue(error);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'add', 'Test task']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('A task with this title already exists')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should handle check constraint error', async () => {
      const error = new Error('CHECK constraint failed: estimated_minutes > 0');
      mockRepository.create.mockRejectedValue(error);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'add', 'Test task']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Task data validation failed')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle generic database error', async () => {
      const error = new Error('Database connection failed');
      mockRepository.create.mockRejectedValue(error);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'add', 'Test task']);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create task')
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('cleanup', () => {
    it('should always close database connection', async () => {
      const mockTask = {
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

      mockRepository.create.mockResolvedValue(mockTask);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'add', 'Test task']);

      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should close database connection even on error', async () => {
      const error = new Error('Database error');
      mockRepository.create.mockRejectedValue(error);

      const program = new Command();
      program.addCommand(command);
      await program.parseAsync(['node', 'test', 'add', 'Test task']);

      expect(mockDb.close).toHaveBeenCalled();
    });
  });
});