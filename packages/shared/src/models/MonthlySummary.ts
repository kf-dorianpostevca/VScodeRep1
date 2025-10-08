/**
 * Monthly summary model
 * Pre-calculated celebration-focused analytics for fast retrieval
 */

/**
 * Monthly progress summary with celebration-focused analytics
 */
export interface MonthlySummary {
  /** Unique identifier */
  id: string;
  /** Month in YYYY-MM format */
  month: string;
  /** Total tasks created in month */
  totalTasks: number;
  /** Tasks completed in month */
  completedTasks: number;
  /** Completion rate percentage (0-100) */
  completionRate: number;
  /** Average actual duration in minutes */
  averageActualMinutes: number | null;
  /** Estimation accuracy percentage (0-100) */
  estimationAccuracy: number | null;
  /** Longest productivity streak in days */
  longestStreak: number;
  /** Most productive day of week */
  mostProductiveDay: string | null;
  /** Celebration message */
  celebrationMessage: string;
  /** Timestamp when summary was created */
  createdAt: Date;
  /** Timestamp when summary was updated */
  updatedAt: Date;
}

/**
 * Input for creating monthly summary
 */
export interface MonthlySummaryCreate {
  month: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageActualMinutes: number | null;
  estimationAccuracy: number | null;
  longestStreak: number;
  mostProductiveDay: string | null;
  celebrationMessage: string;
}
