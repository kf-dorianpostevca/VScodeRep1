/**
 * Tests for MonthlySummaryFormatter
 */

import { formatMonthlySummary, formatError } from '../../src/formatters/MonthlySummaryFormatter';
import { MonthlySummary } from '@intelligent-todo/shared';

describe('MonthlySummaryFormatter', () => {
  describe('formatMonthlySummary', () => {
    it('should format complete summary with all data', () => {
      const summary: MonthlySummary = {
        id: 'test-id',
        month: '2025-09',
        totalTasks: 20,
        completedTasks: 16,
        completionRate: 80,
        averageActualMinutes: 45,
        estimationAccuracy: 85,
        longestStreak: 7,
        mostProductiveDay: 'Monday',
        celebrationMessage: '🌟 Outstanding month!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const output = formatMonthlySummary(summary);

      expect(output).toContain('🎉 Monthly Progress Report - September 2025');
      expect(output).toContain('📈 Tasks Overview');
      expect(output).toContain('Total Created: 20 tasks');
      expect(output).toContain('Completed: 16 tasks');
      expect(output).toContain('Completion Rate: 80%');
      expect(output).toContain('⏱️  Time Estimation');
      expect(output).toContain('Accuracy: 85%');
      expect(output).toContain('Average Task Duration: 45 minutes');
      expect(output).toContain('🔥 Productivity Streak');
      expect(output).toContain('Longest Streak: 7 consecutive days');
      expect(output).toContain('💪 Most Productive Day');
      expect(output).toContain('Monday');
      expect(output).toContain('🌟 Outstanding month!');
      expect(output).toContain('✨ Summary saved for future reference');
    });

    it('should handle null estimation accuracy', () => {
      const summary: MonthlySummary = {
        id: 'test-id',
        month: '2025-09',
        totalTasks: 10,
        completedTasks: 5,
        completionRate: 50,
        averageActualMinutes: null,
        estimationAccuracy: null,
        longestStreak: 0,
        mostProductiveDay: null,
        celebrationMessage: 'Keep going!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const output = formatMonthlySummary(summary);

      expect(output).not.toContain('⏱️  Time Estimation');
      expect(output).not.toContain('Accuracy');
    });

    it('should handle zero streak', () => {
      const summary: MonthlySummary = {
        id: 'test-id',
        month: '2025-09',
        totalTasks: 5,
        completedTasks: 0,
        completionRate: 0,
        averageActualMinutes: null,
        estimationAccuracy: null,
        longestStreak: 0,
        mostProductiveDay: null,
        celebrationMessage: 'Start tracking!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const output = formatMonthlySummary(summary);

      expect(output).not.toContain('🔥 Productivity Streak');
    });

    it('should handle null most productive day', () => {
      const summary: MonthlySummary = {
        id: 'test-id',
        month: '2025-09',
        totalTasks: 5,
        completedTasks: 2,
        completionRate: 40,
        averageActualMinutes: null,
        estimationAccuracy: null,
        longestStreak: 1,
        mostProductiveDay: null,
        celebrationMessage: 'Keep building!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const output = formatMonthlySummary(summary);

      expect(output).not.toContain('💪 Most Productive Day');
    });

    it('should format single day streak correctly', () => {
      const summary: MonthlySummary = {
        id: 'test-id',
        month: '2025-09',
        totalTasks: 5,
        completedTasks: 3,
        completionRate: 60,
        averageActualMinutes: null,
        estimationAccuracy: null,
        longestStreak: 1,
        mostProductiveDay: 'Tuesday',
        celebrationMessage: 'Good start!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const output = formatMonthlySummary(summary);

      expect(output).toContain('Longest Streak: 1 consecutive day');
      expect(output).not.toContain('1 consecutive days'); // Should not pluralize
    });

    it('should format minutes correctly', () => {
      const summary1: MonthlySummary = {
        id: 'test-id',
        month: '2025-09',
        totalTasks: 5,
        completedTasks: 3,
        completionRate: 60,
        averageActualMinutes: 45,
        estimationAccuracy: 80,
        longestStreak: 0,
        mostProductiveDay: null,
        celebrationMessage: 'Great!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const output1 = formatMonthlySummary(summary1);
      expect(output1).toContain('45 minutes');

      const summary2: MonthlySummary = {
        ...summary1,
        averageActualMinutes: 60,
      };

      const output2 = formatMonthlySummary(summary2);
      expect(output2).toContain('1 hour');

      const summary3: MonthlySummary = {
        ...summary1,
        averageActualMinutes: 120,
      };

      const output3 = formatMonthlySummary(summary3);
      expect(output3).toContain('2 hours');

      const summary4: MonthlySummary = {
        ...summary1,
        averageActualMinutes: 90,
      };

      const output4 = formatMonthlySummary(summary4);
      expect(output4).toContain('1 hour 30 min');
    });

    it('should format different months correctly', () => {
      const months = [
        { month: '2025-01', name: 'January 2025' },
        { month: '2025-06', name: 'June 2025' },
        { month: '2025-12', name: 'December 2025' },
      ];

      for (const { month, name } of months) {
        const summary: MonthlySummary = {
          id: 'test-id',
          month,
          totalTasks: 10,
          completedTasks: 5,
          completionRate: 50,
          averageActualMinutes: null,
          estimationAccuracy: null,
          longestStreak: 0,
          mostProductiveDay: null,
          celebrationMessage: 'Test',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const output = formatMonthlySummary(summary);
        expect(output).toContain(name);
      }
    });

    it('should include all emoji indicators', () => {
      const summary: MonthlySummary = {
        id: 'test-id',
        month: '2025-09',
        totalTasks: 20,
        completedTasks: 18,
        completionRate: 90,
        averageActualMinutes: 50,
        estimationAccuracy: 90,
        longestStreak: 10,
        mostProductiveDay: 'Wednesday',
        celebrationMessage: '🎉 Excellent work!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const output = formatMonthlySummary(summary);

      expect(output).toContain('🎉'); // Report header
      expect(output).toContain('📈'); // Tasks overview
      expect(output).toContain('🎯'); // Total created
      expect(output).toContain('✅'); // Completed
      expect(output).toContain('📊'); // Completion rate
      expect(output).toContain('⏱️'); // Time estimation
      expect(output).toContain('🎓'); // Accuracy
      expect(output).toContain('📏'); // Average duration
      expect(output).toContain('🔥'); // Streak
      expect(output).toContain('💪'); // Most productive day
      expect(output).toContain('🗓️'); // Calendar
      expect(output).toContain('✨'); // Summary saved
    });
  });

  describe('formatError', () => {
    it('should format Error objects', () => {
      const error = new Error('Something went wrong');
      const output = formatError(error);

      expect(output).toBe('❌ Error: Something went wrong');
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      const output = formatError(error);

      expect(output).toBe('❌ Error: Unknown error occurred');
    });

    it('should handle null/undefined', () => {
      const output1 = formatError(null);
      expect(output1).toBe('❌ Error: Unknown error occurred');

      const output2 = formatError(undefined);
      expect(output2).toBe('❌ Error: Unknown error occurred');
    });
  });
});
