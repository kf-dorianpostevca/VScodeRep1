/**
 * Monthly command - Generate monthly progress summary
 */

import { Command } from 'commander';
import {
  createDatabaseConnection,
  SQLiteTaskRepository,
  SQLiteMonthlySummaryRepository,
  MonthlySummaryService,
  createLogger,
} from '@intelligent-todo/shared';
import { formatMonthlySummary, formatHistoricalTrends, formatError } from '../formatters/MonthlySummaryFormatter';

const logger = createLogger('monthly-command');

/**
 * Creates the monthly command
 * @returns Commander Command instance
 */
export function createMonthlyCommand(): Command {
  const command = new Command('monthly');

  command
    .description('Generate monthly progress summary with celebration-focused analytics 🎉')
    .option('--month <YYYY-MM>', 'Generate summary for specific month (defaults to current)')
    .option('--history', 'Show last 6 months of trends and key metrics')
    .action(async (options) => {
      const db = createDatabaseConnection();

      try {
        const taskRepository = new SQLiteTaskRepository(db);
        const summaryRepository = new SQLiteMonthlySummaryRepository(db);
        const service = new MonthlySummaryService(taskRepository, summaryRepository);

        // Handle --history flag
        if (options.history) {
          const trends = await service.getHistoricalTrends(6);
          const output = formatHistoricalTrends(trends);
          console.log(output);

          logger.info('Historical trends retrieved', {
            monthsBack: 6,
            monthsWithData: trends.months.filter(m => m.summary).length,
          });
          return;
        }

        // Determine month
        const targetMonth = options.month || getCurrentMonth();

        // Validate month format
        if (!/^\d{4}-\d{2}$/.test(targetMonth)) {
          throw new Error('Invalid month format. Use YYYY-MM (e.g., 2025-09)');
        }

        // Generate summary
        const summary = await service.generateMonthlySummary(targetMonth);

        // Fetch tasks for chart generation
        const [year, monthNum] = targetMonth.split('-').map(Number);
        const monthStart = new Date(year, monthNum - 1, 1);
        const monthEnd = new Date(year, monthNum, 0, 23, 59, 59);
        const tasks = await taskRepository.findAll({
          createdAfter: monthStart,
          createdBefore: monthEnd,
        });

        // Display formatted output with chart
        const output = formatMonthlySummary(summary, tasks);
        console.log(output);

        logger.info('Monthly summary generated', {
          month: targetMonth,
          totalTasks: summary.totalTasks,
          completionRate: summary.completionRate,
        });
      } catch (error) {
        logger.error('Monthly command failed', { error });
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

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
