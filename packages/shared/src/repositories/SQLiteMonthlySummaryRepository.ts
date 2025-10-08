/**
 * SQLite implementation of monthly summary repository
 */

import Database from 'better-sqlite3';
import { MonthlySummary, MonthlySummaryCreate } from '../models/MonthlySummary';
import { IMonthlySummaryRepository } from './IMonthlySummaryRepository';
import { createLogger } from '../utils/logger';
import { randomBytes } from 'crypto';

const logger = createLogger('monthly-summary-repository');

/**
 * SQLite implementation of monthly summary repository
 */
export class SQLiteMonthlySummaryRepository implements IMonthlySummaryRepository {
  constructor(private db: Database.Database) {}

  /**
   * Save or update monthly summary
   */
  async save(summary: MonthlySummaryCreate): Promise<MonthlySummary> {
    logger.info('Saving monthly summary', { month: summary.month });

    const id = randomBytes(16).toString('hex');

    const stmt = this.db.prepare(`
      INSERT INTO monthly_summaries (
        id, month, total_tasks, completed_tasks, completion_rate,
        average_actual_minutes, estimation_accuracy, longest_streak,
        most_productive_day, celebration_message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(month) DO UPDATE SET
        total_tasks = excluded.total_tasks,
        completed_tasks = excluded.completed_tasks,
        completion_rate = excluded.completion_rate,
        average_actual_minutes = excluded.average_actual_minutes,
        estimation_accuracy = excluded.estimation_accuracy,
        longest_streak = excluded.longest_streak,
        most_productive_day = excluded.most_productive_day,
        celebration_message = excluded.celebration_message,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      id,
      summary.month,
      summary.totalTasks,
      summary.completedTasks,
      summary.completionRate,
      summary.averageActualMinutes,
      summary.estimationAccuracy,
      summary.longestStreak,
      summary.mostProductiveDay,
      summary.celebrationMessage
    );

    const saved = await this.findByMonth(summary.month);
    if (!saved) {
      throw new Error('Failed to save monthly summary');
    }

    return saved;
  }

  /**
   * Find summary by month
   */
  async findByMonth(month: string): Promise<MonthlySummary | null> {
    logger.info('Finding monthly summary', { month });

    const stmt = this.db.prepare(`
      SELECT * FROM monthly_summaries WHERE month = ?
    `);

    const row = stmt.get(month) as any;

    if (!row) {
      return null;
    }

    return this.mapRowToSummary(row);
  }

  /**
   * Get all summaries
   */
  async findAll(limit?: number): Promise<MonthlySummary[]> {
    logger.info('Finding all monthly summaries', { limit });

    const sql = limit
      ? `SELECT * FROM monthly_summaries ORDER BY month DESC LIMIT ?`
      : `SELECT * FROM monthly_summaries ORDER BY month DESC`;

    const stmt = this.db.prepare(sql);
    const rows = limit ? stmt.all(limit) : stmt.all();

    return (rows as any[]).map(row => this.mapRowToSummary(row));
  }

  /**
   * Delete summary by month
   */
  async delete(month: string): Promise<boolean> {
    logger.info('Deleting monthly summary', { month });

    const stmt = this.db.prepare(`
      DELETE FROM monthly_summaries WHERE month = ?
    `);

    const result = stmt.run(month);
    return result.changes > 0;
  }

  /**
   * Map database row to MonthlySummary model
   */
  private mapRowToSummary(row: any): MonthlySummary {
    return {
      id: row.id,
      month: row.month,
      totalTasks: row.total_tasks,
      completedTasks: row.completed_tasks,
      completionRate: row.completion_rate,
      averageActualMinutes: row.average_actual_minutes,
      estimationAccuracy: row.estimation_accuracy,
      longestStreak: row.longest_streak,
      mostProductiveDay: row.most_productive_day,
      celebrationMessage: row.celebration_message,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
