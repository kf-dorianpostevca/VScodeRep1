/**
 * CLI command for completing tasks
 * Handles task completion with timestamp capture and celebration-focused messaging
 */

import { Command } from 'commander';
import {
  SQLiteTaskRepository,
  createDatabaseConnection,
  createLogger
} from '@intelligent-todo/shared';
import { formatTaskCompleted, formatError } from '../formatters/TaskFormatter';

const logger = createLogger('cli:complete');

/**
 * Creates the 'complete' command for the CLI
 * @returns Commander.js Command instance configured for task completion
 * @example
 * ```bash
 * todo complete abc123
 * todo done abc123  # alias
 * ```
 */
export function createCompleteCommand(): Command {
  return new Command('complete')
    .description('Mark a task as complete')
    .argument('<taskId>', 'task ID to complete')
    .action(async (taskId: string) => {
      let db: any = null;
      try {
        const dbPath = process.env.TODO_DB_PATH;
        db = createDatabaseConnection(dbPath ? { filePath: dbPath } : {});
        const repository = new SQLiteTaskRepository(db);

        logger.debug(`Attempting to complete task: ${taskId}`);

        // Complete the task
        const completedTask = await repository.completeTask(taskId);

        // Display success message with celebration
        console.log(formatTaskCompleted(completedTask));

      } catch (error) {
        logger.error(`Error completing task: ${error}`);
        console.error(formatError(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      } finally {
        // Clean up database connection
        if (db && db.close && db.open) {
          try {
            db.close();
          } catch (closeError) {
            logger.debug(`Database close error: ${closeError}`);
          }
        }
      }
    });
}

/**
 * Creates the 'done' command as an alias for 'complete'
 * @returns Commander.js Command instance configured as completion alias
 * @example
 * ```bash
 * todo done abc123  # same as 'todo complete abc123'
 * ```
 */
export function createDoneCommand(): Command {
  return new Command('done')
    .description('Mark a task as complete (alias for complete)')
    .argument('<taskId>', 'task ID to complete')
    .action(async (taskId: string) => {
      let db: any = null;
      try {
        const dbPath = process.env.TODO_DB_PATH;
        db = createDatabaseConnection(dbPath ? { filePath: dbPath } : {});
        const repository = new SQLiteTaskRepository(db);

        logger.debug(`Attempting to complete task: ${taskId} (via done alias)`);

        // Complete the task
        const completedTask = await repository.completeTask(taskId);

        // Display success message with celebration
        console.log(formatTaskCompleted(completedTask));

      } catch (error) {
        logger.error(`Error completing task: ${error}`);
        console.error(formatError(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      } finally {
        // Clean up database connection
        if (db && db.close && db.open) {
          try {
            db.close();
          } catch (closeError) {
            logger.debug(`Database close error: ${closeError}`);
          }
        }
      }
    });
}