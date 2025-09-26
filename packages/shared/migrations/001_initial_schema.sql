-- Initial database schema for intelligent-todo application
-- Tasks table: Core entity for storing todo items

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK(length(title) > 0),
    description TEXT DEFAULT '',
    is_completed BOOLEAN NOT NULL DEFAULT 0,
    estimated_minutes INTEGER DEFAULT NULL CHECK(estimated_minutes IS NULL OR estimated_minutes > 0),
    actual_minutes INTEGER DEFAULT NULL CHECK(actual_minutes IS NULL OR actual_minutes > 0),
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
    completed_at DATETIME DEFAULT NULL
);

-- Monthly summaries table: Pre-calculated analytics
CREATE TABLE IF NOT EXISTS monthly_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL CHECK(year > 1900),
    month INTEGER NOT NULL CHECK(month >= 1 AND month <= 12),
    total_tasks INTEGER NOT NULL DEFAULT 0,
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    completion_rate REAL NOT NULL DEFAULT 0.0 CHECK(completion_rate >= 0.0 AND completion_rate <= 1.0),
    total_estimated_minutes INTEGER NOT NULL DEFAULT 0,
    total_actual_minutes INTEGER NOT NULL DEFAULT 0,
    estimation_accuracy REAL DEFAULT NULL CHECK(estimation_accuracy IS NULL OR estimation_accuracy >= 0.0),
    productivity_streak_days INTEGER NOT NULL DEFAULT 0 CHECK(productivity_streak_days >= 0),
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
    UNIQUE(year, month)
);

-- Configuration table: Single-row settings for user preferences
CREATE TABLE IF NOT EXISTS configuration (
    id INTEGER PRIMARY KEY CHECK(id = 1), -- Ensure single row
    celebration_mode BOOLEAN NOT NULL DEFAULT 1,
    default_estimated_minutes INTEGER DEFAULT 25 CHECK(default_estimated_minutes > 0),
    database_version INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- Insert default configuration
INSERT OR IGNORE INTO configuration (id, celebration_mode, default_estimated_minutes, database_version)
VALUES (1, 1, 25, 1);

-- Triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_tasks_timestamp
    AFTER UPDATE ON tasks
    FOR EACH ROW
BEGIN
    UPDATE tasks SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_monthly_summaries_timestamp
    AFTER UPDATE ON monthly_summaries
    FOR EACH ROW
BEGIN
    UPDATE monthly_summaries SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_configuration_timestamp
    AFTER UPDATE ON configuration
    FOR EACH ROW
BEGIN
    UPDATE configuration SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger for automatic actual_minutes calculation on task completion
CREATE TRIGGER IF NOT EXISTS calculate_actual_minutes_on_completion
    AFTER UPDATE OF is_completed ON tasks
    FOR EACH ROW
    WHEN NEW.is_completed = 1 AND OLD.is_completed = 0
BEGIN
    UPDATE tasks
    SET
        completed_at = datetime('now'),
        actual_minutes = CASE
            WHEN NEW.actual_minutes IS NULL THEN
                CAST((julianday('now') - julianday(NEW.created_at)) * 24 * 60 AS INTEGER)
            ELSE
                NEW.actual_minutes
        END
    WHERE id = NEW.id;
END;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_year_month ON monthly_summaries(year, month);