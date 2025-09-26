// Global test setup for shared package
import fs from 'fs';
import path from 'path';

// Clean up test databases before each test suite
beforeEach(() => {
  // Remove any test database files
  const testDbPath = path.join(__dirname, '..', 'test.db');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

afterEach(() => {
  // Clean up test databases after each test
  const testDbPath = path.join(__dirname, '..', 'test.db');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});