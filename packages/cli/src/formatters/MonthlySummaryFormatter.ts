/**
 * Formatter for monthly summary output
 */

import { MonthlySummary, Task, ChartService, HistoricalTrends } from '@intelligent-todo/shared';

/**
 * Formats monthly summary for CLI display
 * @param summary - Monthly summary to format
 * @param tasks - Optional tasks for weekly chart generation
 * @returns Formatted string for console output
 */
export function formatMonthlySummary(summary: MonthlySummary, tasks?: Task[]): string {
  const monthDate = new Date(`${summary.month}-01`);
  const monthName = monthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  let output = `🎉 Monthly Progress Report - ${monthName}\n\n`;

  // Tasks Overview
  output += '📈 Tasks Overview\n';
  output += `  🎯 Total Created: ${summary.totalTasks} tasks\n`;
  output += `  ✅ Completed: ${summary.completedTasks} tasks\n`;
  output += `  📊 Completion Rate: ${summary.completionRate}%\n\n`;

  // Time Estimation
  if (summary.estimationAccuracy !== null) {
    output += '⏱️  Time Estimation\n';
    output += `  🎓 Accuracy: ${summary.estimationAccuracy}%\n`;
    if (summary.averageActualMinutes !== null) {
      output += `  📏 Average Task Duration: ${formatMinutes(summary.averageActualMinutes)}\n`;
    }
    output += '\n';
  }

  // Productivity Streak
  if (summary.longestStreak > 0) {
    output += '🔥 Productivity Streak\n';
    output += `  Longest Streak: ${summary.longestStreak} consecutive day${summary.longestStreak > 1 ? 's' : ''}\n\n`;
  }

  // Most Productive Day
  if (summary.mostProductiveDay) {
    output += '💪 Most Productive Day\n';
    output += `  🗓️  ${summary.mostProductiveDay}\n\n`;
  }

  // Weekly Completion Chart (if tasks provided)
  if (tasks && tasks.length > 0) {
    const chart = ChartService.generateWeeklyCompletionChart(tasks, summary.month);
    output += `${chart}\n`;
  }

  // Celebration Message
  output += `${summary.celebrationMessage}\n\n`;
  output += '✨ Summary saved for future reference\n';

  return output;
}

/**
 * Format minutes to readable time
 */
function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
}

/**
 * Format historical trends for CLI display
 * @param trends - Historical trends data
 * @returns Formatted string for console output
 */
export function formatHistoricalTrends(trends: HistoricalTrends): string {
  let output = '📊 Historical Trends - Last 6 Months\n\n';

  // Check if we have any data
  const hasData = trends.months.some(m => m.summary !== null);

  if (!hasData) {
    output += '📭 No historical data available yet.\n';
    output += '💡 Complete some tasks and generate monthly summaries to see trends!\n';
    return output;
  }

  // Table header
  output += '─'.repeat(80) + '\n';
  output += 'Month        | Tasks  | ✅ Done | Rate | Accuracy | Streak | Trend\n';
  output += '─'.repeat(80) + '\n';

  // Display each month
  for (const { month, summary, trend } of trends.months) {
    const monthDate = new Date(`${month}-01`);
    const monthName = monthDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    if (!summary) {
      output += `${monthName.padEnd(12)} | ${'No data'.padEnd(55)}\n`;
      continue;
    }

    const tasks = String(summary.totalTasks).padStart(6);
    const done = String(summary.completedTasks).padStart(7);
    const rate = `${summary.completionRate}%`.padStart(4);
    const accuracy = summary.estimationAccuracy !== null
      ? `${summary.estimationAccuracy}%`.padStart(8)
      : 'N/A'.padStart(8);
    const streak = String(summary.longestStreak).padStart(6);

    let trendIndicator = '  →  ';
    if (trend) {
      if (trend.direction === 'up') trendIndicator = `  ↑  `;
      else if (trend.direction === 'down') trendIndicator = `  ↓  `;
    }

    output += `${monthName.padEnd(12)} | ${tasks} | ${done} | ${rate} | ${accuracy} | ${streak} | ${trendIndicator}\n`;
  }

  output += '─'.repeat(80) + '\n\n';

  // Sparkline visualizations
  const completionRates = trends.months.map(m => m.summary?.completionRate ?? null).reverse();
  const accuracies = trends.months.map(m => m.summary?.estimationAccuracy ?? null).reverse();

  if (completionRates.some(r => r !== null)) {
    const sparkline = ChartService.generateCompletionRateSparkline(completionRates);
    output += `Completion Rate Trend:  ${sparkline}\n`;
  }

  if (accuracies.some(a => a !== null)) {
    const sparkline = ChartService.generateAccuracySparkline(accuracies);
    output += `Accuracy Trend:         ${sparkline}\n`;
  }

  output += '\n';

  // Overall trends summary
  output += '📈 Overall Trends\n';

  if (trends.overallTrends.completionRateImproving) {
    output += '  ✅ Completion rate is improving over time!\n';
  }

  if (trends.overallTrends.estimationAccuracyImproving) {
    output += '  🎯 Estimation accuracy is getting better!\n';
  }

  // Celebration message
  if (trends.overallTrends.completionRateImproving || trends.overallTrends.estimationAccuracyImproving) {
    output += '\n🌟 Great progress! Keep building those habits!\n';
  } else {
    output += '\n📚 Track consistently to see your improvement trends!\n';
  }

  return output;
}

/**
 * Format error message
 */
export function formatError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : 'Unknown error occurred';
  return `❌ Error: ${message}`;
}
