/**
 * Service for calculating time estimation accuracy and learning metrics.
 * Provides insights for improving time planning skills.
 */

import { Task } from '../models/Task';
import {
  calculateEstimationAccuracy,
  calculateAverageAccuracy,
  EstimationAccuracy,
} from '../utils/time';
import { createLogger } from '../utils/logger';

const logger = createLogger('estimation-accuracy-service');

/**
 * Accuracy statistics for a given period
 */
export interface AccuracyStats {
  /** Accuracy percentage (0-100), null if no tasks with estimates */
  accuracy: number | null;
  /** Number of tasks analyzed (with estimates and completion) */
  tasksAnalyzed: number;
  /** Total completed tasks in period */
  totalCompleted: number;
  /** Average estimated minutes */
  averageEstimate: number | null;
  /** Average actual minutes */
  averageActual: number | null;
  /** Count of accurate estimates (within 10% tolerance) */
  accurateCount: number;
  /** Count of overestimates */
  overestimateCount: number;
  /** Count of underestimates */
  underestimateCount: number;
  /** Improvement trend compared to previous period */
  trend?: TrendData;
}

/**
 * Trend data comparing two periods
 */
export interface TrendData {
  /** Trend direction */
  direction: 'up' | 'down' | 'stable';
  /** Percentage point change */
  percentage: number;
}

/**
 * Service for calculating time estimation accuracy and learning metrics
 */
export class EstimationAccuracyService {
  /**
   * Calculate monthly estimation accuracy from completed tasks
   * @param tasks - Completed tasks from the month
   * @param previousMonthTasks - Optional tasks from previous month for trend calculation
   * @returns Accuracy statistics
   * @example
   * ```typescript
   * const service = new EstimationAccuracyService();
   * const stats = service.calculateMonthlyAccuracy(tasks);
   * console.log(`Accuracy: ${stats.accuracy}%`);
   * ```
   */
  calculateMonthlyAccuracy(
    tasks: Task[],
    previousMonthTasks?: Task[]
  ): AccuracyStats {
    logger.info('Calculating monthly accuracy', {
      totalTasks: tasks.length,
      hasPreviousMonth: !!previousMonthTasks,
    });

    // Filter for completed tasks with estimates and actual times
    const tasksWithEstimates = tasks.filter(
      (task) =>
        task.isCompleted &&
        task.estimatedMinutes !== null &&
        task.actualMinutes !== null &&
        task.estimatedMinutes > 0 &&
        task.actualMinutes > 0
    );

    const totalCompleted = tasks.filter((task) => task.isCompleted).length;

    // Handle case: no tasks with estimates
    if (tasksWithEstimates.length === 0) {
      logger.info('No tasks with estimates found');
      return {
        accuracy: null,
        tasksAnalyzed: 0,
        totalCompleted,
        averageEstimate: null,
        averageActual: null,
        accurateCount: 0,
        overestimateCount: 0,
        underestimateCount: 0,
      };
    }

    // Calculate accuracy for each task
    const accuracyData: EstimationAccuracy[] = tasksWithEstimates.map((task) =>
      calculateEstimationAccuracy(
        task.estimatedMinutes!,
        task.actualMinutes!
      )
    );

    // Calculate aggregate statistics
    const {
      averageAccuracy,
      accurateCount,
      overestimateCount,
      underestimateCount,
    } = calculateAverageAccuracy(accuracyData);

    // Calculate average estimates and actuals
    const totalEstimate = tasksWithEstimates.reduce(
      (sum, task) => sum + task.estimatedMinutes!,
      0
    );
    const totalActual = tasksWithEstimates.reduce(
      (sum, task) => sum + task.actualMinutes!,
      0
    );

    const averageEstimate = Math.round(
      totalEstimate / tasksWithEstimates.length
    );
    const averageActual = Math.round(totalActual / tasksWithEstimates.length);

    // Calculate trend if previous month data provided
    let trend: TrendData | undefined;
    if (previousMonthTasks) {
      const previousStats = this.calculateMonthlyAccuracy(previousMonthTasks);
      if (previousStats.accuracy !== null && averageAccuracy !== null) {
        trend = this.calculateTrend(averageAccuracy, previousStats.accuracy);
      }
    }

    logger.info('Accuracy calculation complete', {
      accuracy: averageAccuracy,
      tasksAnalyzed: tasksWithEstimates.length,
      trend: trend?.direction,
    });

    return {
      accuracy: averageAccuracy,
      tasksAnalyzed: tasksWithEstimates.length,
      totalCompleted,
      averageEstimate,
      averageActual,
      accurateCount,
      overestimateCount,
      underestimateCount,
      trend,
    };
  }

  /**
   * Calculate trend between current and previous accuracy
   * @param current - Current accuracy percentage
   * @param previous - Previous accuracy percentage
   * @returns Trend data
   */
  private calculateTrend(current: number, previous: number): TrendData {
    const change = current - previous;
    const threshold = 5; // 5% threshold for "stable"

    let direction: 'up' | 'down' | 'stable';
    if (Math.abs(change) < threshold) {
      direction = 'stable';
    } else if (change > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }

    return {
      direction,
      percentage: Math.abs(change),
    };
  }
}