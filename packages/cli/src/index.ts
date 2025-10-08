/**
 * CLI application entry point
 * Command-line interface for intelligent-todo application with task management commands
 */

import { Command } from 'commander';
import { createLogger, createDatabaseConnection, initializeDatabase } from '@intelligent-todo/shared';
import { createAddCommand } from './commands/add';
import { createListCommand } from './commands/list';
import { createCompleteCommand, createDoneCommand } from './commands/complete';
import { createEditCommand } from './commands/edit';
import { createDeleteCommand } from './commands/delete';
import { createStatsCommand } from './commands/stats';
import { createMonthlyCommand } from './commands/monthly';
import { createConfigCommand } from './commands/config';

const logger = createLogger('cli');
const program = new Command();

/**
 * Initialize CLI application with all commands and database setup
 * @throws Error if database initialization fails
 */
async function initializeCli(): Promise<void> {
  try {
    // Initialize database before running commands
    const dbPath = process.env.TODO_DB_PATH;
    const db = createDatabaseConnection(dbPath ? { filePath: dbPath } : {});
    await initializeDatabase(db);
    if (db.open) {
      db.close();
    }

    // Configure main program
    program
      .name('todo')
      .description('Intelligent todo application CLI - Manage your tasks with style! 🎯')
      .version('1.0.0');

    // Register commands
    program.addCommand(createAddCommand());
    program.addCommand(createListCommand());
    program.addCommand(createCompleteCommand());
    program.addCommand(createDoneCommand());
    program.addCommand(createEditCommand());
    program.addCommand(createDeleteCommand());
    program.addCommand(createStatsCommand());
    program.addCommand(createMonthlyCommand());
    program.addCommand(createConfigCommand());

    // Add helpful examples to the help text
    program.addHelpText('after', `
Examples:
  todo add "Review PRD documentation"              Create a basic task
  todo add "Complete testing" --estimate 2h       Create task with time estimate
  todo add "Bug fix" -d "Fix login issue" -e 30m  Create task with description and estimate
  todo list                                       Show pending tasks only
  todo list --all                                 Show all tasks (pending + completed)
  todo list --completed                           Show only completed tasks
  todo complete abc123                            Mark task as complete
  todo done abc123                                Mark task as complete (alias)
  todo edit abc123 "Updated task title"           Edit task description
  todo edit abc123 --estimate 45m                 Edit task time estimate
  todo edit abc123 "New title" --estimate 30m     Edit both title and estimate
  todo delete abc123                              Delete task (with confirmation)
  todo delete abc123 --force                      Delete task without confirmation

Time estimate formats: 30m, 2h, 1h30m (max 24 hours)
`);

    // Parse command line arguments
    await program.parseAsync();
  } catch (error) {
    logger.error('CLI initialization failed', { error });
    console.error('💥 Failed to initialize todo CLI:');
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    console.error('   Please check your data directory permissions and try again.');
    process.exit(1);
  }
}

// Run CLI if this is the main module
if (require.main === module) {
  initializeCli().catch((error) => {
    console.error('💥 CLI startup failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

export { initializeCli };