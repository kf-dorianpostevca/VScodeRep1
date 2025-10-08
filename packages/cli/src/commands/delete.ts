/**
 * CLI command for deleting tasks
 * Handles task deletion with confirmation prompts and celebration-focused messaging
 */

import { Command } from 'commander';
import * as readline from 'readline';
import {
  SQLiteTaskRepository,
  createDatabaseConnection,
  createLogger
} from '@intelligent-todo/shared';
import { formatTaskDeleted, formatError } from '../formatters/TaskFormatter';

const logger = createLogger('cli:delete');

/**
 * Creates the 'delete' command for the CLI
 * @returns Commander.js Command instance configured for task deletion
 * @example
 * ```bash
 * todo delete abc123              # Delete with confirmation prompt
 * todo delete abc123 --force      # Delete without confirmation
 * ```
 */
export function createDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a task')
    .argument('<taskId>', 'task ID to delete')
    .option('-f, --force', 'skip confirmation prompt')
    .action(async (taskId: string, options?: { force?: boolean }) => {
      let db: any = null;
      try {
        const dbPath = process.env.TODO_DB_PATH;
        db = createDatabaseConnection(dbPath ? { filePath: dbPath } : {});
        const repository = new SQLiteTaskRepository(db);

        logger.debug(`Attempting to delete task: ${taskId}`, { force: options?.force });

        // Find the task first to get its title for confirmation and error handling
        let task = await repository.findById(taskId);
        let resolvedTaskId = taskId;

        if (!task) {
          // Try to find by short ID - using manual search since we don't have direct access to resolveShortId
          const allTasks = await repository.findAll();
          const matchingTasks = allTasks.filter(t => t.id.toLowerCase().startsWith(taskId.toLowerCase()));

          if (matchingTasks.length === 0) {
            throw new Error('Task not found');
          } else if (matchingTasks.length > 1) {
            throw new Error('Multiple tasks match that ID - please use a longer ID');
          }

          task = matchingTasks[0];
          resolvedTaskId = task.id; // Use full ID for deletion
        }

        // Show confirmation prompt unless --force is used
        if (!options?.force) {
          const confirmed = await confirmDeletion(task.title);
          if (!confirmed) {
            console.log('Deletion cancelled. Your task is safe! 🛡️');
            return;
          }
        }

        // Delete the task
        const deleted = await repository.delete(resolvedTaskId);
        if (!deleted) {
          throw new Error('Task not found');
        }

        // Display success message with celebration
        console.log(formatTaskDeleted(task.title));

      } catch (error) {
        logger.error(`Error deleting task: ${error}`);
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
 * Shows confirmation prompt for task deletion
 * @param taskTitle - Title of the task being deleted
 * @returns Promise<boolean> - True if user confirms deletion
 */
async function confirmDeletion(taskTitle: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`Are you sure you want to delete "${taskTitle}"? (y/N): `, (answer) => {
      rl.close();
      const confirmed = answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes';
      resolve(confirmed);
    });
  });
}