// Global test setup for CLI package

// Mock console methods to avoid output during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Set test environment
process.env.NODE_ENV = 'test';