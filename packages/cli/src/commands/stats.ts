/**
 * Stats command - Display estimation accuracy and learning metrics
 * Shows current month's productivity statistics with celebration-focused messaging
 */

import { Command } from 'commander';
import {
  createDatabaseConnection,
  SQLiteTaskRepository,
  EstimationAccuracyService,
  createLogger,
} from '@intelligent-todo/shared';
import { formatStats, formatError } from '../formatters/StatsFormatter';

const logger = createLogger('stats-command');

/**
 * Creates the stats command
 * @returns Commander Command instance
 * @example
 * ```typescript
 * program.addCommand(createStatsCommand());
 * ```
 */
export function createStatsCommand(): Command {
  const command = new Command('stats');

  command
    .description(
      'Show estimation accuracy and productivity statistics for current month 📊'
    )
    .option('--month <YYYY-MM>', 'View stats for specific month (future enhancement)')
    .action(async (_options) => {
      const db = createDatabaseConnection();

      try {
        const repository = new SQLiteTaskRepository(db);
        const service = new EstimationAccuracyService();

        // Calculate current month range
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Get tasks completed in current month
        const tasks = await repository.findAll({
          isCompleted: true,
          completedAfter: monthStart,
          completedBefore: monthEnd,
        });

        // Get previous month's completed tasks for trend calculation
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const previousMonthTasks = await repository.findAll({
          isCompleted: true,
          completedAfter: prevMonthStart,
          completedBefore: prevMonthEnd,
        });

        // Calculate accuracy stats
        const stats = service.calculateMonthlyAccuracy(
          tasks,
          previousMonthTasks.length > 0 ? previousMonthTasks : undefined
        );

        // Format month name
        const monthName = now.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });

        // Display stats
        const output = formatStats(stats, monthName);
        console.log(output);

        logger.info('Stats displayed successfully', {
          month: currentMonth,
          tasksAnalyzed: stats.tasksAnalyzed,
          accuracy: stats.accuracy,
        });
      } catch (error) {
        logger.error('Stats command failed', { error });
        console.error(formatError(error));
        process.exit(1);
      } finally {
        if (db.open) {
          db.close();
        }
      }
    });

  return command;
}