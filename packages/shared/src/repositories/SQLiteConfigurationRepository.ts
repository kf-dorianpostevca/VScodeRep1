/**
 * SQLite implementation of configuration repository
 */

import Database from 'better-sqlite3';
import { Configuration, ConfigurationUpdate } from '../models/Configuration';
import { IConfigurationRepository } from './IConfigurationRepository';
import { createLogger } from '../utils/logger';

const logger = createLogger('configuration-repository');

/**
 * SQLite implementation (singleton pattern)
 */
export class SQLiteConfigurationRepository implements IConfigurationRepository {
  private readonly SINGLETON_ID = 'singleton';

  constructor(private db: Database.Database) {}

  async get(): Promise<Configuration> {
    logger.info('Getting configuration');

    const row = this.db.prepare('SELECT * FROM configuration WHERE id = ?').get(this.SINGLETON_ID) as any;

    if (!row) {
      // Create default configuration
      return await this.createDefault();
    }

    return this.mapRowToConfig(row);
  }

  async update(updates: ConfigurationUpdate): Promise<Configuration> {
    logger.info('Updating configuration', updates);

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.defaultEstimateMinutes !== undefined) {
      setClauses.push('default_estimate_minutes = ?');
      values.push(updates.defaultEstimateMinutes);
    }

    if (updates.celebrationLanguage !== undefined) {
      setClauses.push('celebration_language = ?');
      values.push(updates.celebrationLanguage);
    }

    if (updates.enableInsights !== undefined) {
      setClauses.push('enable_insights = ?');
      values.push(updates.enableInsights ? 1 : 0);
    }

    if (updates.dateFormat !== undefined) {
      setClauses.push('date_format = ?');
      values.push(updates.dateFormat);
    }

    if (updates.timeFormat !== undefined) {
      setClauses.push('time_format = ?');
      values.push(updates.timeFormat);
    }

    if (updates.exportFormat !== undefined) {
      setClauses.push('export_format = ?');
      values.push(updates.exportFormat);
    }

    if (setClauses.length > 0) {
      values.push(this.SINGLETON_ID);
      const sql = `UPDATE configuration SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      this.db.prepare(sql).run(...values);
    }

    return await this.get();
  }

  private async createDefault(): Promise<Configuration> {
    logger.info('Creating default configuration');

    this.db.prepare(`
      INSERT OR IGNORE INTO configuration (id) VALUES (?)
    `).run(this.SINGLETON_ID);

    return await this.get();
  }

  private mapRowToConfig(row: any): Configuration {
    return {
      id: row.id,
      defaultEstimateMinutes: row.default_estimate_minutes,
      celebrationLanguage: row.celebration_language,
      dateFormat: row.date_format,
      timeFormat: row.time_format,
      enableInsights: Boolean(row.enable_insights),
      exportFormat: row.export_format,
      lastSummaryGenerated: row.last_summary_generated ? new Date(row.last_summary_generated) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
