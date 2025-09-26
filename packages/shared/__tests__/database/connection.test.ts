/**
 * Tests for database connection utilities
 */

import { createTestDatabase, closeDatabaseConnection } from '../../src/database/connection';

describe('Database Connection', () => {
  it('should create an in-memory test database', () => {
    const db = createTestDatabase();

    expect(db).toBeDefined();
    expect(db.open).toBe(true);

    // Test basic query
    const result = db.prepare('SELECT 1 as test').get() as { test: number };
    expect(result.test).toBe(1);

    closeDatabaseConnection(db);
    expect(db.open).toBe(false);
  });

  it('should close database connection safely', () => {
    const db = createTestDatabase();

    closeDatabaseConnection(db);
    expect(db.open).toBe(false);

    // Should not throw when closing already closed database
    expect(() => closeDatabaseConnection(db)).not.toThrow();
  });
});