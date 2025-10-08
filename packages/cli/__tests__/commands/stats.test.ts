/**
 * Unit tests for stats command
 * Tests command creation, option parsing, and execution flow
 */

import { createStatsCommand } from '../../src/commands/stats';
import {
  createDatabaseConnection,
  SQLiteTaskRepository,
  EstimationAccuracyService,
} from '@intelligent-todo/shared';
import { formatStats, formatError } from '../../src/formatters/StatsFormatter';
import { Task } from '@intelligent-todo/shared';

// Mock all dependencies
jest.mock('@intelligent-todo/shared', () => {
  const actual = jest.requireActual('@intelligent-todo/shared');
  return {
    ...actual,
    createDatabaseConnection: jest.fn(),
    SQLiteTaskRepository: jest.fn(),
    EstimationAccuracyService: jest.fn(),
    createLogger: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    })),
  };
});

jest.mock('../../src/formatters/StatsFormatter');

describe('stats command', () => {
  let mockDb: any;
  let mockRepository: any;
  let mockService: any;
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock database
    mockDb = {
      open: true,
      close: jest.fn(),
    };

    // Mock repository
    mockRepository = {
      findAll: jest.fn(),
    };

    // Mock service
    mockService = {
      calculateMonthlyAccuracy: jest.fn(),
    };

    // Setup mocks
    (createDatabaseConnection as jest.Mock).mockReturnValue(mockDb);
    (SQLiteTaskRepository as jest.Mock).mockReturnValue(mockRepository);
    (EstimationAccuracyService as jest.Mock).mockReturnValue(mockService);
    (formatStats as jest.Mock).mockReturnValue('Formatted stats output');
    (formatError as jest.Mock).mockReturnValue('Formatted error');

    // Spy on console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('command configuration', () => {
    it('should create stats command with correct name', () => {
      const command = createStatsCommand();

      expect(command.name()).toBe('stats');
    });

    it('should have description', () => {
      const command = createStatsCommand();

      expect(command.description()).toContain('estimation accuracy');
      expect(command.description()).toContain('productivity statistics');
    });

    it('should have --month option', () => {
      const command = createStatsCommand();
      const options = command.options;

      const monthOption = options.find((opt: any) => opt.long === '--month');
      expect(monthOption).toBeDefined();
    });
  });

  describe('command execution', () => {
    it('should display stats for current month with tasks', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: null,
          createdAt: new Date(),
          completedAt: new Date(),
          estimatedMinutes: 30,
          actualMinutes: 32,
          isCompleted: true,
          tags: [],
        },
      ];

      const mockStats = {
        accuracy: 90,
        tasksAnalyzed: 1,
        totalCompleted: 1,
        averageEstimate: 30,
        averageActual: 32,
        accurateCount: 1,
        overestimateCount: 0,
        underestimateCount: 0,
      };

      mockRepository.findAll.mockResolvedValue(mockTasks);
      mockService.calculateMonthlyAccuracy.mockReturnValue(mockStats);

      const command = createStatsCommand();
      await command.parseAsync(['node', 'test', 'stats']);

      expect(createDatabaseConnection).toHaveBeenCalled();
      expect(SQLiteTaskRepository).toHaveBeenCalledWith(mockDb);
      expect(EstimationAccuracyService).toHaveBeenCalled();
      expect(mockRepository.findAll).toHaveBeenCalledTimes(2); // Current + previous month
      expect(mockService.calculateMonthlyAccuracy).toHaveBeenCalledWith(
        mockTasks,
        mockTasks
      );
      expect(formatStats).toHaveBeenCalledWith(mockStats, expect.any(String));
      expect(consoleSpy).toHaveBeenCalledWith('Formatted stats output');
      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should handle no tasks in current month', async () => {
      const mockStats = {
        accuracy: null,
        tasksAnalyzed: 0,
        totalCompleted: 0,
        averageEstimate: null,
        averageActual: null,
        accurateCount: 0,
        overestimateCount: 0,
        underestimateCount: 0,
      };

      mockRepository.findAll.mockResolvedValue([]);
      mockService.calculateMonthlyAccuracy.mockReturnValue(mockStats);

      const command = createStatsCommand();
      await command.parseAsync(['node', 'test', 'stats']);

      expect(mockService.calculateMonthlyAccuracy).toHaveBeenCalledWith(
        [],
        undefined
      );
      expect(formatStats).toHaveBeenCalledWith(mockStats, expect.any(String));
      expect(consoleSpy).toHaveBeenCalledWith('Formatted stats output');
    });

    it('should calculate trend when previous month has tasks', async () => {
      const currentMonthTasks: Task[] = [
        {
          id: '1',
          title: 'Current Task',
          description: null,
          createdAt: new Date(),
          completedAt: new Date(),
          estimatedMinutes: 30,
          actualMinutes: 30,
          isCompleted: true,
          tags: [],
        },
      ];

      const previousMonthTasks: Task[] = [
        {
          id: '2',
          title: 'Previous Task',
          description: null,
          createdAt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          completedAt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          estimatedMinutes: 30,
          actualMinutes: 45,
          isCompleted: true,
          tags: [],
        },
      ];

      mockRepository.findAll
        .mockResolvedValueOnce(currentMonthTasks)
        .mockResolvedValueOnce(previousMonthTasks);

      const mockStats = {
        accuracy: 100,
        tasksAnalyzed: 1,
        totalCompleted: 1,
        averageEstimate: 30,
        averageActual: 30,
        accurateCount: 1,
        overestimateCount: 0,
        underestimateCount: 0,
        trend: {
          direction: 'up' as const,
          percentage: 25,
        },
      };

      mockService.calculateMonthlyAccuracy.mockReturnValue(mockStats);

      const command = createStatsCommand();
      await command.parseAsync(['node', 'test', 'stats']);

      expect(mockService.calculateMonthlyAccuracy).toHaveBeenCalledWith(
        currentMonthTasks,
        previousMonthTasks
      );
    });

    it('should not pass previous month tasks when empty', async () => {
      const currentMonthTasks: Task[] = [
        {
          id: '1',
          title: 'Task',
          description: null,
          createdAt: new Date(),
          completedAt: new Date(),
          estimatedMinutes: 30,
          actualMinutes: 30,
          isCompleted: true,
          tags: [],
        },
      ];

      mockRepository.findAll
        .mockResolvedValueOnce(currentMonthTasks)
        .mockResolvedValueOnce([]);

      const mockStats = {
        accuracy: 100,
        tasksAnalyzed: 1,
        totalCompleted: 1,
        averageEstimate: 30,
        averageActual: 30,
        accurateCount: 1,
        overestimateCount: 0,
        underestimateCount: 0,
      };

      mockService.calculateMonthlyAccuracy.mockReturnValue(mockStats);

      const command = createStatsCommand();
      await command.parseAsync(['node', 'test', 'stats']);

      expect(mockService.calculateMonthlyAccuracy).toHaveBeenCalledWith(
        currentMonthTasks,
        undefined
      );
    });

    it('should query correct date ranges for current month', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockService.calculateMonthlyAccuracy.mockReturnValue({
        accuracy: null,
        tasksAnalyzed: 0,
        totalCompleted: 0,
        averageEstimate: null,
        averageActual: null,
        accurateCount: 0,
        overestimateCount: 0,
        underestimateCount: 0,
      });

      const command = createStatsCommand();
      await command.parseAsync(['node', 'test', 'stats']);

      const now = new Date();
      const expectedMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const expectedMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          isCompleted: true,
          completedAfter: expect.any(Date),
          completedBefore: expect.any(Date),
        })
      );

      const firstCall = mockRepository.findAll.mock.calls[0][0];
      expect(firstCall.completedAfter.getDate()).toBe(expectedMonthStart.getDate());
      expect(firstCall.completedBefore.getDate()).toBe(expectedMonthEnd.getDate());
    });

    it('should query correct date ranges for previous month', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockService.calculateMonthlyAccuracy.mockReturnValue({
        accuracy: null,
        tasksAnalyzed: 0,
        totalCompleted: 0,
        averageEstimate: null,
        averageActual: null,
        accurateCount: 0,
        overestimateCount: 0,
        underestimateCount: 0,
      });

      const command = createStatsCommand();
      await command.parseAsync(['node', 'test', 'stats']);

      expect(mockRepository.findAll).toHaveBeenCalledTimes(2);

      const secondCall = mockRepository.findAll.mock.calls[1][0];
      const now = new Date();
      const expectedPrevMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      expect(secondCall.completedAfter.getMonth()).toBe(
        expectedPrevMonthStart.getMonth()
      );
    });
  });

  describe('error handling', () => {
    it('should handle repository query errors', async () => {
      const error = new Error('Query failed');
      mockRepository.findAll.mockRejectedValue(error);

      const command = createStatsCommand();

      try {
        await command.parseAsync(['node', 'test', 'stats']);
      } catch (e) {
        // Expected to throw due to process.exit mock
      }

      expect(formatError).toHaveBeenCalledWith(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Formatted error');
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should handle service calculation errors', async () => {
      const error = new Error('Calculation failed');
      mockRepository.findAll.mockResolvedValue([]);
      mockService.calculateMonthlyAccuracy.mockImplementation(() => {
        throw error;
      });

      const command = createStatsCommand();

      try {
        await command.parseAsync(['node', 'test', 'stats']);
      } catch (e) {
        // Expected to throw due to process.exit mock
      }

      expect(formatError).toHaveBeenCalledWith(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Formatted error');
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should close database connection on error', async () => {
      const error = new Error('Test error');
      mockRepository.findAll.mockRejectedValue(error);

      const command = createStatsCommand();

      try {
        await command.parseAsync(['node', 'test', 'stats']);
      } catch (e) {
        // Expected
      }

      expect(mockDb.close).toHaveBeenCalled();
    });

    it('should not attempt to close already closed database', async () => {
      mockDb.open = false;
      mockRepository.findAll.mockResolvedValue([]);
      mockService.calculateMonthlyAccuracy.mockReturnValue({
        accuracy: null,
        tasksAnalyzed: 0,
        totalCompleted: 0,
        averageEstimate: null,
        averageActual: null,
        accurateCount: 0,
        overestimateCount: 0,
        underestimateCount: 0,
      });

      const command = createStatsCommand();
      await command.parseAsync(['node', 'test', 'stats']);

      expect(mockDb.close).not.toHaveBeenCalled();
    });
  });

  describe('output formatting', () => {
    it('should format month name correctly', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockService.calculateMonthlyAccuracy.mockReturnValue({
        accuracy: null,
        tasksAnalyzed: 0,
        totalCompleted: 0,
        averageEstimate: null,
        averageActual: null,
        accurateCount: 0,
        overestimateCount: 0,
        underestimateCount: 0,
      });

      const command = createStatsCommand();
      await command.parseAsync(['node', 'test', 'stats']);

      const now = new Date();
      const expectedMonthName = now.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      expect(formatStats).toHaveBeenCalledWith(
        expect.any(Object),
        expectedMonthName
      );
    });
  });
});
