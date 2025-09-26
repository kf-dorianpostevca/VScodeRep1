/**
 * CLI application entry point
 * Command-line interface for intelligent-todo application
 */

import { Command } from 'commander';
import { createLogger } from '@intelligent-todo/shared';

const logger = createLogger('cli');
const program = new Command();

/**
 * Initialize CLI application
 */
function initializeCli(): void {
  program
    .name('todo')
    .description('Intelligent todo application CLI')
    .version('1.0.0');

  // Placeholder command - will be implemented in future stories
  program
    .command('hello')
    .description('Test command')
    .action(() => {
      console.log('🎉 Hello from intelligent-todo CLI!');
      logger.info('Hello command executed');
    });

  program.parse();
}

// Run CLI if this is the main module
if (require.main === module) {
  initializeCli();
}

export { initializeCli };