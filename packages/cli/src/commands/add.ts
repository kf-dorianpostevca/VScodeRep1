/**
 * CLI command for creating new tasks
 * Handles task creation with optional time estimates and celebration-focused messaging
 */

import { Command } from 'commander';
import {
  TaskCreate,
  SQLiteTaskRepository,
  createDatabaseConnection
} from '@intelligent-todo/shared';
import { parseTimeEstimate } from '../parsers/TimeEstimateParser';
import { formatTaskCreated, formatError } from '../formatters/TaskFormatter';

/**
 * Creates the 'add' command for the CLI
 * @returns Commander.js Command instance configured for task creation
 * @example
 * ```bash
 * todo add "Review PRD documentation"
 * todo add "Complete testing" --estimate 2h
 * ```
 */
export function createAddCommand(): Command {
  return new Command('add')
    .description('Create a new task')
    .argument('<title>', 'task title (required)')
    .option('-e, --estimate <time>', 'time estimate (e.g., 30m, 2h, 1h30m)')
    .option('-d, --description <text>', 'detailed task description')
    .action(async (title: string, options: {
      estimate?: string;
      description?: string;
    }) => {
      try {
        await handleAddTask(title, options);
      } catch (error) {
        console.error(formatError(error instanceof Error ? error : String(error)));
        process.exit(1);
      }
    });
}

/**
 * Handles task creation logic with validation and database interaction
 * @param title - Task title from command line
 * @param options - Command options including estimate and description
 * @throws Error if validation fails or database operation fails
 */
async function handleAddTask(
  title: string,
  options: { estimate?: string; description?: string }
): Promise<void> {
  // Validate task title
  if (!title || title.trim().length === 0) {
    throw new Error('Task title is required. Try: todo add "your task here"');
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length > 200) {
    throw new Error('Task title must be 200 characters or less');
  }

  // Prepare task data
  const taskData: TaskCreate = {
    title: trimmedTitle,
    description: options.description?.trim() || null,
  };

  // Parse time estimate if provided
  if (options.estimate) {
    try {
      taskData.estimatedMinutes = parseTimeEstimate(options.estimate);
    } catch (error) {
      throw new Error(`Invalid time estimate: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Validate description length
  if (taskData.description && taskData.description.length > 1000) {
    throw new Error('Task description must be 1000 characters or less');
  }

  // Create database connection and repository
  const dbPath = process.env.TODO_DB_PATH;
  const db = createDatabaseConnection(dbPath ? { filePath: dbPath } : {});
  const taskRepository = new SQLiteTaskRepository(db);

  try {
    // Create the task
    const createdTask = await taskRepository.create(taskData);

    // Output success message with celebration
    console.log(formatTaskCreated(createdTask));
  } catch (error) {
    // Transform database errors to user-friendly messages
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint')) {
        throw new Error('A task with this title already exists');
      } else if (error.message.includes('CHECK constraint')) {
        throw new Error('Task data validation failed. Check your input and try again');
      } else {
        throw new Error('Failed to create task. Please try again');
      }
    }
    throw error;
  } finally {
    // Clean up database connection
    if (db) {
      db.close();
    }
  }
}