/**
 * Analytics API Service
 * Handles all analytics-related API communication with celebration-focused messaging
 */

const API_BASE_URL = 'http://localhost:3001/api/v1';

export interface MonthlySummaryBasic {
  month: string;           // YYYY-MM format
  totalTasks: number;      // Total tasks created
  completedTasks: number;  // Tasks marked complete
  completionRate: number;  // Percentage completed
  dailyCompletions: {      // Daily completion counts for charts
    date: string;          // YYYY-MM-DD format
    completed: number;     // Tasks completed on date
  }[];
  monthlyTrend: {         // Month-over-month comparison
    previousMonth: number; // Previous month completion rate
    improvement: number;   // Percentage change
  };
  celebrationMessage?: string;
  insights?: string[];
}

export interface AnalyticsResponse {
  success: boolean;
  data: MonthlySummaryBasic;
  message?: string;
  error?: string;
}

export class AnalyticsApiService {
  /**
   * Get current month analytics summary
   */
  static async getCurrentMonthSummary(): Promise<MonthlySummaryBasic> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/monthly`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AnalyticsResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load analytics data');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching current month summary:', error);
      throw new Error('Unable to load analytics data. Please try again.');
    }
  }

  /**
   * Get historical month analytics summary
   */
  static async getHistoricalMonthSummary(year: number, month: number): Promise<MonthlySummaryBasic> {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/monthly/${year}/${month}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AnalyticsResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load historical analytics data');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching historical month summary:', error);
      throw new Error('Unable to load historical analytics data. Please try again.');
    }
  }

  /**
   * Generate month options for navigation (last 12 months)
   */
  static getAvailableMonths(): { year: number; month: number; label: string; key: string }[] {
    const months = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      months.push({
        year,
        month,
        label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        key: `${year}-${String(month).padStart(2, '0')}`
      });
    }

    return months;
  }

  /**
   * Format month key for display
   */
  static formatMonthDisplay(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  /**
   * Check if month is current month
   */
  static isCurrentMonth(year: number, month: number): boolean {
    const now = new Date();
    return now.getFullYear() === year && (now.getMonth() + 1) === month;
  }
}