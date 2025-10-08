/**
 * Unit tests for StatsFormatter
 * Tests formatting of stats output, celebration messages, and edge cases
 */

import { formatStats, formatError } from '../../src/formatters/StatsFormatter';
import { AccuracyStats } from '@intelligent-todo/shared';

describe('StatsFormatter', () => {
  describe('formatStats', () => {
    it('should format stats with no completed tasks', () => {
      const stats: AccuracyStats = {
        accuracy: null,
        tasksAnalyzed: 0,
        totalCompleted: 0,
        averageEstimate: null,
        averageActual: null,
        accurateCount: 0,
        overestimateCount: 0,
        underestimateCount: 0,
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('📊 Your Productivity Stats - October 2025');
      expect(output).toContain('No completed tasks yet this month');
      expect(output).toContain('Start completing some tasks');
    });

    it('should format stats with completed tasks but no estimates', () => {
      const stats: AccuracyStats = {
        accuracy: null,
        tasksAnalyzed: 0,
        totalCompleted: 5,
        averageEstimate: null,
        averageActual: null,
        accurateCount: 0,
        overestimateCount: 0,
        underestimateCount: 0,
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Total Tasks: 5');
      expect(output).toContain('With Estimates: 0');
      expect(output).toContain('Try adding time estimates');
      expect(output).toContain('todo add "task" --estimate 30m');
    });

    it('should format stats with high accuracy (>85%)', () => {
      const stats: AccuracyStats = {
        accuracy: 92,
        tasksAnalyzed: 10,
        totalCompleted: 10,
        averageEstimate: 45,
        averageActual: 43,
        accurateCount: 8,
        overestimateCount: 1,
        underestimateCount: 1,
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Overall Accuracy: 92%');
      expect(output).toContain('Tasks analyzed: 10 with time estimates');
      expect(output).toContain('Accurate: 8 (80%)');
      expect(output).toContain('Overestimated: 1 (10%)');
      expect(output).toContain('Underestimated: 1 (10%)');
      expect(output).toContain('Estimated: 45 min');
      expect(output).toContain('Actual: 43 min');
      expect(output).toContain('getting really good at estimating');
    });

    it('should format stats with good accuracy (70-85%)', () => {
      const stats: AccuracyStats = {
        accuracy: 78,
        tasksAnalyzed: 10,
        totalCompleted: 12,
        averageEstimate: 60,
        averageActual: 55,
        accurateCount: 6,
        overestimateCount: 2,
        underestimateCount: 2,
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Overall Accuracy: 78%');
      expect(output).toContain('Nice work!');
      expect(output).toContain('estimates are becoming more accurate');
    });

    it('should format stats with learning accuracy (<70%)', () => {
      const stats: AccuracyStats = {
        accuracy: 55,
        tasksAnalyzed: 8,
        totalCompleted: 10,
        averageEstimate: 30,
        averageActual: 45,
        accurateCount: 2,
        overestimateCount: 1,
        underestimateCount: 5,
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Overall Accuracy: 55%');
      expect(output).toContain("You're learning your patterns");
      expect(output).toContain('Keep tracking to improve');
    });

    it('should show upward trend indicator', () => {
      const stats: AccuracyStats = {
        accuracy: 88, // Changed to > 85 to trigger high accuracy message
        tasksAnalyzed: 10,
        totalCompleted: 10,
        averageEstimate: 40,
        averageActual: 38,
        accurateCount: 7,
        overestimateCount: 2,
        underestimateCount: 1,
        trend: {
          direction: 'up',
          percentage: 12,
        },
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Trend: ↑ 12% improvement from last month');
      expect(output).toContain('Your estimation accuracy is improving');
    });

    it('should show stable trend indicator', () => {
      const stats: AccuracyStats = {
        accuracy: 90,
        tasksAnalyzed: 10,
        totalCompleted: 10,
        averageEstimate: 50,
        averageActual: 48,
        accurateCount: 8,
        overestimateCount: 1,
        underestimateCount: 1,
        trend: {
          direction: 'stable',
          percentage: 2,
        },
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Trend: → 2% stable from last month');
    });

    it('should show downward trend indicator', () => {
      const stats: AccuracyStats = {
        accuracy: 65,
        tasksAnalyzed: 10,
        totalCompleted: 10,
        averageEstimate: 30,
        averageActual: 42,
        accurateCount: 4,
        overestimateCount: 1,
        underestimateCount: 5,
        trend: {
          direction: 'down',
          percentage: 8,
        },
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Trend: ↓ 8% change from last month');
    });

    it('should format time under 60 minutes correctly', () => {
      const stats: AccuracyStats = {
        accuracy: 85,
        tasksAnalyzed: 5,
        totalCompleted: 5,
        averageEstimate: 45,
        averageActual: 42,
        accurateCount: 4,
        overestimateCount: 1,
        underestimateCount: 0,
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Estimated: 45 min');
      expect(output).toContain('Actual: 42 min');
    });

    it('should format time in hours and minutes', () => {
      const stats: AccuracyStats = {
        accuracy: 80,
        tasksAnalyzed: 5,
        totalCompleted: 5,
        averageEstimate: 135, // 2 hours 15 minutes
        averageActual: 125, // 2 hours 5 minutes
        accurateCount: 4,
        overestimateCount: 1,
        underestimateCount: 0,
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Estimated: 2 hr 15 min');
      expect(output).toContain('Actual: 2 hr 5 min');
    });

    it('should format exact hours without minutes', () => {
      const stats: AccuracyStats = {
        accuracy: 85,
        tasksAnalyzed: 5,
        totalCompleted: 5,
        averageEstimate: 120, // Exactly 2 hours
        averageActual: 60, // Exactly 1 hour
        accurateCount: 4,
        overestimateCount: 1,
        underestimateCount: 0,
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Estimated: 2 hr');
      expect(output).toContain('Actual: 1 hr');
    });

    it('should celebrate improvement trend for high accuracy', () => {
      const stats: AccuracyStats = {
        accuracy: 92,
        tasksAnalyzed: 10,
        totalCompleted: 10,
        averageEstimate: 40,
        averageActual: 38,
        accurateCount: 8,
        overestimateCount: 1,
        underestimateCount: 1,
        trend: {
          direction: 'up',
          percentage: 10,
        },
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Excellent work! Your estimation accuracy is improving');
    });

    it('should celebrate improvement trend for good accuracy', () => {
      const stats: AccuracyStats = {
        accuracy: 75,
        tasksAnalyzed: 10,
        totalCompleted: 10,
        averageEstimate: 40,
        averageActual: 42,
        accurateCount: 6,
        overestimateCount: 2,
        underestimateCount: 2,
        trend: {
          direction: 'up',
          percentage: 8,
        },
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Nice progress! Your estimates are becoming more accurate');
    });

    it('should celebrate improvement trend even with low accuracy', () => {
      const stats: AccuracyStats = {
        accuracy: 60,
        tasksAnalyzed: 10,
        totalCompleted: 10,
        averageEstimate: 30,
        averageActual: 45,
        accurateCount: 3,
        overestimateCount: 1,
        underestimateCount: 6,
        trend: {
          direction: 'up',
          percentage: 15,
        },
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain("You're learning your patterns! Keep tracking to improve - 15% better than last month!");
    });

    it('should handle edge case with 100% accuracy', () => {
      const stats: AccuracyStats = {
        accuracy: 100,
        tasksAnalyzed: 5,
        totalCompleted: 5,
        averageEstimate: 30,
        averageActual: 30,
        accurateCount: 5,
        overestimateCount: 0,
        underestimateCount: 0,
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Overall Accuracy: 100%');
      expect(output).toContain('Accurate: 5 (100%)');
      expect(output).toContain('Overestimated: 0 (0%)');
      expect(output).toContain('Underestimated: 0 (0%)');
    });

    it('should handle partial completion scenario', () => {
      const stats: AccuracyStats = {
        accuracy: 80,
        tasksAnalyzed: 5,
        totalCompleted: 10, // Only 5 had estimates
        averageEstimate: 40,
        averageActual: 42,
        accurateCount: 4,
        overestimateCount: 1,
        underestimateCount: 0,
      };

      const output = formatStats(stats, 'October 2025');

      expect(output).toContain('Total Tasks: 10');
      expect(output).toContain('Completed: 10');
      expect(output).toContain('With Estimates: 5');
    });
  });

  describe('formatError', () => {
    it('should format Error instance', () => {
      const error = new Error('Database connection failed');
      const output = formatError(error);

      expect(output).toBe('❌ Error: Database connection failed');
    });

    it('should format unknown error', () => {
      const output = formatError('Something went wrong');

      expect(output).toBe('❌ Error: Unknown error occurred');
    });

    it('should handle null/undefined error', () => {
      const output = formatError(null);

      expect(output).toBe('❌ Error: Unknown error occurred');
    });

    it('should handle object without message', () => {
      const output = formatError({ code: 500 });

      expect(output).toBe('❌ Error: Unknown error occurred');
    });
  });
});
