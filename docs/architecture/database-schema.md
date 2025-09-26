# Database Schema

```sql
-- SQLite schema for Intelligent Todo Application
-- Optimized for CLI performance and celebration analytics

PRAGMA foreign_keys = ON;

-- Tasks table - Core entity with timestamp tracking
CREATE TABLE tasks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL CHECK (length(title) > 0 AND length(title) <= 200),
    description TEXT CHECK (description IS NULL OR length(description) <= 1000),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    estimated_minutes INTEGER NULL CHECK (estimated_minutes IS NULL OR (estimated_minutes > 0 AND estimated_minutes <= 1440)),
    actual_minutes INTEGER NULL CHECK (actual_minutes IS NULL OR actual_minutes >= 0),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at) WHERE completed_at IS NOT NULL;

-- Monthly summaries table - Pre-calculated analytics for performance
CREATE TABLE monthly_summaries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    month TEXT NOT NULL UNIQUE CHECK (month GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]'),
    total_tasks INTEGER NOT NULL DEFAULT 0,
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    completion_rate REAL NOT NULL DEFAULT 0.0,
    average_actual_minutes REAL NULL,
    estimation_accuracy REAL NULL,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    most_productive_day TEXT NULL,
    celebration_message TEXT NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Configuration table - Single-row settings
CREATE TABLE configuration (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    default_estimate_minutes INTEGER NOT NULL DEFAULT 30,
    celebration_language TEXT NOT NULL DEFAULT 'enthusiastic',
    date_format TEXT NOT NULL DEFAULT 'ISO',
    time_format TEXT NOT NULL DEFAULT '24h',
    enable_insights BOOLEAN NOT NULL DEFAULT TRUE,
    export_format TEXT NOT NULL DEFAULT 'json',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration
INSERT INTO configuration (id) VALUES (1);

-- Trigger to automatically calculate actual_minutes on completion
CREATE TRIGGER tasks_calculate_actual_minutes
    AFTER UPDATE OF completed_at ON tasks
    FOR EACH ROW
    WHEN NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL
BEGIN
    UPDATE tasks
    SET
        actual_minutes = CAST((julianday(NEW.completed_at) - julianday(NEW.created_at)) * 1440 AS INTEGER),
        is_completed = TRUE
    WHERE id = NEW.id;
END;
```
