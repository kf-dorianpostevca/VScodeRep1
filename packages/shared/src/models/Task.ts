/**
 * Core Task data model interface representing a todo item with full lifecycle tracking.
 * Supports time estimation, completion tracking, and future categorization via tags.
 *
 * @example
 * ```typescript
 * const task: Task = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   title: 'Complete project documentation',
 *   description: 'Write comprehensive docs for the new feature',
 *   createdAt: new Date('2025-09-26T10:00:00Z'),
 *   completedAt: null,
 *   estimatedMinutes: 60,
 *   actualMinutes: null,
 *   isCompleted: false,
 *   tags: ['documentation', 'priority']
 * };
 * ```
 */
export interface Task {
  /** Unique identifier for CLI operations (UUID format) */
  readonly id: string;

  /** Task title, required and limited to 1-200 characters */
  title: string;

  /** Optional detailed description, max 1000 characters */
  description: string | null;

  /** Automatic timestamp when task was created (for analytics) */
  readonly createdAt: Date;

  /** Timestamp when task was marked complete, null if not completed */
  completedAt: Date | null;

  /** User's time estimate in minutes (1-1440 minutes = 1 day max) */
  estimatedMinutes: number | null;

  /** Calculated actual time spent, auto-computed from timestamps */
  readonly actualMinutes: number | null;

  /** Completion status flag for filtering and display */
  isCompleted: boolean;

  /** Array of tags for future categorization and filtering */
  tags: string[];
}

/**
 * Interface for creating new tasks, omitting auto-generated and computed fields.
 * Used by CLI commands and API endpoints for task creation.
 *
 * @example
 * ```typescript
 * const newTask: TaskCreate = {
 *   title: 'Review pull request',
 *   description: 'Check the new authentication feature',
 *   estimatedMinutes: 30,
 *   tags: ['review', 'high-priority']
 * };
 * ```
 */
export interface TaskCreate {
  /** Task title, required and limited to 1-200 characters */
  title: string;

  /** Optional detailed description, max 1000 characters */
  description?: string | null;

  /** User's time estimate in minutes (1-1440 minutes = 1 day max) */
  estimatedMinutes?: number | null;

  /** Array of tags for categorization and filtering */
  tags?: string[];
}

/**
 * Interface for updating existing tasks, all fields optional except id.
 * Used by CLI commands and API endpoints for task modifications.
 *
 * @example
 * ```typescript
 * const update: TaskUpdate = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   title: 'Updated task title',
 *   isCompleted: true
 * };
 * ```
 */
export interface TaskUpdate {
  /** Unique identifier of the task to update */
  readonly id: string;

  /** Updated task title, limited to 1-200 characters */
  title?: string;

  /** Updated description, max 1000 characters */
  description?: string | null;

  /** Updated time estimate in minutes (1-1440 minutes = 1 day max) */
  estimatedMinutes?: number | null;

  /** Updated completion status */
  isCompleted?: boolean;

  /** Updated tags array */
  tags?: string[];
}

/**
 * Interface for task filtering and querying operations.
 * Used by repository methods and CLI list commands.
 *
 * @example
 * ```typescript
 * const filter: TaskFilter = {
 *   isCompleted: false,
 *   tags: ['urgent'],
 *   createdAfter: new Date('2025-09-01'),
 *   titleContains: 'project'
 * };
 * ```
 */
export interface TaskFilter {
  /** Filter by completion status */
  isCompleted?: boolean;

  /** Filter by tags (tasks must have ALL specified tags) */
  tags?: string[];

  /** Filter tasks created after this date */
  createdAfter?: Date;

  /** Filter tasks created before this date */
  createdBefore?: Date;

  /** Filter tasks completed after this date */
  completedAfter?: Date;

  /** Filter tasks completed before this date */
  completedBefore?: Date;

  /** Filter tasks with title containing this text (case insensitive) */
  titleContains?: string;

  /** Filter tasks with description containing this text (case insensitive) */
  descriptionContains?: string;

  /** Limit number of results */
  limit?: number;

  /** Offset for pagination */
  offset?: number;
}