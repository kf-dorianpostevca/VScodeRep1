/**
 * Repository interface for monthly summary persistence
 */

import { MonthlySummary, MonthlySummaryCreate } from '../models/MonthlySummary';

/**
 * Repository interface for monthly summary data access
 */
export interface IMonthlySummaryRepository {
  /**
   * Save or update monthly summary
   * @param summary - Summary data to persist
   * @returns Saved summary with generated ID
   */
  save(summary: MonthlySummaryCreate): Promise<MonthlySummary>;

  /**
   * Find summary by month identifier
   * @param month - Month in YYYY-MM format
   * @returns Summary or null if not found
   */
  findByMonth(month: string): Promise<MonthlySummary | null>;

  /**
   * Get all summaries ordered by date descending
   * @param limit - Optional limit for pagination
   * @returns Array of summaries
   */
  findAll(limit?: number): Promise<MonthlySummary[]>;

  /**
   * Delete summary by month
   * @param month - Month in YYYY-MM format
   * @returns True if deleted, false if not found
   */
  delete(month: string): Promise<boolean>;
}
