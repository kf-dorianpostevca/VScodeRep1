/**
 * Unit tests for EstimationAccuracyService
 * Tests accuracy calculation, trend analysis, and edge case handling
 */

import { EstimationAccuracyService } from '../../src/services/EstimationAccuracyService';
import { Task } from '../../src/models/Task';

describe('EstimationAccuracyService', () => {
  let service: EstimationAccuracyService;

  beforeEach(() => {
    service = new EstimationAccuracyService();
  });

  describe('calculateMonthlyAccuracy', () => {
    it('should calculate accuracy for tasks with estimates and actuals', () => {
      const tasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 30,
          actualMinutes: 30,
          isCompleted: true,
        }), // 100% accurate
        createTaskWithEstimate({
          estimatedMinutes: 60,
          actualMinutes: 50,
          isCompleted: true,
        }), // ~83% accurate
      ];

      const stats = service.calculateMonthlyAccuracy(tasks);

      expect(stats.accuracy).toBeGreaterThan(90); // Average should be high
      expect(stats.tasksAnalyzed).toBe(2);
      expect(stats.totalCompleted).toBe(2);
      expect(stats.averageEstimate).toBe(45); // (30 + 60) / 2
      expect(stats.averageActual).toBe(40); // (30 + 50) / 2
    });

    it('should return null accuracy when no tasks have estimates', () => {
      const tasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: null,
          actualMinutes: 30,
          isCompleted: true,
        }),
        createTaskWithEstimate({
          estimatedMinutes: null,
          actualMinutes: 45,
          isCompleted: true,
        }),
      ];

      const stats = service.calculateMonthlyAccuracy(tasks);

      expect(stats.accuracy).toBeNull();
      expect(stats.tasksAnalyzed).toBe(0);
      expect(stats.totalCompleted).toBe(2);
      expect(stats.averageEstimate).toBeNull();
      expect(stats.averageActual).toBeNull();
    });

    it('should handle empty task array', () => {
      const stats = service.calculateMonthlyAccuracy([]);

      expect(stats.accuracy).toBeNull();
      expect(stats.tasksAnalyzed).toBe(0);
      expect(stats.totalCompleted).toBe(0);
      expect(stats.averageEstimate).toBeNull();
      expect(stats.averageActual).toBeNull();
    });

    it('should handle tasks completed in under 1 minute', () => {
      const tasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 1,
          actualMinutes: 0, // Completed instantly
          isCompleted: true,
        }),
        createTaskWithEstimate({
          estimatedMinutes: 5,
          actualMinutes: 1, // Completed very quickly
          isCompleted: true,
        }),
      ];

      const stats = service.calculateMonthlyAccuracy(tasks);

      // Should filter out tasks with 0 actual minutes
      expect(stats.tasksAnalyzed).toBe(1); // Only the task with actualMinutes = 1
      expect(stats.accuracy).not.toBeNull();
    });

    it('should only analyze completed tasks', () => {
      const tasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 30,
          actualMinutes: 30,
          isCompleted: true,
        }),
        createTaskWithEstimate({
          estimatedMinutes: 60,
          actualMinutes: null, // Not completed
          isCompleted: false,
        }),
      ];

      const stats = service.calculateMonthlyAccuracy(tasks);

      expect(stats.tasksAnalyzed).toBe(1);
      expect(stats.totalCompleted).toBe(1);
    });

    it('should calculate trend when previous month data provided', () => {
      const currentMonthTasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 30,
          actualMinutes: 30,
          isCompleted: true,
        }),
      ];

      const previousMonthTasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 30,
          actualMinutes: 45, // Less accurate
          isCompleted: true,
        }),
      ];

      const stats = service.calculateMonthlyAccuracy(
        currentMonthTasks,
        previousMonthTasks
      );

      expect(stats.trend).toBeDefined();
      expect(stats.trend?.direction).toBe('up'); // Improved accuracy
      expect(stats.trend?.percentage).toBeGreaterThan(0);
    });

    it('should detect stable trend when accuracy unchanged', () => {
      const currentMonthTasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 30,
          actualMinutes: 30,
          isCompleted: true,
        }),
      ];

      const previousMonthTasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 45,
          actualMinutes: 45,
          isCompleted: true,
        }),
      ];

      const stats = service.calculateMonthlyAccuracy(
        currentMonthTasks,
        previousMonthTasks
      );

      expect(stats.trend).toBeDefined();
      expect(stats.trend?.direction).toBe('stable'); // Both 100% accurate
    });

    it('should detect down trend when accuracy decreased', () => {
      const currentMonthTasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 30,
          actualMinutes: 60, // Doubled actual time
          isCompleted: true,
        }),
      ];

      const previousMonthTasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 30,
          actualMinutes: 30, // Perfect estimate
          isCompleted: true,
        }),
      ];

      const stats = service.calculateMonthlyAccuracy(
        currentMonthTasks,
        previousMonthTasks
      );

      expect(stats.trend).toBeDefined();
      expect(stats.trend?.direction).toBe('down'); // Accuracy decreased
      expect(stats.trend?.percentage).toBeGreaterThan(0);
    });

    it('should not calculate trend when previous month has no estimates', () => {
      const currentMonthTasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 30,
          actualMinutes: 30,
          isCompleted: true,
        }),
      ];

      const previousMonthTasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: null,
          actualMinutes: 45,
          isCompleted: true,
        }),
      ];

      const stats = service.calculateMonthlyAccuracy(
        currentMonthTasks,
        previousMonthTasks
      );

      expect(stats.trend).toBeUndefined(); // Can't calculate trend
    });

    it('should calculate accurate/overestimate/underestimate counts', () => {
      const tasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 30,
          actualMinutes: 30,
          isCompleted: true,
        }), // Accurate
        createTaskWithEstimate({
          estimatedMinutes: 60,
          actualMinutes: 70,
          isCompleted: true,
        }), // Underestimate
        createTaskWithEstimate({
          estimatedMinutes: 40,
          actualMinutes: 30,
          isCompleted: true,
        }), // Overestimate
      ];

      const stats = service.calculateMonthlyAccuracy(tasks);

      expect(stats.accurateCount).toBeGreaterThanOrEqual(1); // At least the perfect one
      expect(stats.underestimateCount).toBeGreaterThanOrEqual(1);
      expect(stats.overestimateCount).toBeGreaterThanOrEqual(1);
      expect(
        stats.accurateCount + stats.underestimateCount + stats.overestimateCount
      ).toBe(3);
    });

    it('should handle mixed completed and incomplete tasks', () => {
      const tasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 30,
          actualMinutes: 30,
          isCompleted: true,
        }),
        createTaskWithEstimate({
          estimatedMinutes: 60,
          actualMinutes: null,
          isCompleted: false,
        }),
        createTaskWithEstimate({
          estimatedMinutes: 45,
          actualMinutes: 50,
          isCompleted: true,
        }),
      ];

      const stats = service.calculateMonthlyAccuracy(tasks);

      expect(stats.tasksAnalyzed).toBe(2); // Only completed tasks
      expect(stats.totalCompleted).toBe(2);
    });

    it('should calculate high accuracy percentage for precise estimates', () => {
      const tasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 30,
          actualMinutes: 31,
          isCompleted: true,
        }),
        createTaskWithEstimate({
          estimatedMinutes: 60,
          actualMinutes: 59,
          isCompleted: true,
        }),
        createTaskWithEstimate({
          estimatedMinutes: 45,
          actualMinutes: 46,
          isCompleted: true,
        }),
      ];

      const stats = service.calculateMonthlyAccuracy(tasks);

      expect(stats.accuracy).toBeGreaterThan(95); // Very high accuracy
      expect(stats.tasksAnalyzed).toBe(3);
    });

    it('should calculate lower accuracy for imprecise estimates', () => {
      const tasks: Task[] = [
        createTaskWithEstimate({
          estimatedMinutes: 30,
          actualMinutes: 60,
          isCompleted: true,
        }), // 50% off
        createTaskWithEstimate({
          estimatedMinutes: 60,
          actualMinutes: 120,
          isCompleted: true,
        }), // 50% off
      ];

      const stats = service.calculateMonthlyAccuracy(tasks);

      expect(stats.accuracy).toBeLessThan(70); // Low accuracy
      expect(stats.tasksAnalyzed).toBe(2);
    });
  });
});

/**
 * Helper function to create a task with estimation data
 */
function createTaskWithEstimate(
  params: {
    estimatedMinutes: number | null;
    actualMinutes: number | null;
    isCompleted: boolean;
  } & Partial<Task>
): Task {
  const now = new Date();
  const { estimatedMinutes, actualMinutes, isCompleted, ...rest } = params;

  return {
    id: `task-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Task',
    description: null,
    createdAt: now,
    completedAt: isCompleted ? now : null,
    estimatedMinutes,
    actualMinutes,
    isCompleted,
    tags: [],
    ...rest,
  };
}
