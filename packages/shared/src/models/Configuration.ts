/**
 * Configuration model for user preferences
 */

export type CelebrationLanguage = 'enthusiastic' | 'gentle' | 'professional';

/**
 * User configuration and preferences
 */
export interface Configuration {
  id: string;
  defaultEstimateMinutes: number;
  celebrationLanguage: CelebrationLanguage;
  dateFormat: string;
  timeFormat: string;
  enableInsights: boolean;
  exportFormat: string;
  lastSummaryGenerated: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for updating configuration
 */
export interface ConfigurationUpdate {
  defaultEstimateMinutes?: number;
  celebrationLanguage?: CelebrationLanguage;
  dateFormat?: string;
  timeFormat?: string;
  enableInsights?: boolean;
  exportFormat?: string;
  lastSummaryGenerated?: Date | null;
}
