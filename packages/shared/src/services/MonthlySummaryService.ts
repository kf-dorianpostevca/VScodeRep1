/**
 * Service for generating monthly progress summaries
 */

import { Task } from '../models/Task';
import { MonthlySummary, MonthlySummaryCreate } from '../models/MonthlySummary';
import { HistoricalTrends, HistoricalMonth, TrendIndicator } from '../models/HistoricalTrends';
import { IMonthlySummaryRepository } from '../repositories/IMonthlySummaryRepository';
import { ITaskRepository } from '../repositories/ITaskRepository';
import { EstimationAccuracyService } from './EstimationAccuracyService';
import { createLogger } from '../utils/logger';

const logger = createLogger('monthly-summary-service');

/**
 * Streak data with date range
 */
interface StreakData {
  length: number;
  startDate: string | null;
  endDate: string | null;
}

/**
 * Productive day data
 */
interface ProductiveDayData {
  day: string | null;
  count: number;
  percentage: number;
}

/**
 * Service for generating monthly progress summaries
 */
export class MonthlySummaryService {
  private estimationService: EstimationAccuracyService;

  constructor(
    private taskRepository: ITaskRepository,
    private summaryRepository: IMonthlySummaryRepository
  ) {
    this.estimationService = new EstimationAccuracyService();
  }

  /**
   * Generate monthly summary for current month
   * @param month - Month in YYYY-MM format
   * @returns Generated monthly summary
   */
  async generateMonthlySummary(month: string): Promise<MonthlySummary> {
    logger.info('Generating monthly summary', { month });

    // Fetch tasks for the month
    const [year, monthNum] = month.split('-').map(Number);
    const monthStart = new Date(year, monthNum - 1, 1);
    const monthEnd = new Date(year, monthNum, 0, 23, 59, 59);

    const tasks = await this.taskRepository.findAll({
      createdAfter: monthStart,
      createdBefore: monthEnd,
    });

    // Calculate metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // Calculate average actual minutes
    const tasksWithActual = tasks.filter(
      t => t.isCompleted && t.actualMinutes !== null
    );
    const averageActualMinutes = tasksWithActual.length > 0
      ? Math.round(
          tasksWithActual.reduce((sum, t) => sum + t.actualMinutes!, 0) /
            tasksWithActual.length
        )
      : null;

    // Calculate estimation accuracy
    const accuracyStats = this.estimationService.calculateMonthlyAccuracy(tasks);
    const estimationAccuracy = accuracyStats.accuracy;

    // Calculate productivity streak
    const streak = this.calculateProductivityStreak(tasks);

    // Calculate most productive day
    const productiveDay = this.calculateMostProductiveDay(tasks);

    // Generate celebration message
    const celebrationMessage = this.generateCelebrationMessage({
      completionRate,
      completedTasks,
      longestStreak: streak.length,
    });

    // Create summary object
    const summaryData: MonthlySummaryCreate = {
      month,
      totalTasks,
      completedTasks,
      completionRate,
      averageActualMinutes,
      estimationAccuracy,
      longestStreak: streak.length,
      mostProductiveDay: productiveDay.day,
      celebrationMessage,
    };

    // Save and return
    const summary = await this.summaryRepository.save(summaryData);

    logger.info('Monthly summary generated', {
      month,
      totalTasks,
      completedTasks,
      completionRate,
    });

    return summary;
  }

  /**
   * Calculate productivity streak
   */
  private calculateProductivityStreak(tasks: Task[]): StreakData {
    const completedTasks = tasks.filter(t => t.isCompleted && t.completedAt);

    if (completedTasks.length === 0) {
      return { length: 0, startDate: null, endDate: null };
    }

    // Extract unique completion dates
    const dates = completedTasks
      .map(t => t.completedAt!.toISOString().slice(0, 10))
      .sort();
    const uniqueDates = [...new Set(dates)];

    if (uniqueDates.length === 0) {
      return { length: 0, startDate: null, endDate: null };
    }

    // Find longest consecutive streak
    let maxStreak = 1;
    let currentStreak = 1;
    let maxStreakStart = 0;
    let maxStreakEnd = 0;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const dayDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          maxStreakEnd = i;
          maxStreakStart = i - currentStreak + 1;
        }
      } else {
        currentStreak = 1;
      }
    }

    return {
      length: maxStreak,
      startDate: uniqueDates[maxStreakStart],
      endDate: uniqueDates[maxStreakEnd],
    };
  }

  /**
   * Calculate most productive day of week
   */
  private calculateMostProductiveDay(tasks: Task[]): ProductiveDayData {
    const completedTasks = tasks.filter(t => t.isCompleted && t.completedAt);

    if (completedTasks.length === 0) {
      return { day: null, count: 0, percentage: 0 };
    }

    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const dayCounts: Record<string, number> = {};
    dayNames.forEach(day => (dayCounts[day] = 0));

    completedTasks.forEach(task => {
      const dayIndex = task.completedAt!.getDay();
      const dayName = dayNames[dayIndex];
      dayCounts[dayName]++;
    });

    let maxDay = null;
    let maxCount = 0;

    Object.entries(dayCounts).forEach(([day, count]) => {
      if (count > maxCount) {
        maxDay = day;
        maxCount = count;
      }
    });

    const percentage = Math.round((maxCount / completedTasks.length) * 100);

    return { day: maxDay, count: maxCount, percentage };
  }

  /**
   * Generate celebration message
   */
  private generateCelebrationMessage(data: {
    completionRate: number;
    completedTasks: number;
    longestStreak: number;
  }): string {
    const { completionRate, completedTasks, longestStreak } = data;

    if (completionRate > 80) {
      return `🌟 Outstanding month! You completed ${completionRate}% of your tasks. ${
        longestStreak > 7
          ? `Your ${longestStreak}-day streak shows amazing consistency!`
          : 'Keep up the great work!'
      }`;
    }

    if (completionRate > 60) {
      return `🎯 Solid progress! ${completedTasks} tasks completed with ${completionRate}% completion rate.`;
    }

    if (completionRate > 40) {
      return `📚 You completed ${completedTasks} tasks this month! ${
        longestStreak > 3
          ? `Your ${longestStreak}-day streak shows you can build consistency.`
          : 'Keep tracking to find your rhythm.'
      }`;
    }

    if (completedTasks > 0) {
      return `🌱 Every task completed is progress! You finished ${completedTasks} this month.`;
    }

    return `🚀 Ready to start fresh? Create some tasks and celebrate your first completion!`;
  }

  /**
   * Get historical trends for the past N months
   * @param monthsBack - Number of months to retrieve (default 6)
   * @returns Historical trends data
   */
  async getHistoricalTrends(monthsBack: number = 6): Promise<HistoricalTrends> {
    logger.info('Retrieving historical trends', { monthsBack });

    const months: HistoricalMonth[] = [];
    const now = new Date();

    // Generate month identifiers
    for (let i = 0; i < monthsBack; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const summary = await this.summaryRepository.findByMonth(month);
      const trend = i < monthsBack - 1 ? await this.calculateMonthTrend(month, i + 1) : null;

      months.push({ month, summary, trend });
    }

    // Calculate overall trends
    const completionRates = months
      .filter(m => m.summary)
      .map(m => m.summary!.completionRate);

    const accuracies = months
      .filter(m => m.summary && m.summary.estimationAccuracy !== null)
      .map(m => m.summary!.estimationAccuracy!);

    const completionRateImproving = this.isImprovingTrend(completionRates);
    const estimationAccuracyImproving = this.isImprovingTrend(accuracies);
    const averageTrend = completionRateImproving ? 'up' : 'stable';

    return {
      months,
      overallTrends: {
        completionRateImproving,
        estimationAccuracyImproving,
        averageTrend,
      },
    };
  }

  /**
   * Calculate trend for a specific month
   */
  private async calculateMonthTrend(
    month: string,
    offsetMonths: number
  ): Promise<TrendIndicator | null> {
    const currentSummary = await this.summaryRepository.findByMonth(month);
    if (!currentSummary) return null;

    const date = new Date(`${month}-01`);
    const prevDate = new Date(date.getFullYear(), date.getMonth() - offsetMonths, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const prevSummary = await this.summaryRepository.findByMonth(prevMonth);
    if (!prevSummary) return null;

    const change = currentSummary.completionRate - prevSummary.completionRate;
    const threshold = 5;

    let direction: 'up' | 'down' | 'stable';
    if (Math.abs(change) < threshold) {
      direction = 'stable';
    } else if (change > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }

    return {
      metric: 'completionRate',
      current: currentSummary.completionRate,
      previous: prevSummary.completionRate,
      change,
      direction,
    };
  }

  /**
   * Determine if trend is improving
   */
  private isImprovingTrend(values: number[]): boolean {
    if (values.length < 2) return false;

    const firstHalf = values.slice(Math.floor(values.length / 2));
    const secondHalf = values.slice(0, Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    return secondAvg > firstAvg;
  }
}
