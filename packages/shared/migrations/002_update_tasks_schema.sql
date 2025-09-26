-- Update tasks table schema to match Task model requirements
-- Adds UUID primary key, proper constraints, and tags support

-- Drop existing indexes temporarily
DROP INDEX IF EXISTS idx_tasks_completed;
DROP INDEX IF EXISTS idx_tasks_created_at;
DROP INDEX IF EXISTS idx_tasks_completed_at;

-- Drop existing triggers temporarily
DROP TRIGGER IF EXISTS update_tasks_timestamp;
DROP TRIGGER IF EXISTS calculate_actual_minutes_on_completion;

-- Create new tasks table with proper UUID and constraints
CREATE TABLE tasks_new (
    -- UUID primary key using SQLite's built-in hex() and randomblob() functions
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Title with proper length constraints (1-200 characters)
    title TEXT NOT NULL CHECK(length(title) > 0 AND length(title) <= 200),

    -- Description with max 1000 characters, nullable
    description TEXT CHECK(description IS NULL OR length(description) <= 1000),

    -- Timestamps for lifecycle tracking
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    completed_at TEXT CHECK(completed_at IS NULL OR datetime(completed_at) IS NOT NULL),

    -- Time estimates and tracking (1-1440 minutes = 1 day max)
    estimated_minutes INTEGER CHECK(estimated_minutes IS NULL OR (estimated_minutes >= 1 AND estimated_minutes <= 1440)),
    actual_minutes INTEGER CHECK(actual_minutes IS NULL OR actual_minutes >= 0),

    -- Completion status flag
    is_completed INTEGER NOT NULL DEFAULT 0 CHECK(is_completed IN (0, 1)),

    -- Tags as JSON array string for future categorization
    tags TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(tags))
);

-- Migrate existing data to new table structure
INSERT INTO tasks_new (title, description, created_at, completed_at, estimated_minutes, actual_minutes, is_completed, tags)
SELECT
    title,
    CASE WHEN description = '' THEN NULL ELSE description END,
    created_at,
    completed_at,
    estimated_minutes,
    actual_minutes,
    is_completed,
    '[]' as tags
FROM tasks;

-- Replace old table with new table
DROP TABLE tasks;
ALTER TABLE tasks_new RENAME TO tasks;

-- Recreate performance indexes with proper names from story requirements
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);

-- Add tags search index for future filtering
CREATE INDEX idx_tasks_tags ON tasks(tags);

-- Recreate updated timestamp trigger
CREATE TRIGGER update_tasks_timestamp
    AFTER UPDATE ON tasks
    FOR EACH ROW
    WHEN NEW.created_at = OLD.created_at  -- Only update if not changing created_at
BEGIN
    UPDATE tasks SET completed_at =
        CASE
            WHEN NEW.is_completed = 1 AND OLD.is_completed = 0 THEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
            ELSE NEW.completed_at
        END
    WHERE id = NEW.id;
END;

-- Recreate actual_minutes calculation trigger with proper UTC timestamps
CREATE TRIGGER calculate_actual_minutes_on_completion
    AFTER UPDATE OF is_completed ON tasks
    FOR EACH ROW
    WHEN NEW.is_completed = 1 AND OLD.is_completed = 0
BEGIN
    UPDATE tasks
    SET
        completed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
        actual_minutes = CASE
            WHEN NEW.actual_minutes IS NULL THEN
                -- Calculate duration from created_at to now in minutes
                CAST((julianday('now') - julianday(NEW.created_at)) * 24 * 60 AS INTEGER)
            ELSE
                NEW.actual_minutes
        END
    WHERE id = NEW.id;
END;