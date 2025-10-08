/**
 * Tests for CLI application entry point
 */

import { initializeCli } from '../src/index';

// Mock process.exit to prevent Jest worker failures
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit called');
});

// Mock dependencies
jest.mock('@intelligent-todo/shared', () => {
  const actual = jest.requireActual('@intelligent-todo/shared');
  return {
    ...actual,
    createDatabaseConnection: jest.fn(() => ({
      close: jest.fn(),
      open: true,
    })),
    initializeDatabase: jest.fn().mockResolvedValue(0),
  };
});

jest.mock('commander', () => {
  const mockParseAsync = jest.fn().mockResolvedValue(undefined);
  return {
    Command: jest.fn().mockImplementation(() => ({
      name: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      version: jest.fn().mockReturnThis(),
      addCommand: jest.fn().mockReturnThis(),
      addHelpText: jest.fn().mockReturnThis(),
      parseAsync: mockParseAsync,
    })),
    mockParseAsync, // Export for test access
  };
});

// Mock the command creators
jest.mock('../src/commands/add', () => ({
  createAddCommand: jest.fn(() => ({
    name: jest.fn().mockReturnValue('add'),
  })),
}));

jest.mock('../src/commands/list', () => ({
  createListCommand: jest.fn(() => ({
    name: jest.fn().mockReturnValue('list'),
  })),
}));

jest.mock('../src/commands/complete', () => ({
  createCompleteCommand: jest.fn(() => ({
    name: jest.fn().mockReturnValue('complete'),
  })),
  createDoneCommand: jest.fn(() => ({
    name: jest.fn().mockReturnValue('done'),
  })),
}));

jest.mock('../src/commands/edit', () => ({
  createEditCommand: jest.fn(() => ({
    name: jest.fn().mockReturnValue('edit'),
  })),
}));

jest.mock('../src/commands/delete', () => ({
  createDeleteCommand: jest.fn(() => ({
    name: jest.fn().mockReturnValue('delete'),
  })),
}));

jest.mock('../src/commands/stats', () => ({
  createStatsCommand: jest.fn(() => ({
    name: jest.fn().mockReturnValue('stats'),
  })),
}));

jest.mock('../src/commands/monthly', () => ({
  createMonthlyCommand: jest.fn(() => ({
    name: jest.fn().mockReturnValue('monthly'),
  })),
}));

jest.mock('../src/commands/config', () => ({
  createConfigCommand: jest.fn(() => ({
    name: jest.fn().mockReturnValue('config'),
  })),
}));

describe('CLI Application', () => {
  let mockParseAsync: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExit.mockClear();
    // Get the mock from the commander module
    const commanderMock = require('commander');
    mockParseAsync = commanderMock.mockParseAsync;
    if (mockParseAsync) {
      mockParseAsync.mockClear();
    }
  });

  afterAll(() => {
    mockExit.mockRestore();
  });

  it('should initialize CLI without errors', async () => {
    const mockInitializeDatabase = require('@intelligent-todo/shared').initializeDatabase;
    mockInitializeDatabase.mockResolvedValueOnce(0);

    await expect(initializeCli()).resolves.toBeUndefined();
  });

  it('should initialize database before setting up commands', async () => {
    const mockInitializeDatabase = require('@intelligent-todo/shared').initializeDatabase;
    mockInitializeDatabase.mockResolvedValueOnce(0);

    await initializeCli();

    expect(mockInitializeDatabase).toHaveBeenCalled();
  });

  it('should handle initialization errors gracefully', async () => {
    // Mock database initialization failure
    const mockInitializeDatabase = require('@intelligent-todo/shared').initializeDatabase;
    mockInitializeDatabase.mockRejectedValueOnce(new Error('Database connection failed'));

    await expect(initializeCli()).rejects.toThrow('process.exit called');
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});