/**
 * Tests for monthly command
 */

import { createMonthlyCommand } from '../../src/commands/monthly';
import { createDatabaseConnection } from '@intelligent-todo/shared';
import { createTestDatabase } from '@intelligent-todo/shared/src/database/connection';
import { initializeDatabase } from '@intelligent-todo/shared/src/database/migrations';
import Database from 'better-sqlite3';

// Mock dependencies
jest.mock('@intelligent-todo/shared', () => {
  const actual = jest.requireActual('@intelligent-todo/shared');
  return {
    ...actual,
    createDatabaseConnection: jest.fn(),
  };
});

// Mock process.exit to prevent test worker from dying
jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined): never => {
  throw new Error(`process.exit: ${code}`) as never;
});

describe('monthly command', () => {
  let mockDb: Database.Database;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    mockDb = createTestDatabase();
    await initializeDatabase(mockDb);
    (createDatabaseConnection as jest.Mock).mockReturnValue(mockDb);
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    mockDb.close();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should create monthly command', () => {
    const command = createMonthlyCommand();

    expect(command.name()).toBe('monthly');
    expect(command.description()).toContain('monthly progress summary');
  });

  it('should have month option', () => {
    const command = createMonthlyCommand();
    const options = command.options;

    const monthOption = options.find(opt => opt.long === '--month');
    expect(monthOption).toBeDefined();
  });

  it('should generate summary for current month', async () => {
    const command = createMonthlyCommand();

    // Execute command
    await command.parseAsync(['node', 'test'], { from: 'user' });

    // Should have called console.log with output
    expect(consoleLogSpy).toHaveBeenCalled();
    const output = consoleLogSpy.mock.calls.join('\n');
    expect(output).toContain('Monthly Progress Report');
  });

  it('should handle --month option', async () => {
    const command = createMonthlyCommand();

    await command.parseAsync(['node', 'test', '--month', '2025-09'], {
      from: 'user',
    });

    expect(consoleLogSpy).toHaveBeenCalled();
    const output = consoleLogSpy.mock.calls.join('\n');
    expect(output).toContain('September 2025');
  });

  it('should validate month format', async () => {
    const command = createMonthlyCommand();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    try {
      await command.parseAsync(['node', 'test', '--month', 'invalid'], {
        from: 'user',
      });
    } catch (error) {
      // Command may throw
    }

    const errorOutput = consoleErrorSpy.mock.calls.join('\n');
    expect(errorOutput).toContain('Invalid month format');

    consoleErrorSpy.mockRestore();
  });

  it('should close database connection after execution', async () => {
    const closeSpy = jest.spyOn(mockDb, 'close');
    const command = createMonthlyCommand();

    await command.parseAsync(['node', 'test'], { from: 'user' });

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    const errorDb = {
      open: true,
      close: jest.fn(),
      prepare: jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      }),
    } as unknown as Database.Database;

    (createDatabaseConnection as jest.Mock).mockReturnValue(errorDb);

    const command = createMonthlyCommand();
    const localConsoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    try {
      await command.parseAsync(['node', 'test'], { from: 'user' });
    } catch (error) {
      // Expected - process.exit throws in our mock
    }

    expect(localConsoleErrorSpy).toHaveBeenCalled();
    expect(errorDb.close).toHaveBeenCalled();

    localConsoleErrorSpy.mockRestore();
  });

  it('should display formatted summary output', async () => {
    const command = createMonthlyCommand();

    await command.parseAsync(['node', 'test'], { from: 'user' });

    const output = consoleLogSpy.mock.calls.join('\n');

    // Check for expected sections
    expect(output).toContain('📈 Tasks Overview');
    expect(output).toContain('Total Created');
    expect(output).toContain('Completed');
    expect(output).toContain('Completion Rate');
    expect(output).toContain('Summary saved for future reference');
  });

  it('should display zero values for empty month', async () => {
    const command = createMonthlyCommand();

    // Use a month with no tasks
    await command.parseAsync(['node', 'test', '--month', '2024-01'], {
      from: 'user',
    });

    const output = consoleLogSpy.mock.calls.join('\n');

    expect(output).toContain('0 tasks');
    expect(output).toContain('0%');
  });
});
