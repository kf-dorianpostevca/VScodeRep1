/**
 * Formatter for stats command output
 * Creates celebration-focused displays of estimation accuracy and learning metrics
 */

import { AccuracyStats } from '@intelligent-todo/shared';

/**
 * Formats estimation accuracy statistics for CLI display
 * @param stats - Accuracy statistics to format
 * @param monthName - Name of the month (e.g., "September 2025")
 * @returns Formatted string for console output
 * @example
 * ```typescript
 * const output = formatStats(stats, 'September 2025');
 * console.log(output);
 * ```
 */
export function formatStats(stats: AccuracyStats, monthName: string): string {
  let output = `📊 Your Productivity Stats - ${monthName}\n\n`;

  // Handle no completed tasks
  if (stats.totalCompleted === 0) {
    output += 'No completed tasks yet this month.\n';
    output += 'Start completing some tasks to see your estimation accuracy! 🚀\n';
    return output;
  }

  // Tasks Overview
  output += 'Tasks Overview:\n';
  output += `  🎯 Total Tasks: ${stats.totalCompleted}\n`;
  output += `  ✅ Completed: ${stats.totalCompleted}\n`;
  output += `  ⏱️  With Estimates: ${stats.tasksAnalyzed}\n\n`;

  // Handle no estimates
  if (stats.accuracy === null || stats.tasksAnalyzed === 0) {
    output += '💡 Try adding time estimates to your tasks!\n';
    output += '   Use: todo add "task" --estimate 30m\n\n';
    output += 'This helps you learn your planning patterns over time.\n';
    return output;
  }

  // Time Estimation Accuracy
  output += 'Time Estimation Accuracy:\n';
  output += `  🎓 Overall Accuracy: ${stats.accuracy}%\n`;

  // Add trend if available
  if (stats.trend) {
    const trendSymbol =
      stats.trend.direction === 'up'
        ? '↑'
        : stats.trend.direction === 'down'
          ? '↓'
          : '→';
    const trendText =
      stats.trend.direction === 'up'
        ? 'improvement'
        : stats.trend.direction === 'down'
          ? 'change'
          : 'stable';
    output += `  📈 Trend: ${trendSymbol} ${stats.trend.percentage}% ${trendText} from last month!\n`;
  }

  output += `\n  Tasks analyzed: ${stats.tasksAnalyzed} with time estimates\n`;

  // Breakdown by estimation type
  if (stats.tasksAnalyzed > 0) {
    output += `\n  Breakdown:\n`;
    output += `    🎯 Accurate: ${stats.accurateCount} (${Math.round((stats.accurateCount / stats.tasksAnalyzed) * 100)}%)\n`;
    output += `    ⏫ Overestimated: ${stats.overestimateCount} (${Math.round((stats.overestimateCount / stats.tasksAnalyzed) * 100)}%)\n`;
    output += `    ⏬ Underestimated: ${stats.underestimateCount} (${Math.round((stats.underestimateCount / stats.tasksAnalyzed) * 100)}%)\n`;
  }

  // Average times
  if (stats.averageEstimate !== null && stats.averageActual !== null) {
    output += `\n  Average Times:\n`;
    output += `    📝 Estimated: ${formatMinutes(stats.averageEstimate)}\n`;
    output += `    ⏰ Actual: ${formatMinutes(stats.averageActual)}\n`;
  }

  // Celebration message based on accuracy
  output += `\n${generateCelebrationMessage(stats)}\n`;

  return output;
}

/**
 * Formats minutes into human-readable time
 * @param minutes - Duration in minutes
 * @returns Formatted time string
 */
function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Generates celebration message based on accuracy level
 * @param stats - Accuracy statistics
 * @returns Celebration message
 */
function generateCelebrationMessage(stats: AccuracyStats): string {
  if (stats.accuracy === null) {
    return '';
  }

  const { accuracy, trend } = stats;

  // High accuracy (>85%)
  if (accuracy > 85) {
    if (trend?.direction === 'up') {
      return `🌟 Excellent work! Your estimation accuracy is improving - keep it up!`;
    }
    return `🌟 You're getting really good at estimating! Keep it up!`;
  }

  // Good accuracy (70-85%)
  if (accuracy > 70) {
    if (trend?.direction === 'up') {
      return `🎯 Nice progress! Your estimates are becoming more accurate!`;
    }
    return `🎯 Nice work! Your estimates are becoming more accurate.`;
  }

  // Learning phase (<70%)
  if (trend?.direction === 'up') {
    return `📚 You're learning your patterns! Keep tracking to improve - ${trend.percentage}% better than last month!`;
  }
  return `📚 You're learning your patterns! Keep tracking to improve.`;
}

/**
 * Formats error message for stats command
 * @param error - Error object
 * @returns Formatted error message
 */
export function formatError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : 'Unknown error occurred';
  return `❌ Error: ${message}`;
}