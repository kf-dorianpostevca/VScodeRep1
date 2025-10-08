/**
 * Data models for the Intelligent Todo application.
 * Contains all interfaces and types for core business entities.
 */

export type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskFilter
} from './Task.js';

export type {
  MonthlySummary,
  MonthlySummaryCreate
} from './MonthlySummary.js';

export type {
  HistoricalTrends,
  HistoricalMonth,
  TrendIndicator,
  SparklineData
} from './HistoricalTrends.js';

export type {
  Configuration,
  ConfigurationUpdate,
  CelebrationLanguage
} from './Configuration.js';