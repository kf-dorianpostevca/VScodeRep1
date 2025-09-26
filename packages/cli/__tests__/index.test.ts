/**
 * Tests for CLI application entry point
 */

import { initializeCli } from '../src/index';

// Mock commander to avoid actual CLI execution during tests
jest.mock('commander', () => ({
  Command: jest.fn().mockImplementation(() => ({
    name: jest.fn().mockReturnThis(),
    description: jest.fn().mockReturnThis(),
    version: jest.fn().mockReturnThis(),
    command: jest.fn().mockReturnThis(),
    action: jest.fn().mockReturnThis(),
    parse: jest.fn(),
  })),
}));

describe('CLI Application', () => {
  it('should initialize CLI without errors', () => {
    expect(() => initializeCli()).not.toThrow();
  });
});