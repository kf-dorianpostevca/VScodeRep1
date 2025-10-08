/**
 * Tests for MonthlySummaryService
 */

import { MonthlySummaryService } from '../../src/services/MonthlySummaryService';
import { SQLiteTaskRepository } from '../../src/repositories/SQLiteTaskRepository';
import { SQLiteMonthlySummaryRepository } from '../../src/repositories/SQLiteMonthlySummaryRepository';
import Database from 'better-sqlite3';
import { createTestDatabase } from '../../src/database/connection';
import { initializeDatabase } from '../../src/database/migrations';

describe('MonthlySummaryService', () => {
  let db: Database.Database;
  let taskRepository: SQLiteTaskRepository;
  let summaryRepository: SQLiteMonthlySummaryRepository;
  let service: MonthlySummaryService;

  beforeEach(async () => {
    db = createTestDatabase();
    await initializeDatabase(db);
    taskRepository = new SQLiteTaskRepository(db);
    summaryRepository = new SQLiteMonthlySummaryRepository(db);
    service = new MonthlySummaryService(taskRepository, summaryRepository);
  });

  afterEach(() => {
    taskRepository.close();
    db.close();
  });

  describe('generateMonthlySummary', () => {
    it('should generate summary for month with tasks', async () => {
      // Create tasks
      await taskRepository.create({
        title: 'Task 1',
        description: null,
        estimatedMinutes: 30,
      });

      const task2 = await taskRepository.create({
        title: 'Task 2',
        description: null,
        estimatedMinutes: 60,
      });

      // Complete one task
      await taskRepository.markComplete(task2.id);

      const month = new Date().toISOString().slice(0, 7); // YYYY-MM
      const summary = await service.generateMonthlySummary(month);

      expect(summary.month).toBe(month);
      expect(summary.totalTasks).toBe(2);
      expect(summary.completedTasks).toBe(1);
      expect(summary.completionRate).toBe(50);
      expect(summary.celebrationMessage).toBeTruthy();
    });

    it('should handle empty month', async () => {
      const month = '2024-01';
      const summary = await service.generateMonthlySummary(month);

      expect(summary.totalTasks).toBe(0);
      expect(summary.completedTasks).toBe(0);
      expect(summary.completionRate).toBe(0);
      expect(summary.longestStreak).toBe(0);
      expect(summary.mostProductiveDay).toBeNull();
    });

    it('should calculate completion rate correctly', async () => {
      // Create 5 tasks, complete 4
      for (let i = 0; i < 5; i++) {
        const task = await taskRepository.create({
          title: `Task ${i}`,
          description: null,
          estimatedMinutes: null,
        });

        if (i < 4) {
          await taskRepository.markComplete(task.id);
        }
      }

      const month = new Date().toISOString().slice(0, 7);
      const summary = await service.generateMonthlySummary(month);

      expect(summary.completionRate).toBe(80);
    });

    it('should calculate productivity streak', async () => {
      // Create tasks completed on consecutive days
      // Using direct DB updates to set specific completion dates for testing
      const baseDate = new Date('2025-09-01');

      for (let i = 0; i < 5; i++) {
        const completedDate = new Date(baseDate);
        completedDate.setDate(baseDate.getDate() + i);

        const task = await taskRepository.create({
          title: `Task ${i}`,
          description: null,
          estimatedMinutes: null,
        });

        // Direct DB update to set specific dates for testing
        db.prepare('UPDATE tasks SET created_at = ?, is_completed = 1, completed_at = ? WHERE id = ?')
          .run(completedDate.toISOString(), completedDate.toISOString(), task.id);
      }

      const summary = await service.generateMonthlySummary('2025-09');

      expect(summary.longestStreak).toBeGreaterThan(0);
    });

    it('should identify most productive day', async () => {
      // Create multiple tasks completed on Monday
      const monday = new Date('2025-09-01'); // Assuming this is Monday

      for (let i = 0; i < 3; i++) {
        const task = await taskRepository.create({
          title: `Monday Task ${i}`,
          description: null,
          estimatedMinutes: null,
        });

        // Direct DB update to set specific dates
        db.prepare('UPDATE tasks SET created_at = ?, is_completed = 1, completed_at = ? WHERE id = ?')
          .run(monday.toISOString(), monday.toISOString(), task.id);
      }

      // Create one task on Tuesday
      const tuesday = new Date('2025-09-02');
      const task = await taskRepository.create({
        title: 'Tuesday Task',
        description: null,
        estimatedMinutes: null,
      });

      db.prepare('UPDATE tasks SET created_at = ?, is_completed = 1, completed_at = ? WHERE id = ?')
        .run(tuesday.toISOString(), tuesday.toISOString(), task.id);

      const summary = await service.generateMonthlySummary('2025-09');

      expect(summary.mostProductiveDay).toBeTruthy();
    });

    it('should calculate average actual minutes', async () => {
      const task1 = await taskRepository.create({
        title: 'Task 1',
        description: null,
        estimatedMinutes: 60,
      });

      const task2 = await taskRepository.create({
        title: 'Task 2',
        description: null,
        estimatedMinutes: 30,
      });

      await taskRepository.markComplete(task1.id);
      await taskRepository.markComplete(task2.id);

      const month = new Date().toISOString().slice(0, 7);
      const summary = await service.generateMonthlySummary(month);

      // actualMinutes is computed from timestamps, so we just verify it's calculated
      expect(summary.averageActualMinutes).toBeGreaterThanOrEqual(0)
    });

    it('should generate celebration message based on performance', async () => {
      // Create high-performing month (>80% completion)
      for (let i = 0; i < 10; i++) {
        const task = await taskRepository.create({
          title: `Task ${i}`,
          description: null,
          estimatedMinutes: null,
        });

        if (i < 9) {
          await taskRepository.markComplete(task.id);
        }
      }

      const month = new Date().toISOString().slice(0, 7);
      const summary = await service.generateMonthlySummary(month);

      expect(summary.celebrationMessage).toContain('🌟');
      expect(summary.celebrationMessage.toLowerCase()).toMatch(/outstanding|great/);
    });

    it('should persist summary to database', async () => {
      const month = new Date().toISOString().slice(0, 7);
      const summary1 = await service.generateMonthlySummary(month);

      // Retrieve saved summary
      const summary2 = await summaryRepository.findByMonth(month);

      expect(summary2).not.toBeNull();
      expect(summary2!.id).toBe(summary1.id);
      expect(summary2!.totalTasks).toBe(summary1.totalTasks);
    });

    it('should update existing summary on regeneration', async () => {
      const month = new Date().toISOString().slice(0, 7);

      // Generate first summary
      const summary1 = await service.generateMonthlySummary(month);
      expect(summary1.totalTasks).toBe(0);

      // Add a task
      await taskRepository.create({
        title: 'New Task',
        description: null,
        estimatedMinutes: null,
      });

      // Regenerate summary
      const summary2 = await service.generateMonthlySummary(month);
      expect(summary2.totalTasks).toBe(1);
      expect(summary2.month).toBe(summary1.month);
    });
  });

  describe('productivity streak calculation', () => {
    it('should calculate streak with consecutive completions', async () => {
      const baseDate = new Date('2025-09-01');

      for (let i = 0; i < 7; i++) {
        const completedDate = new Date(baseDate);
        completedDate.setDate(baseDate.getDate() + i);

        const task = await taskRepository.create({
          title: `Task ${i}`,
          description: null,
          estimatedMinutes: null,
        });

        // Direct DB update for test
        db.prepare('UPDATE tasks SET created_at = ?, is_completed = 1, completed_at = ? WHERE id = ?')
          .run(completedDate.toISOString(), completedDate.toISOString(), task.id);
      }

      const summary = await service.generateMonthlySummary('2025-09');

      expect(summary.longestStreak).toBe(7);
    });

    it('should handle gaps in streak', async () => {
      const dates = ['2025-09-01', '2025-09-02', '2025-09-05', '2025-09-06'];

      for (const dateStr of dates) {
        const task = await taskRepository.create({
          title: `Task ${dateStr}`,
          description: null,
          estimatedMinutes: null,
        });

        const dateObj = new Date(dateStr);
        db.prepare('UPDATE tasks SET created_at = ?, is_completed = 1, completed_at = ? WHERE id = ?')
          .run(dateObj.toISOString(), dateObj.toISOString(), task.id);
      }

      const summary = await service.generateMonthlySummary('2025-09');

      expect(summary.longestStreak).toBe(2); // Either Sep 1-2 or Sep 5-6
    });

    it('should handle multiple completions same day', async () => {
      const sameDay = new Date('2025-09-01');

      for (let i = 0; i < 3; i++) {
        const task = await taskRepository.create({
          title: `Task ${i}`,
          description: null,
          estimatedMinutes: null,
        });

        db.prepare('UPDATE tasks SET created_at = ?, is_completed = 1, completed_at = ? WHERE id = ?')
          .run(sameDay.toISOString(), sameDay.toISOString(), task.id);
      }

      const summary = await service.generateMonthlySummary('2025-09');

      expect(summary.longestStreak).toBe(1); // All same day = 1 day streak
    });
  });

  describe('most productive day calculation', () => {
    it('should identify day with most completions', async () => {
      // Monday tasks
      for (let i = 0; i < 5; i++) {
        const task = await taskRepository.create({
          title: `Monday Task ${i}`,
          description: null,
          estimatedMinutes: null,
        });

        const dateObj = new Date('2025-09-01');
        db.prepare('UPDATE tasks SET created_at = ?, is_completed = 1, completed_at = ? WHERE id = ?')
          .run(dateObj.toISOString(), dateObj.toISOString(), task.id);
      }

      // Tuesday tasks (fewer)
      for (let i = 0; i < 2; i++) {
        const task = await taskRepository.create({
          title: `Tuesday Task ${i}`,
          description: null,
          estimatedMinutes: null,
        });

        const dateObj = new Date('2025-09-02');
        db.prepare('UPDATE tasks SET created_at = ?, is_completed = 1, completed_at = ? WHERE id = ?')
          .run(dateObj.toISOString(), dateObj.toISOString(), task.id);
      }

      const summary = await service.generateMonthlySummary('2025-09');

      expect(summary.mostProductiveDay).toBe('Monday');
    });

    it('should return null when no completions', async () => {
      await taskRepository.create({
        title: 'Incomplete Task',
        description: null,
        estimatedMinutes: null,
      });

      const month = new Date().toISOString().slice(0, 7);
      const summary = await service.generateMonthlySummary(month);

      expect(summary.mostProductiveDay).toBeNull();
    });
  });
});
