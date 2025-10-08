/**
 * Config command - Manage application settings
 */

import { Command } from 'commander';
import {
  createDatabaseConnection,
  SQLiteConfigurationRepository,
  createLogger,
  CelebrationLanguage,
} from '@intelligent-todo/shared';

const logger = createLogger('config-command');

export function createConfigCommand(): Command {
  const command = new Command('config');

  command
    .description('Manage todo application settings ⚙️')
    .option('--show', 'Display current configuration')
    .option('--celebration-language <tone>', 'Set celebration tone: enthusiastic|gentle|professional')
    .option('--enable-insights', 'Enable celebration insights')
    .option('--disable-insights', 'Disable insights (raw data only)')
    .action(async (options) => {
      const db = createDatabaseConnection();

      try {
        const repository = new SQLiteConfigurationRepository(db);

        // Apply updates
        const updates: any = {};

        if (options.celebrationLanguage) {
          const validTones: CelebrationLanguage[] = ['enthusiastic', 'gentle', 'professional'];
          if (!validTones.includes(options.celebrationLanguage)) {
            throw new Error(`Invalid tone. Choose: enthusiastic, gentle, or professional`);
          }
          updates.celebrationLanguage = options.celebrationLanguage;
        }

        if (options.enableInsights) {
          updates.enableInsights = true;
        }

        if (options.disableInsights) {
          updates.enableInsights = false;
        }

        if (Object.keys(updates).length > 0) {
          await repository.update(updates);
          console.log('✅ Configuration updated!\n');
        }

        // Show configuration
        const config = await repository.get();
        console.log('📋 Todo Configuration\n');
        console.log(`Celebration Language: ${config.celebrationLanguage}`);
        console.log(`Insights Enabled: ${config.enableInsights ? 'Yes' : 'No'}`);
        console.log(`Default Estimate: ${config.defaultEstimateMinutes} minutes`);

        logger.info('Config displayed', { celebrationLanguage: config.celebrationLanguage });
      } catch (error) {
        logger.error('Config command failed', { error });
        console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      } finally {
        if (db.open) {
          db.close();
        }
      }
    });

  return command;
}
