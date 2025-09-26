// Global test setup for API package

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};