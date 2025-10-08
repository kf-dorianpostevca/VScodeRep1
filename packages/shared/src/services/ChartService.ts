/**
 * Service for generating ASCII chart visualizations
 */

import { Task } from '../models/Task';

/**
 * Week data for chart generation
 */
export interface WeekData {
  startDate: string; // MMM D format (e.g., "Sep 1")
  endDate: string; // MMM D format
  completed: number; // Tasks completed this week
  total: number; // Total tasks created this week
}

/**
 * Service for generating ASCII charts for monthly summaries
 */
export class ChartService {
  private static readonly BAR_WIDTH = 20; // Characters for progress bar
  private static readonly COMPLETED_CHAR = '█';
  private static readonly PENDING_CHAR = '░';

  // Sparkline characters (from low to high)
  private static readonly SPARKLINE_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

  /**
   * Generate ASCII bar chart showing weekly completion patterns.
   * Scales to fit terminal width while maintaining readability.
   *
   * @param tasks - All tasks from the month (completed and incomplete)
   * @param month - Month string (YYYY-MM)
   * @returns Formatted ASCII chart string
   * @example
   * const chart = ChartService.generateWeeklyCompletionChart(tasks, '2025-09');
   * console.log(chart);
   * // Week 1 (Sep 1-7)   ████████████░░░░░░░░ 12/15 tasks (80%)
   */
  public static generateWeeklyCompletionChart(
    tasks: Task[],
    month: string
  ): string {
    // Group tasks by week
    const weeks = this.groupTasksByWeek(tasks, month);

    if (weeks.length === 0 || weeks.every(w => w.total === 0)) {
      return '📊 Weekly Completion Pattern\n\nNo tasks created this month.\n';
    }

    // Generate chart header
    let chart = '📊 Weekly Completion Pattern\n\n';

    // Generate bar for each week
    weeks.forEach((week, index) => {
      const weekNum = index + 1;
      const { startDate, endDate, completed, total } = week;
      const completionRate =
        total > 0 ? Math.round((completed / total) * 100) : 0;

      // Calculate bar segments
      const completedSegments =
        total > 0
          ? Math.round((completed / total) * ChartService.BAR_WIDTH)
          : 0;
      const pendingSegments = ChartService.BAR_WIDTH - completedSegments;

      // Build progress bar
      const bar =
        ChartService.COMPLETED_CHAR.repeat(completedSegments) +
        ChartService.PENDING_CHAR.repeat(pendingSegments);

      // Format week line
      const weekLabel = `Week ${weekNum} (${startDate}-${endDate})`.padEnd(20);
      chart += `${weekLabel} ${bar} ${completed}/${total} tasks (${completionRate}%)\n`;
    });

    // Add legend and total
    const totalCompleted = weeks.reduce((sum, w) => sum + w.completed, 0);
    const totalTasks = weeks.reduce((sum, w) => sum + w.total, 0);
    const totalRate =
      totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    chart += `\nLegend: ${ChartService.COMPLETED_CHAR} = completed, ${ChartService.PENDING_CHAR} = pending\n`;
    chart += `Total: ${totalCompleted}/${totalTasks} tasks completed (${totalRate}%)\n`;

    return chart;
  }

  /**
   * Group tasks into weekly buckets based on creation date.
   * Weeks start on Monday to align with typical work patterns.
   *
   * @param tasks - Tasks to group
   * @param month - Month in YYYY-MM format
   * @returns Array of week data
   */
  private static groupTasksByWeek(tasks: Task[], month: string): WeekData[] {
    const weeks: WeekData[] = [];
    const [year, monthNum] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);

    // Find first Monday of month (or use day 1)
    let currentWeekStart = new Date(firstDay);
    const dayOfWeek = currentWeekStart.getDay();

    // Adjust to previous Monday if needed
    if (dayOfWeek !== 1 && dayOfWeek !== 0) {
      // Not Monday or Sunday
      const daysToMonday = 1 - dayOfWeek;
      currentWeekStart.setDate(currentWeekStart.getDate() + daysToMonday);
    } else if (dayOfWeek === 0) {
      // Sunday - go back 6 days to Monday
      currentWeekStart.setDate(currentWeekStart.getDate() - 6);
    }

    // Ensure we start with month's first day if adjusted Monday is before month
    if (currentWeekStart < firstDay) {
      currentWeekStart = new Date(firstDay);
    }

    // Generate weekly buckets
    while (currentWeekStart <= lastDay) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Clamp to month boundaries
      if (weekEnd > lastDay) {
        weekEnd.setTime(lastDay.getTime());
      }

      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= currentWeekStart && taskDate <= weekEnd;
      });

      weeks.push({
        startDate: this.formatDate(currentWeekStart),
        endDate: this.formatDate(weekEnd),
        completed: weekTasks.filter(t => t.isCompleted).length,
        total: weekTasks.length,
      });

      currentWeekStart = new Date(weekEnd);
      currentWeekStart.setDate(currentWeekStart.getDate() + 1);
    }

    return weeks;
  }

  /**
   * Generate sparkline visualization for numerical data series.
   * Uses Unicode block characters to create a compact trend line.
   *
   * @param values - Array of numerical values (e.g., completion rates, accuracy percentages)
   * @param options - Optional configuration
   * @returns Sparkline string with Unicode block characters
   * @example
   * const sparkline = ChartService.generateSparkline([45, 60, 55, 70, 75, 80]);
   * console.log(sparkline); // "▃▅▄▆▇█"
   */
  public static generateSparkline(
    values: (number | null)[],
    options: { min?: number; max?: number; nullChar?: string } = {}
  ): string {
    const { min = 0, max = 100, nullChar = '·' } = options;

    if (values.length === 0) {
      return '';
    }

    // Filter out null values for min/max calculation
    const validValues = values.filter((v): v is number => v !== null);

    if (validValues.length === 0) {
      return nullChar.repeat(values.length);
    }

    // Determine scale range
    const dataMin = Math.min(...validValues, min);
    const dataMax = Math.max(...validValues, max);
    const range = dataMax - dataMin;

    // Generate sparkline
    return values
      .map(value => {
        if (value === null) {
          return nullChar;
        }

        // Normalize value to 0-1 range
        const normalized = range > 0 ? (value - dataMin) / range : 0.5;

        // Map to sparkline character index
        const index = Math.min(
          Math.floor(normalized * ChartService.SPARKLINE_CHARS.length),
          ChartService.SPARKLINE_CHARS.length - 1
        );

        return ChartService.SPARKLINE_CHARS[Math.max(0, index)];
      })
      .join('');
  }

  /**
   * Generate sparkline for completion rates (0-100 scale).
   * Optimized for percentage values.
   *
   * @param rates - Array of completion rate percentages
   * @returns Sparkline string
   * @example
   * const sparkline = ChartService.generateCompletionRateSparkline([45, 60, 75, 80]);
   * console.log(sparkline); // "▃▅▇█"
   */
  public static generateCompletionRateSparkline(rates: (number | null)[]): string {
    return this.generateSparkline(rates, { min: 0, max: 100 });
  }

  /**
   * Generate sparkline for estimation accuracy (0-100 scale).
   * Optimized for accuracy percentages.
   *
   * @param accuracies - Array of estimation accuracy percentages
   * @returns Sparkline string
   * @example
   * const sparkline = ChartService.generateAccuracySparkline([60, 70, 75, 85]);
   * console.log(sparkline); // "▄▆▇█"
   */
  public static generateAccuracySparkline(accuracies: (number | null)[]): string {
    return this.generateSparkline(accuracies, { min: 0, max: 100 });
  }

  /**
   * Format date to MMM D format
   *
   * @param date - Date to format
   * @returns Formatted date string (e.g., "Sep 1")
   */
  private static formatDate(date: Date): string {
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${monthName} ${day}`;
  }
}
