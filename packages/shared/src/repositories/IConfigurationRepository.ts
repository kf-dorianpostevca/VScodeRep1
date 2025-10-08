/**
 * Repository interface for configuration persistence
 */

import { Configuration, ConfigurationUpdate } from '../models/Configuration';

/**
 * Repository interface for configuration (singleton pattern)
 */
export interface IConfigurationRepository {
  /**
   * Get configuration (always returns singleton row)
   */
  get(): Promise<Configuration>;

  /**
   * Update configuration
   */
  update(updates: ConfigurationUpdate): Promise<Configuration>;
}
