-- Migration 004: Add configuration table
-- Creates singleton configuration table for user preferences

-- Drop if exists to avoid datatype issues
DROP TABLE IF EXISTS configuration;

CREATE TABLE configuration (
  id TEXT PRIMARY KEY,
  default_estimate_minutes INTEGER NOT NULL DEFAULT 30,
  celebration_language TEXT NOT NULL DEFAULT 'enthusiastic',
  date_format TEXT NOT NULL DEFAULT 'ISO',
  time_format TEXT NOT NULL DEFAULT '24h',
  enable_insights INTEGER NOT NULL DEFAULT 1,
  export_format TEXT NOT NULL DEFAULT 'json',
  last_summary_generated TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default configuration
INSERT INTO configuration (id) VALUES ('singleton');
