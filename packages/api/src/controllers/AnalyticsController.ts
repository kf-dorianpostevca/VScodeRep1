/**
 * Analytics Controller
 * Handles monthly summary and analytics data with celebration-focused messaging
 */

import { Request, Response } from 'express';
import { ITaskRepository } from '@intelligent-todo/shared';

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

export class AnalyticsController {
  constructor(private taskRepository: ITaskRepository) {}

  /**
   * Get current month analytics summary
   */
  async getCurrentMonthSummary(_req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const summary = await this.getMonthlyAnalytics(currentMonth);

      res.json({
        success: true,
        data: summary,
        message: summary.celebrationMessage
      });
    } catch (error) {
      console.error('Error getting current month summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load analytics data'
      });
    }
  }

  /**
   * Get historical month analytics summary
   */
  async getHistoricalMonthSummary(req: Request, res: Response): Promise<void> {
    try {
      const { year, month } = req.params;
      const targetMonth = `${year}-${String(month).padStart(2, '0')}`;

      // Validate date parameters
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);

      if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        res.status(400).json({
          success: false,
          error: 'Invalid year or month parameters'
        });
        return;
      }

      const summary = await this.getMonthlyAnalytics(targetMonth);

      res.json({
        success: true,
        data: summary,
        message: summary.celebrationMessage
      });
    } catch (error) {
      console.error('Error getting historical month summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load historical analytics data'
      });
    }
  }

  /**
   * Core analytics calculation logic
   */
  private async getMonthlyAnalytics(monthKey: string, includeTrend: boolean = true): Promise<MonthlySummaryBasic> {
    const [year, month] = monthKey.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    // Get all tasks for the month
    const allTasks = await this.taskRepository.findAll();

    // Filter tasks for this month
    const monthTasks = allTasks.filter((task: any) => {
      const createdAt = new Date(task.createdAt);
      return createdAt >= startDate && createdAt <= endDate;
    });

    const completedTasks = monthTasks.filter((task: any) => task.isCompleted);
    const completionRate = monthTasks.length > 0 ? (completedTasks.length / monthTasks.length) * 100 : 0;

    // Calculate daily completions for chart data
    const dailyCompletions = this.calculateDailyCompletions(completedTasks, startDate, endDate);

    // Calculate month-over-month trend only if requested (avoid infinite recursion)
    const monthlyTrend = includeTrend
      ? await this.calculateMonthlyTrend(monthKey, completionRate)
      : { previousMonth: 0, improvement: 0 };

    // Generate celebration message and insights
    const celebrationData = this.generateCelebrationContent(monthTasks.length, completedTasks.length, completionRate);

    return {
      month: monthKey,
      totalTasks: monthTasks.length,
      completedTasks: completedTasks.length,
      completionRate: Math.round(completionRate * 100) / 100,
      dailyCompletions,
      monthlyTrend,
      celebrationMessage: celebrationData.message,
      insights: celebrationData.insights
    };
  }

  /**
   * Calculate daily completion counts for chart visualization
   */
  private calculateDailyCompletions(completedTasks: any[], startDate: Date, endDate: Date): { date: string; completed: number }[] {
    const dailyMap = new Map<string, number>();

    // Initialize all days of the month with 0
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dailyMap.set(dateKey, 0);
    }

    // Count completions by completion date
    completedTasks.forEach((task: any) => {
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const dateKey = completedDate.toISOString().split('T')[0];
        if (dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1);
        }
      }
    });

    // Convert to array format for charts
    return Array.from(dailyMap.entries()).map(([date, completed]) => ({
      date,
      completed
    }));
  }

  /**
   * Calculate month-over-month trend comparison
   */
  private async calculateMonthlyTrend(currentMonth: string, currentRate: number): Promise<{ previousMonth: number; improvement: number }> {
    const [year, month] = currentMonth.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const previousDate = new Date(currentDate);
    previousDate.setMonth(previousDate.getMonth() - 1);

    const previousMonthKey = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`;

    try {
      // Pass false to avoid recursive trend calculation
      const previousSummary = await this.getMonthlyAnalytics(previousMonthKey, false);
      const improvement = currentRate - previousSummary.completionRate;

      return {
        previousMonth: previousSummary.completionRate,
        improvement: Math.round(improvement * 100) / 100
      };
    } catch (error) {
      // If previous month data not available, return neutral comparison
      return {
        previousMonth: 0,
        improvement: 0
      };
    }
  }

  /**
   * Generate celebration-focused messages and insights
   */
  private generateCelebrationContent(totalTasks: number, completedTasks: number, completionRate: number): { message: string; insights: string[] } {
    const insights: string[] = [];
    let message: string;

    if (totalTasks === 0) {
      message = "Ready to make this month amazing? Start by creating your first task!";
      insights.push("This is a perfect time to set some productive goals");
    } else if (completionRate >= 90) {
      message = `🎉 Outstanding! You've completed ${completedTasks} out of ${totalTasks} tasks with ${completionRate.toFixed(1)}% completion rate!`;
      insights.push("You're absolutely crushing your goals this month!");
      insights.push("Your consistency is remarkable - keep up the amazing momentum!");
    } else if (completionRate >= 70) {
      message = `🌟 Great progress! ${completedTasks} tasks completed with ${completionRate.toFixed(1)}% completion rate!`;
      insights.push("You're doing really well - just a little push to reach excellence!");
      insights.push("Your productivity habits are building strong momentum");
    } else if (completionRate >= 50) {
      message = `💪 Good start! You've completed ${completedTasks} tasks. Let's push for an even stronger finish!`;
      insights.push("You're halfway there - the momentum is building!");
      insights.push("Every completed task is a step toward your goals");
    } else if (completionRate > 0) {
      message = `🚀 You've got ${completedTasks} wins on the board! Each completion builds momentum for the next!`;
      insights.push("Progress is progress - celebrate these victories!");
      insights.push("Focus on completing one task at a time to build consistency");
    } else {
      message = `📋 You've created ${totalTasks} tasks - now let's turn planning into action!`;
      insights.push("Having a plan is the first step to success");
      insights.push("Pick one task and give it your focus to build momentum");
    }

    return { message, insights };
  }
}