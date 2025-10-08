/**
 * Task formatting utilities for CLI display
 * Provides consistent, user-friendly task presentation with celebration elements
 */

import { Task } from '@intelligent-todo/shared';
import { formatTimeEstimate } from '../parsers/TimeEstimateParser';

/**
 * Formats a single task for CLI display with celebration elements
 * @param task - Task to format
 * @param showDetails - Whether to include detailed information
 * @returns Formatted task string for CLI output
 * @example
 * ```typescript
 * const output = formatTask(task);
 * // "#abc123  Review PRD documentation          [30m] Created 2 hours ago"
 * ```
 */
export function formatTask(task: Task, showDetails: boolean = true): string {
  const shortId = task.id.slice(0, 7);
  const statusIcon = task.isCompleted ? '✅' : '⭕';

  // For completed tasks, show title normally (strikethrough causes test issues)
  const title = task.title.padEnd(35);

  let output = `  ${statusIcon} #${shortId}  ${title}`;

  if (showDetails) {
    // Add time estimate and actual time for completed tasks
    if (task.isCompleted && task.actualMinutes !== null && task.estimatedMinutes) {
      const estimated = formatTimeEstimate(task.estimatedMinutes);
      const actual = formatTimeEstimate(task.actualMinutes);
      output += ` [${estimated} → ${actual}]`;
    } else if (task.estimatedMinutes) {
      const timeEstimate = formatTimeEstimate(task.estimatedMinutes);
      output += ` [${timeEstimate}]`;
    } else {
      output += '      '; // Padding when no estimate
    }

    // Add completion time for completed tasks, creation time for pending
    if (task.isCompleted && task.completedAt) {
      const timeAgo = getTimeAgo(task.completedAt);
      output += ` Completed ${timeAgo}`;
    } else {
      const timeAgo = getTimeAgo(task.createdAt);
      output += ` Created ${timeAgo}`;
    }
  }

  return output;
}

/**
 * Formats a list of tasks with header and summary
 * @param tasks - Array of tasks to format
 * @param includeCompleted - Whether completed tasks are included
 * @returns Formatted task list string with celebration elements
 * @example
 * ```typescript
 * const output = formatTaskList(tasks, false);
 * console.log(output);
 * // "🎯 Your Active Tasks:
 * //   ⭕ #abc123  Review PRD documentation          [30m] Created 2 hours ago
 * //   ⭕ #def456  Update test cases                 [1h]  Created yesterday
 * //
 * // 2 tasks pending 🚀"
 * ```
 */
export function formatTaskList(tasks: Task[], includeCompleted: boolean = false): string {
  if (tasks.length === 0) {
    return includeCompleted
      ? '🎉 No tasks found! You\'re all caught up! ✨'
      : '🎉 No pending tasks! You\'re crushing it! ✨';
  }

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  let output = '';

  // Header with celebration elements
  if (includeCompleted && tasks.length > 0) {
    output += '📋 All Your Tasks:\n';
  } else if (pendingTasks.length > 0) {
    output += '🎯 Your Active Tasks:\n';
  }

  // Show pending tasks first
  if (pendingTasks.length > 0) {
    pendingTasks.forEach(task => {
      output += formatTask(task) + '\n';
    });
  }

  // Show completed tasks if requested
  if (includeCompleted && completedTasks.length > 0) {
    if (pendingTasks.length > 0) {
      output += '\n✅ Completed Tasks:\n';
    }
    completedTasks.forEach(task => {
      output += formatTask(task) + '\n';
    });
  }

  // Summary with celebration
  output += '\n';
  const pendingCount = pendingTasks.length;
  const completedCount = completedTasks.length;

  if (includeCompleted) {
    if (completedCount > 0) {
      output += `🎯 ${pendingCount} pending, ✅ ${completedCount} completed`;
      if (pendingCount === 0) {
        output += ' - Amazing work! 🌟';
      } else {
        output += ' - Keep going! 🚀';
      }
    } else {
      output += `${pendingCount} tasks pending 🚀`;
    }
  } else {
    output += `${pendingCount} task${pendingCount !== 1 ? 's' : ''} pending 🚀`;
  }

  return output;
}

/**
 * Formats task creation success message with celebration elements
 * @param task - Newly created task
 * @returns Success message string
 * @example
 * ```typescript
 * const message = formatTaskCreated(newTask);
 * // "✅ Task created successfully! #abc123
 * //    📝 Review PRD documentation [30m]"
 * ```
 */
export function formatTaskCreated(task: Task): string {
  const shortId = task.id.slice(0, 7);
  let message = `✅ Task created successfully! #${shortId}\n`;
  message += `   📝 ${task.title}`;

  if (task.estimatedMinutes) {
    const timeEstimate = formatTimeEstimate(task.estimatedMinutes);
    message += ` [${timeEstimate}]`;
  }

  return message;
}

/**
 * Formats task edit success message with celebration elements
 * @param task - Edited task
 * @returns Success message string showing updated task details
 * @example
 * ```typescript
 * const message = formatTaskEdited(editedTask);
 * // "✏️  Task updated successfully!
 * //    📝 #abc123  New task description          [45m estimated]"
 * ```
 */
export function formatTaskEdited(task: Task): string {
  const shortId = task.id.slice(0, 7);
  let message = `✏️  Task updated successfully!\n`;
  message += `   📝 #${shortId}  ${task.title}`;

  if (task.estimatedMinutes) {
    const timeEstimate = formatTimeEstimate(task.estimatedMinutes);
    message += ` [${timeEstimate} estimated]`;
  }

  message += '\n\nUpdated task details - keep up the great work! 🚀';
  return message;
}

/**
 * Formats task deletion success message with celebration elements
 * @param taskTitle - Title of the deleted task
 * @returns Success message string
 * @example
 * ```typescript
 * const message = formatTaskDeleted("Review pull request");
 * // "🗑️  Task deleted successfully!
 * //
 * // One less thing on your plate! You're making progress! 🌟"
 * ```
 */
export function formatTaskDeleted(_taskTitle: string): string {
  let message = `🗑️  Task deleted successfully!\n`;
  message += '\nOne less thing on your plate! You\'re making progress! 🌟';
  return message;
}

/**
 * Formats task completion success message with celebration elements
 * @param task - Completed task
 * @returns Success message string with time comparison when available
 * @example
 * ```typescript
 * const message = formatTaskCompleted(completedTask);
 * // "🎉 Task completed! Estimated 30m, took 25m - Great job staying under time!"
 * ```
 */
export function formatTaskCompleted(task: Task): string {
  const shortId = task.id.slice(0, 7);

  // Check if this is an idempotent completion (already completed without new actualMinutes)
  if (task.isCompleted && task.completedAt && task.actualMinutes === null) {
    // Task was already completed (idempotent behavior)
    return `This task is already done! You're on top of things! 🌟\n   ✅ #${shortId} ${task.title}`;
  }

  let message = `🎉 Task completed! #${shortId}\n   ✅ ${task.title}`;

  // Add time comparison if estimates are available
  if (task.estimatedMinutes && task.actualMinutes !== null) {
    const estimated = formatTimeEstimate(task.estimatedMinutes);
    const actual = formatTimeEstimate(task.actualMinutes);
    const difference = task.estimatedMinutes - task.actualMinutes;

    message += `\n   ⏱️  Estimated ${estimated}, took ${actual}`;

    if (difference > 0) {
      const saved = formatTimeEstimate(difference);
      message += ` - Great job staying ${saved} under time! ✨`;
    } else if (difference < 0) {
      const over = formatTimeEstimate(Math.abs(difference));
      message += ` - ${over} over estimate, but progress is progress! 💪`;
    } else {
      message += ` - Perfect timing! 🎯`;
    }
  } else if (task.estimatedMinutes) {
    const estimated = formatTimeEstimate(task.estimatedMinutes);
    message += `\n   📝 Originally estimated ${estimated}`;
  }

  return message;
}

/**
 * Formats error messages with celebration-focused tone
 * @param error - Error message or Error object
 * @returns User-friendly error message
 * @example
 * ```typescript
 * const message = formatError("Task title is required");
 * // "Oops! Task title is required 💭
 * //  Try: todo add 'your task here'"
 * ```
 */
export function formatError(error: string | Error): string {
  const errorMsg = error instanceof Error ? error.message : error;

  // Transform common errors to celebration-focused messages
  if (errorMsg.includes('Task not found')) {
    return `Hmm, I couldn't find that task. 🤔\n  Try: todo list to see your active tasks`;
  }

  return `Oops! ${errorMsg} 💭\n  Try: todo --help for usage examples`;
}

/**
 * Calculates human-readable time ago string
 * @param date - Date to calculate from
 * @returns Human-readable time difference
 * @example
 * ```typescript
 * getTimeAgo(new Date(Date.now() - 7200000))  // "2 hours ago"
 * getTimeAgo(new Date(Date.now() - 86400000)) // "yesterday"
 * ```
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}