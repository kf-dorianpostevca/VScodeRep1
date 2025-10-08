/**
 * Historical trends model for multi-month analysis
 */

import { MonthlySummary } from './MonthlySummary';

/**
 * Historical month data with summary and trends
 */
export interface HistoricalMonth {
  month: string;
  summary: MonthlySummary | null;
  trend: TrendIndicator | null;
}

/**
 * Trend indicator for month-over-month comparison
 */
export interface TrendIndicator {
  metric: string;
  current: number;
  previous: number;
  change: number;
  direction: 'up' | 'down' | 'stable';
}

/**
 * Historical trends data structure
 */
export interface HistoricalTrends {
  months: HistoricalMonth[];
  overallTrends: {
    completionRateImproving: boolean;
    estimationAccuracyImproving: boolean;
    averageTrend: 'up' | 'down' | 'stable';
  };
}

/**
 * Sparkline data for compact trend visualization
 */
export interface SparklineData {
  values: number[];
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
}
