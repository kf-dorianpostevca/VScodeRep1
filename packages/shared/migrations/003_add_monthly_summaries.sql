-- Migration 003: Update monthly summaries table schema
-- Drops old table from migration 001 and creates new schema for Story 2.2

-- Drop old table and its related objects
DROP TABLE IF EXISTS monthly_summaries;
DROP TRIGGER IF EXISTS update_monthly_summaries_timestamp;
DROP INDEX IF EXISTS idx_monthly_summaries_year_month;

-- Create new monthly_summaries table with updated schema
CREATE TABLE monthly_summaries (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL UNIQUE CHECK(month GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]'),
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  completion_rate INTEGER NOT NULL DEFAULT 0,
  average_actual_minutes INTEGER NULL,
  estimation_accuracy INTEGER NULL,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  most_productive_day TEXT NULL,
  celebration_message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast month lookups
CREATE INDEX idx_monthly_summaries_month ON monthly_summaries(month DESC);

-- Trigger to update timestamp on row update
CREATE TRIGGER monthly_summaries_update_timestamp
AFTER UPDATE ON monthly_summaries
FOR EACH ROW
BEGIN
  UPDATE monthly_summaries
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
