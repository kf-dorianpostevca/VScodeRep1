/**
 * Tests for ChartService
 */

import { ChartService } from '../../src/services/ChartService';
import { Task } from '../../src/models/Task';

describe('ChartService', () => {
  describe('generateWeeklyCompletionChart', () => {
    it('should generate chart for month with 4 weeks', () => {
      const tasks: Task[] = [
        createTask('2025-09-01', true),
        createTask('2025-09-02', true),
        createTask('2025-09-03', false),
        createTask('2025-09-08', true),
        createTask('2025-09-15', false),
        createTask('2025-09-22', true),
      ];

      const chart = ChartService.generateWeeklyCompletionChart(tasks, '2025-09');

      expect(chart).toContain('📊 Weekly Completion Pattern');
      expect(chart).toContain('Week 1');
      expect(chart).toContain('Week 2');
      expect(chart).toContain('Week 3');
      expect(chart).toContain('Week 4');
      expect(chart).toContain('Legend');
      expect(chart).toContain('█');
      expect(chart).toContain('░');
    });

    it('should handle empty month', () => {
      const tasks: Task[] = [];

      const chart = ChartService.generateWeeklyCompletionChart(tasks, '2025-09');

      expect(chart).toContain('No tasks created this month');
    });

    it('should calculate completion rates correctly', () => {
      const tasks: Task[] = [
        createTask('2025-09-01', true),
        createTask('2025-09-02', true),
        createTask('2025-09-03', false),
        createTask('2025-09-04', false),
      ];

      const chart = ChartService.generateWeeklyCompletionChart(tasks, '2025-09');

      expect(chart).toContain('2/4 tasks (50%)');
    });

    it('should show all completed bar when all tasks done', () => {
      const tasks: Task[] = [
        createTask('2025-09-01', true),
        createTask('2025-09-02', true),
      ];

      const chart = ChartService.generateWeeklyCompletionChart(tasks, '2025-09');

      expect(chart).toContain('2/2 tasks (100%)');
      expect(chart).toMatch(/█{20}/); // Full bar
    });

    it('should handle month with 5 weeks', () => {
      const tasks: Task[] = [
        createTask('2025-10-01', true),
        createTask('2025-10-31', true),
      ];

      const chart = ChartService.generateWeeklyCompletionChart(tasks, '2025-10');

      expect(chart).toContain('Week 5');
    });

    it('should group tasks by week correctly', () => {
      const tasks: Task[] = [
        createTask('2025-09-01', true), // Week 1
        createTask('2025-09-02', true), // Week 1
        createTask('2025-09-08', false), // Week 2
      ];

      const chart = ChartService.generateWeeklyCompletionChart(tasks, '2025-09');

      // Week 1 should have 2 tasks
      expect(chart).toMatch(/Week 1.*2\/2/);
      // Week 2 should have 1 task
      expect(chart).toMatch(/Week 2.*0\/1/);
    });

    it('should display total summary correctly', () => {
      const tasks: Task[] = [
        createTask('2025-09-01', true),
        createTask('2025-09-02', true),
        createTask('2025-09-03', false),
        createTask('2025-09-10', true),
      ];

      const chart = ChartService.generateWeeklyCompletionChart(tasks, '2025-09');

      expect(chart).toContain('Total: 3/4 tasks completed (75%)');
    });

    it('should handle no completions', () => {
      const tasks: Task[] = [
        createTask('2025-09-01', false),
        createTask('2025-09-02', false),
      ];

      const chart = ChartService.generateWeeklyCompletionChart(tasks, '2025-09');

      expect(chart).toContain('0/2 tasks (0%)');
      expect(chart).toMatch(/░{20}/); // Empty bar
    });
  });
});

/**
 * Helper to create test task
 */
function createTask(dateStr: string, completed: boolean): Task {
  return {
    id: `task-${dateStr}-${Math.random()}`,
    title: `Task ${dateStr}`,
    description: null,
    estimatedMinutes: null,
    actualMinutes: null,
    isCompleted: completed,
    createdAt: new Date(dateStr),
    completedAt: completed ? new Date(dateStr) : null,
    tags: [],
  };
}
