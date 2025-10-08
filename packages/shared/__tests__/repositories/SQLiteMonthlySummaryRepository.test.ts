/**
 * Tests for SQLiteMonthlySummaryRepository
 */

import { SQLiteMonthlySummaryRepository } from '../../src/repositories/SQLiteMonthlySummaryRepository';
import { MonthlySummaryCreate } from '../../src/models/MonthlySummary';
import Database from 'better-sqlite3';
import { createTestDatabase } from '../../src/database/connection';
import { initializeDatabase } from '../../src/database/migrations';

describe('SQLiteMonthlySummaryRepository', () => {
  let db: Database.Database;
  let repository: SQLiteMonthlySummaryRepository;

  beforeEach(async () => {
    db = createTestDatabase();
    await initializeDatabase(db);
    repository = new SQLiteMonthlySummaryRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('save', () => {
    it('should save new monthly summary', async () => {
      const summaryData: MonthlySummaryCreate = {
        month: '2025-09',
        totalTasks: 10,
        completedTasks: 8,
        completionRate: 80,
        averageActualMinutes: 45,
        estimationAccuracy: 85,
        longestStreak: 7,
        mostProductiveDay: 'Monday',
        celebrationMessage: '🌟 Outstanding month!',
      };

      const summary = await repository.save(summaryData);

      expect(summary.id).toBeTruthy();
      expect(summary.month).toBe('2025-09');
      expect(summary.totalTasks).toBe(10);
      expect(summary.completedTasks).toBe(8);
      expect(summary.completionRate).toBe(80);
      expect(summary.averageActualMinutes).toBe(45);
      expect(summary.estimationAccuracy).toBe(85);
      expect(summary.longestStreak).toBe(7);
      expect(summary.mostProductiveDay).toBe('Monday');
      expect(summary.celebrationMessage).toBe('🌟 Outstanding month!');
      expect(summary.createdAt).toBeInstanceOf(Date);
      expect(summary.updatedAt).toBeInstanceOf(Date);
    });

    it('should update existing summary on conflict', async () => {
      const summaryData: MonthlySummaryCreate = {
        month: '2025-09',
        totalTasks: 5,
        completedTasks: 3,
        completionRate: 60,
        averageActualMinutes: null,
        estimationAccuracy: null,
        longestStreak: 2,
        mostProductiveDay: null,
        celebrationMessage: 'Keep going!',
      };

      // Save first time
      await repository.save(summaryData);

      // Save again with updated data
      const updatedData: MonthlySummaryCreate = {
        ...summaryData,
        totalTasks: 10,
        completedTasks: 8,
        completionRate: 80,
      };

      const summary2 = await repository.save(updatedData);

      // Should update, not create new
      expect(summary2.month).toBe('2025-09');
      expect(summary2.totalTasks).toBe(10);
      expect(summary2.completedTasks).toBe(8);
      expect(summary2.completionRate).toBe(80);

      // Verify only one record exists
      const all = await repository.findAll();
      expect(all.length).toBe(1);
    });

    it('should handle null values correctly', async () => {
      const summaryData: MonthlySummaryCreate = {
        month: '2025-09',
        totalTasks: 5,
        completedTasks: 0,
        completionRate: 0,
        averageActualMinutes: null,
        estimationAccuracy: null,
        longestStreak: 0,
        mostProductiveDay: null,
        celebrationMessage: 'Start tracking!',
      };

      const summary = await repository.save(summaryData);

      expect(summary.averageActualMinutes).toBeNull();
      expect(summary.estimationAccuracy).toBeNull();
      expect(summary.mostProductiveDay).toBeNull();
    });
  });

  describe('findByMonth', () => {
    it('should find summary by month', async () => {
      const summaryData: MonthlySummaryCreate = {
        month: '2025-09',
        totalTasks: 10,
        completedTasks: 8,
        completionRate: 80,
        averageActualMinutes: 45,
        estimationAccuracy: 85,
        longestStreak: 7,
        mostProductiveDay: 'Monday',
        celebrationMessage: '🌟 Outstanding month!',
      };

      await repository.save(summaryData);

      const found = await repository.findByMonth('2025-09');

      expect(found).not.toBeNull();
      expect(found!.month).toBe('2025-09');
      expect(found!.totalTasks).toBe(10);
    });

    it('should return null for non-existent month', async () => {
      const found = await repository.findByMonth('2024-01');

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all summaries ordered by month descending', async () => {
      const months = ['2025-01', '2025-03', '2025-02'];

      for (const month of months) {
        await repository.save({
          month,
          totalTasks: 5,
          completedTasks: 3,
          completionRate: 60,
          averageActualMinutes: null,
          estimationAccuracy: null,
          longestStreak: 0,
          mostProductiveDay: null,
          celebrationMessage: 'Keep going!',
        });
      }

      const all = await repository.findAll();

      expect(all.length).toBe(3);
      expect(all[0].month).toBe('2025-03');
      expect(all[1].month).toBe('2025-02');
      expect(all[2].month).toBe('2025-01');
    });

    it('should respect limit parameter', async () => {
      for (let i = 1; i <= 5; i++) {
        await repository.save({
          month: `2025-0${i}`,
          totalTasks: 5,
          completedTasks: 3,
          completionRate: 60,
          averageActualMinutes: null,
          estimationAccuracy: null,
          longestStreak: 0,
          mostProductiveDay: null,
          celebrationMessage: 'Keep going!',
        });
      }

      const limited = await repository.findAll(3);

      expect(limited.length).toBe(3);
    });

    it('should return empty array when no summaries exist', async () => {
      const all = await repository.findAll();

      expect(all).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete summary by month', async () => {
      await repository.save({
        month: '2025-09',
        totalTasks: 10,
        completedTasks: 8,
        completionRate: 80,
        averageActualMinutes: 45,
        estimationAccuracy: 85,
        longestStreak: 7,
        mostProductiveDay: 'Monday',
        celebrationMessage: '🌟 Outstanding month!',
      });

      const deleted = await repository.delete('2025-09');

      expect(deleted).toBe(true);

      const found = await repository.findByMonth('2025-09');
      expect(found).toBeNull();
    });

    it('should return false for non-existent month', async () => {
      const deleted = await repository.delete('2024-01');

      expect(deleted).toBe(false);
    });
  });

  describe('data integrity', () => {
    it('should enforce unique month constraint', async () => {
      const summaryData: MonthlySummaryCreate = {
        month: '2025-09',
        totalTasks: 10,
        completedTasks: 8,
        completionRate: 80,
        averageActualMinutes: 45,
        estimationAccuracy: 85,
        longestStreak: 7,
        mostProductiveDay: 'Monday',
        celebrationMessage: '🌟 Outstanding month!',
      };

      await repository.save(summaryData);
      await repository.save(summaryData); // Should update, not error

      const all = await repository.findAll();
      expect(all.length).toBe(1);
    });

    it('should validate month format via database constraint', async () => {
      const invalidData: MonthlySummaryCreate = {
        month: 'invalid-format',
        totalTasks: 5,
        completedTasks: 3,
        completionRate: 60,
        averageActualMinutes: null,
        estimationAccuracy: null,
        longestStreak: 0,
        mostProductiveDay: null,
        celebrationMessage: 'Test',
      };

      await expect(repository.save(invalidData)).rejects.toThrow();
    });

    it('should maintain timestamps correctly', async () => {
      const summaryData: MonthlySummaryCreate = {
        month: '2025-09',
        totalTasks: 5,
        completedTasks: 3,
        completionRate: 60,
        averageActualMinutes: null,
        estimationAccuracy: null,
        longestStreak: 0,
        mostProductiveDay: null,
        celebrationMessage: 'Test',
      };

      const summary1 = await repository.save(summaryData);
      const createdAt1 = summary1.createdAt;

      // Wait for at least 1 second (SQLite CURRENT_TIMESTAMP has second precision)
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Update
      const updatedData = { ...summaryData, totalTasks: 10 };
      const summary2 = await repository.save(updatedData);

      expect(summary2.createdAt.getTime()).toBe(createdAt1.getTime());
      expect(summary2.updatedAt.getTime()).toBeGreaterThan(summary2.createdAt.getTime());
    });
  });
});
