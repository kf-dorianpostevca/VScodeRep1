/**
 * CLI command for editing tasks
 * Handles task title and time estimate updates with validation and celebration-focused messaging
 */

import { Command } from 'commander';
import {
  SQLiteTaskRepository,
  createDatabaseConnection,
  createLogger,
  TaskUpdate
} from '@intelligent-todo/shared';
import { formatTaskEdited, formatError } from '../formatters/TaskFormatter';
import { parseTimeEstimate } from '../parsers/TimeEstimateParser';

const logger = createLogger('cli:edit');

/**
 * Creates the 'edit' command for the CLI
 * @returns Commander.js Command instance configured for task editing
 * @example
 * ```bash
 * todo edit abc123 "new task description"
 * todo edit abc123 --estimate 45m
 * todo edit abc123 "new title" --estimate 30m
 * ```
 */
export function createEditCommand(): Command {
  return new Command('edit')
    .description('Edit a task description or time estimate')
    .argument('<taskId>', 'task ID to edit')
    .argument('[title]', 'new task description (optional if using --estimate only)')
    .option('-e, --estimate <time>', 'update time estimate (e.g., 30m, 2h, 1h30m)')
    .action(async (taskId: string, title?: string, options?: { estimate?: string }) => {
      let db: any = null;
      try {
        const dbPath = process.env.TODO_DB_PATH;
        db = createDatabaseConnection(dbPath ? { filePath: dbPath } : {});
        const repository = new SQLiteTaskRepository(db);

        logger.debug(`Attempting to edit task: ${taskId}`, { title, estimate: options?.estimate });

        // Check if task exists first and resolve short ID
        let resolvedTaskId = taskId;
        let taskFound = await repository.findById(taskId);

        if (!taskFound) {
          // Try to find by short ID - using manual search since we don't have direct access to resolveShortId
          const allTasks = await repository.findAll();
          const matchingTasks = allTasks.filter(task => task.id.toLowerCase().startsWith(taskId.toLowerCase()));

          if (matchingTasks.length === 0) {
            throw new Error('Task not found');
          } else if (matchingTasks.length > 1) {
            throw new Error('Multiple tasks match that ID - please use a longer ID');
          }

          // Use the found task
          taskFound = matchingTasks[0];
          resolvedTaskId = taskFound.id;
        }

        // Validation: must provide either title or estimate
        if (!title && !options?.estimate) {
          throw new Error('Please provide either a new title or use --estimate to update time estimate');
        }

        // Check if task is completed (cannot edit completed tasks)
        if (taskFound && taskFound.isCompleted) {
          throw new Error('Cannot edit completed task - use `todo incomplete <id>` first to make changes');
        }

        // Parse time estimate if provided
        let estimatedMinutes: number | undefined = undefined;
        if (options?.estimate) {
          try {
            estimatedMinutes = parseTimeEstimate(options.estimate);
          } catch (error) {
            throw new Error(`Invalid time estimate: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        // Build update data
        const updateData: TaskUpdate = {
          id: resolvedTaskId
        };

        if (title) {
          // Validate title length
          if (title.length === 0 || title.length > 200) {
            throw new Error('Task title must be between 1 and 200 characters');
          }
          updateData.title = title;
        }

        if (estimatedMinutes !== undefined) {
          updateData.estimatedMinutes = estimatedMinutes;
        }

        // Update the task
        const updatedTask = await repository.update(updateData);
        if (!updatedTask) {
          throw new Error('Task not found');
        }

        // Display success message with celebration
        console.log(formatTaskEdited(updatedTask));

      } catch (error) {
        logger.error(`Error editing task: ${error}`);
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