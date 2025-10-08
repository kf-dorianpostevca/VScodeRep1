/**
 * CLI command for listing tasks
 * Handles task retrieval with filtering options and celebration-focused display
 */

import { Command } from 'commander';
import {
  TaskFilter,
  SQLiteTaskRepository,
  createDatabaseConnection
} from '@intelligent-todo/shared';
import { formatTaskList, formatError } from '../formatters/TaskFormatter';

/**
 * Creates the 'list' command for the CLI
 * @returns Commander.js Command instance configured for task listing
 * @example
 * ```bash
 * todo list              # Show pending tasks only
 * todo list --all        # Show all tasks (pending + completed)
 * todo list --completed  # Show only completed tasks
 * ```
 */
export function createListCommand(): Command {
  return new Command('list')
    .description('List tasks')
    .option('-a, --all', 'show both pending and completed tasks')
    .option('-c, --completed', 'show only completed tasks')
    .action(async (options: { all?: boolean; completed?: boolean }) => {
      try {
        await handleListTasks(options);
      } catch (error) {
        console.error(formatError(error instanceof Error ? error : String(error)));
        process.exit(1);
      }
    });
}

/**
 * Handles task listing logic with filtering and database interaction
 * @param options - Command options including all, completed flags
 * @throws Error if database operation fails
 */
async function handleListTasks(options: { all?: boolean; completed?: boolean }): Promise<void> {
  // Create database connection and repository
  const dbPath = process.env.TODO_DB_PATH;
  const db = createDatabaseConnection(dbPath ? { filePath: dbPath } : {});
  const taskRepository = new SQLiteTaskRepository(db);

  try {
    // Prepare filter based on options
    const filter: TaskFilter = {};

    // Determine filter based on flags
    if (options.completed) {
      filter.isCompleted = true;
    } else if (!options.all) {
      filter.isCompleted = false;
    }
    // If --all flag is provided, no filter needed (show both)

    // Retrieve tasks from database
    const tasks = await taskRepository.findAll(filter);

    // Format and display task list
    const includeCompleted = options.all || options.completed || false;
    const output = formatTaskList(tasks, includeCompleted);
    console.log(output);
  } catch (error) {
    // Transform database errors to user-friendly messages
    if (error instanceof Error) {
      if (error.message.includes('SQLITE_CANTOPEN')) {
        throw new Error('Could not access task database. Make sure you have permission to read the data directory');
      } else if (error.message.includes('no such table')) {
        throw new Error('Task database not initialized. Try creating a task first with: todo add "your first task"');
      } else {
        throw new Error('Failed to retrieve tasks. Please try again');
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