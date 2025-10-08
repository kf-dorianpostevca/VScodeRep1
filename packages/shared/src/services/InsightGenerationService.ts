/**
 * Service for generating celebration-focused insights and encouragement
 */

import { Task, Configuration, HistoricalTrends } from '../models';

export interface InsightAccuracyData {
  accuracy: number | null;
  totalEstimated: number;
  averageAccuracy: number | null;
}

/**
 * Service for generating celebration-focused insights
 */
export class InsightGenerationService {
  /**
   * Generate celebration message with tone preference
   */
  generateCelebrationMessage(
    data: { completionRate: number; completedTasks: number; longestStreak: number },
    config: Configuration,
    _trends?: HistoricalTrends
  ): string {
    const { completionRate, completedTasks, longestStreak } = data;
    const tone = config.celebrationLanguage;

    if (completionRate > 80) {
      const messages = {
        enthusiastic: `🌟 Outstanding month! You absolutely crushed it with ${completionRate}% completion! ${longestStreak > 7 ? `Your ${longestStreak}-day streak is 🔥!` : '🎉'}`,
        gentle: `✨ What a lovely month! You completed ${completionRate}% of your tasks with grace.${longestStreak > 7 ? ` Your ${longestStreak}-day consistency is beautiful.` : ''}`,
        professional: `Excellent performance this month: ${completionRate}% task completion rate achieved.${longestStreak > 7 ? ` ${longestStreak}-day productivity streak maintained.` : ''}`
      };
      return messages[tone];
    }

    if (completionRate > 60) {
      const messages = {
        enthusiastic: `🎯 Fantastic work! ${completedTasks} tasks completed - you're on fire! 🔥`,
        gentle: `🌸 Nice work! ${completedTasks} tasks done - you're finding your rhythm.`,
        professional: `Strong results: ${completedTasks} tasks completed with consistent execution.`
      };
      return messages[tone];
    }

    if (completionRate > 40) {
      const messages = {
        enthusiastic: `📚 Great progress! You completed ${completedTasks} tasks and you're building momentum! 💪`,
        gentle: `🌱 You're growing! ${completedTasks} tasks completed as you learn your patterns.`,
        professional: `Progress noted: ${completedTasks} tasks completed as you refine your approach.`
      };
      return messages[tone];
    }

    const messages = {
      enthusiastic: `🌟 ${completedTasks} tasks done this month! You're making progress and that's what counts! Keep going! 💪`,
      gentle: `✨ ${completedTasks} tasks completed. Each one is a step forward. Keep moving at your own pace.`,
      professional: `Monthly summary: ${completedTasks} tasks completed at ${completionRate}% completion rate.`
    };
    return messages[tone];
  }

  /**
   * Detect milestone achievements
   */
  detectMilestones(
    summary: { completionRate: number; completedTasks: number; longestStreak: number; estimationAccuracy?: number | null },
    totalTasksAllTime: number,
    previousMilestones: string[]
  ): string[] {
    const milestones: string[] = [];

    // Task count milestones
    const taskMilestones = [1, 10, 50, 100, 500, 1000];
    for (const milestone of taskMilestones) {
      const key = `task_${milestone}`;
      if (totalTasksAllTime >= milestone && !previousMilestones.includes(key)) {
        milestones.push(this.formatTaskMilestone(milestone));
      }
    }

    // Streak milestones
    const streakMilestones = [3, 7, 14, 30, 60];
    for (const milestone of streakMilestones) {
      const key = `streak_${milestone}`;
      if (summary.longestStreak >= milestone && !previousMilestones.includes(key)) {
        milestones.push(this.formatStreakMilestone(milestone));
      }
    }

    // Accuracy milestones
    if (summary.estimationAccuracy !== null && summary.estimationAccuracy !== undefined) {
      const accuracyMilestones = [80, 90, 95];
      for (const milestone of accuracyMilestones) {
        const key = `accuracy_${milestone}`;
        if (summary.estimationAccuracy >= milestone && !previousMilestones.includes(key)) {
          milestones.push(this.formatAccuracyMilestone(milestone));
        }
      }
    }

    return milestones;
  }

  private formatTaskMilestone(count: number): string {
    const messages: Record<number, string> = {
      1: "🎉 First task completed! This is the start of something great!",
      10: "🎯 10 tasks done! You're building momentum!",
      50: "🌟 50 tasks completed! Consistency is your superpower!",
      100: "💯 100 tasks! You've mastered the art of getting things done!",
      500: "🚀 500 tasks completed! You're a productivity champion!",
      1000: "🏆 1000 TASKS! This is legendary status!"
    };
    return messages[count] || `🎊 ${count} tasks completed - incredible milestone!`;
  }

  private formatStreakMilestone(days: number): string {
    const messages: Record<number, string> = {
      3: "🔥 3-day streak! You're forming a habit!",
      7: "⭐ Week-long streak! Consistency is key!",
      14: "💪 2-week streak! You're unstoppable!",
      30: "🏅 30-day streak! This is incredible discipline!",
      60: "👑 60-day streak! You're a consistency master!"
    };
    return messages[days] || `🔥 ${days}-day streak - amazing consistency!`;
  }

  private formatAccuracyMilestone(percentage: number): string {
    const messages: Record<number, string> = {
      80: "🎓 80% estimation accuracy! You're learning your pace!",
      90: "🎯 90% accuracy! Your time estimates are spot-on!",
      95: "🏆 95% accuracy! You're a time estimation master!"
    };
    return messages[percentage] || `🎯 ${percentage}% accuracy - excellent estimation!`;
  }

  /**
   * Generate gentle reminders for abandoned tasks
   */
  generateGentleReminders(abandonedTasks: Task[], config: Configuration): string[] {
    if (!config.enableInsights || abandonedTasks.length === 0) {
      return [];
    }

    const reminders: string[] = [];
    const tone = config.celebrationLanguage;

    const sevenDaysOld = abandonedTasks.filter(t => this.getDaysOld(t) >= 7 && this.getDaysOld(t) < 14);
    const fourteenDaysOld = abandonedTasks.filter(t => this.getDaysOld(t) >= 14 && this.getDaysOld(t) < 30);
    const thirtyDaysOld = abandonedTasks.filter(t => this.getDaysOld(t) >= 30);

    if (sevenDaysOld.length > 0) {
      reminders.push(this.formatReminder(sevenDaysOld.length, 'week', tone));
    }

    if (fourteenDaysOld.length > 0) {
      reminders.push(this.formatReminder(fourteenDaysOld.length, 'two_weeks', tone));
    }

    if (thirtyDaysOld.length > 0) {
      reminders.push(this.formatReminder(thirtyDaysOld.length, 'month', tone));
    }

    return reminders;
  }

  private formatReminder(count: number, age: 'week' | 'two_weeks' | 'month', tone: 'enthusiastic' | 'gentle' | 'professional'): string {
    const templates = {
      enthusiastic: {
        week: `💭 Hey! You have ${count} task${count > 1 ? 's' : ''} from last week. Revisit when you're ready! 😊`,
        two_weeks: `🌟 ${count} task${count > 1 ? 's are' : ' is'} hanging around from 2 weeks ago. Still relevant? No pressure! 💫`,
        month: `📦 ${count} task${count > 1 ? 's have' : ' has'} been pending for a month. Maybe time to archive or revive? 🔄`
      },
      gentle: {
        week: `💭 ${count} task${count > 1 ? 's' : ''} from last week ${count > 1 ? 'are' : 'is'} resting. Revisit when it feels right.`,
        two_weeks: `🌸 ${count} older task${count > 1 ? 's' : ''} ${count > 1 ? 'have' : 'has'} been patient. Consider a gentle review.`,
        month: `📚 ${count} task${count > 1 ? 's' : ''} from a month ago. Perhaps time to archive or refresh?`
      },
      professional: {
        week: `${count} task${count > 1 ? 's' : ''} from last week pending review at your convenience.`,
        two_weeks: `${count} task${count > 1 ? 's' : ''} older than 2 weeks require attention or archival.`,
        month: `${count} task${count > 1 ? 's' : ''} pending for 30+ days. Recommend review for relevance.`
      }
    };

    return templates[tone][age];
  }

  private getDaysOld(task: Task): number {
    const now = new Date();
    const diff = now.getTime() - task.createdAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate improvement suggestions framed as opportunities
   */
  generateImprovementSuggestions(
    summary: { completionRate: number; longestStreak: number; mostProductiveDay: string | null; averageActualMinutes: number | null },
    accuracy: InsightAccuracyData,
    config: Configuration
  ): string[] {
    if (!config.enableInsights) return [];

    const suggestions: string[] = [];
    const tone = config.celebrationLanguage;

    if (accuracy.accuracy !== null && accuracy.accuracy < 70) {
      suggestions.push(this.suggestEstimationImprovement(tone));
    }

    if (summary.mostProductiveDay) {
      suggestions.push(this.suggestProductiveDayOptimization(summary.mostProductiveDay, tone));
    }

    if (summary.longestStreak < 7) {
      suggestions.push(this.suggestStreakBuilding(tone));
    }

    if (summary.averageActualMinutes && summary.averageActualMinutes > 120) {
      const avgHours = Math.round(summary.averageActualMinutes / 60);
      suggestions.push(this.suggestTaskBreakdown(avgHours, tone));
    }

    if (summary.completionRate < 60) {
      suggestions.push(this.suggestCompletionImprovement(tone));
    }

    return suggestions.slice(0, 3);
  }

  private suggestEstimationImprovement(tone: 'enthusiastic' | 'gentle' | 'professional'): string {
    const templates = {
      enthusiastic: `💡 Pro tip! Try tracking a few quick tasks first to calibrate your time sense - you'll nail those estimates in no time! 🎯`,
      gentle: `💡 Consider: starting with smaller tasks helps you learn your natural pace. No rush, just gentle awareness.`,
      professional: `💡 Recommendation: Begin with shorter tasks to establish baseline estimation patterns for improved accuracy.`
    };
    return templates[tone];
  }

  private suggestProductiveDayOptimization(day: string, tone: 'enthusiastic' | 'gentle' | 'professional'): string {
    const templates = {
      enthusiastic: `💡 You rock on ${day}s! Try scheduling your most important tasks then - ride that productivity wave! 🌊`,
      gentle: `💡 ${day} seems to flow well for you. Perhaps schedule key tasks for that day when it feels right.`,
      professional: `💡 Analysis shows peak productivity on ${day}. Consider prioritizing critical tasks accordingly.`
    };
    return templates[tone];
  }

  private suggestStreakBuilding(tone: 'enthusiastic' | 'gentle' | 'professional'): string {
    const templates = {
      enthusiastic: `💡 Challenge yourself! Try completing just one small task daily - you'll build an awesome streak before you know it! 🔥`,
      gentle: `💡 Small daily wins add up. One task per day, however tiny, creates gentle consistency.`,
      professional: `💡 Strategy: Complete one task daily to establish consistent productivity patterns and extend streak duration.`
    };
    return templates[tone];
  }

  private suggestTaskBreakdown(avgHours: number, tone: 'enthusiastic' | 'gentle' | 'professional'): string {
    const templates = {
      enthusiastic: `💡 Those ${avgHours}-hour tasks? Break 'em down! Smaller chunks = better estimates + more wins to celebrate! 🎉`,
      gentle: `💡 Your tasks average ${avgHours} hours. Smaller pieces might feel more manageable and easier to estimate.`,
      professional: `💡 Task decomposition recommended: Average duration of ${avgHours} hours suggests opportunities for subdivision.`
    };
    return templates[tone];
  }

  private suggestCompletionImprovement(tone: 'enthusiastic' | 'gentle' | 'professional'): string {
    const templates = {
      enthusiastic: `💡 Let's boost that completion rate! Try creating slightly fewer tasks so you can crush each one! 💪`,
      gentle: `💡 You might enjoy creating fewer tasks at once. Less pressure, more completions, better flow.`,
      professional: `💡 Recommendation: Reduce concurrent task volume to improve completion rate and maintain focus.`
    };
    return templates[tone];
  }
}
