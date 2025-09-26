/**
 * SQLite implementation of the TaskRepository interface.
 * Provides task data persistence using better-sqlite3 with synchronous API.
 * Handles data conversion between JavaScript objects and SQLite storage format.
 */

import Database from 'better-sqlite3';
import { Task, TaskCreate, TaskUpdate, TaskFilter } from '../models/Task';
import { ITaskRepository } from './ITaskRepository';
import {
  generateTaskId,
  validateTaskData,
  convertSQLiteRow,
  convertToSQLiteFormat,
  executeWithErrorHandling
} from '../utils/database';
import { createLogger } from '../utils/logger';

const logger = createLogger('sqlite-task-repository');

/**
 * SQLite-based implementation of task repository.
 * Uses prepared statements for performance and security.
 * Provides automatic data conversion and comprehensive error handling.
 */
export class SQLiteTaskRepository implements ITaskRepository {
  private db: Database.Database;
  private createStmt!: Database.Statement;
  private findByIdStmt!: Database.Statement;
  private updateStmt!: Database.Statement;
  private markCompleteStmt!: Database.Statement;
  private markIncompleteStmt!: Database.Statement;
  private deleteStmt!: Database.Statement;
  private countStmt!: Database.Statement;

  /**
   * Creates a new SQLite task repository instance.
   * @param database - SQLite database connection
   * @throws Error if database connection is invalid
   */
  constructor(database: Database.Database) {
    if (!database || !database.open) {
      throw new Error('Valid SQLite database connection is required');
    }

    this.db = database;
    this.prepareStatements();
    logger.info('SQLite task repository initialized');
  }

  /**
   * Prepares all SQL statements for optimal performance.
   * @private
   */
  private prepareStatements(): void {
    try {
      this.createStmt = this.db.prepare(`
        INSERT INTO tasks (id, title, description, estimated_minutes, tags)
        VALUES (@id, @title, @description, @estimated_minutes, @tags)
        RETURNING *
      `);

      this.findByIdStmt = this.db.prepare(`
        SELECT * FROM tasks WHERE id = ?
      `);

      // findAll uses dynamic queries based on filters, so no prepared statement needed

      this.updateStmt = this.db.prepare(`
        UPDATE tasks SET
          title = COALESCE(@title, title),
          description = COALESCE(@description, description),
          estimated_minutes = COALESCE(@estimated_minutes, estimated_minutes),
          is_completed = COALESCE(@is_completed, is_completed),
          tags = COALESCE(@tags, tags)
        WHERE id = @id
        RETURNING *
      `);

      this.markCompleteStmt = this.db.prepare(`
        UPDATE tasks SET is_completed = 1 WHERE id = ? RETURNING *
      `);

      this.markIncompleteStmt = this.db.prepare(`
        UPDATE tasks SET
          is_completed = 0,
          completed_at = NULL,
          actual_minutes = NULL
        WHERE id = ?
        RETURNING *
      `);

      this.deleteStmt = this.db.prepare(`
        DELETE FROM tasks WHERE id = ?
      `);

      this.countStmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM tasks
      `);

      logger.info('SQL statements prepared successfully');
    } catch (error) {
      logger.error('Failed to prepare SQL statements', { error });
      throw new Error('Failed to initialize repository statements');
    }
  }

  /**
   * {@inheritDoc ITaskRepository.create}
   */
  public async create(taskData: TaskCreate): Promise<Task> {
    logger.info('Creating new task', { title: taskData.title });

    // Validate input data
    validateTaskData(taskData);

    // Generate UUID and prepare data
    const taskId = generateTaskId();
    const sqliteData = convertToSQLiteFormat({
      id: taskId,
      title: taskData.title,
      description: taskData.description || null,
      estimated_minutes: taskData.estimatedMinutes || null,
      tags: taskData.tags || []
    });

    return executeWithErrorHandling(
      this.db,
      () => {
        const result = this.createStmt.get(sqliteData);
        const task = convertSQLiteRow(result);
        logger.info('Task created successfully', { id: task.id, title: task.title });
        return task;
      },
      'create task'
    );
  }

  /**
   * {@inheritDoc ITaskRepository.findById}
   */
  public async findById(id: string): Promise<Task | null> {
    logger.debug('Finding task by ID', { id });

    return executeWithErrorHandling(
      this.db,
      () => {
        const result = this.findByIdStmt.get(id);
        if (!result) {
          logger.debug('Task not found', { id });
          return null;
        }
        const task = convertSQLiteRow(result);
        logger.debug('Task found', { id, title: task.title });
        return task;
      },
      'find task by ID'
    );
  }

  /**
   * {@inheritDoc ITaskRepository.findAll}
   */
  public async findAll(filter?: TaskFilter): Promise<Task[]> {
    logger.debug('Finding all tasks', { filter });

    return executeWithErrorHandling(
      this.db,
      () => {
        let sql = 'SELECT * FROM tasks';
        const conditions: string[] = [];
        const params: any[] = [];

        // Build WHERE clause based on filter
        if (filter) {
          if (filter.isCompleted !== undefined) {
            conditions.push('is_completed = ?');
            params.push(filter.isCompleted ? 1 : 0);
          }

          if (filter.createdAfter) {
            conditions.push('created_at > ?');
            params.push(filter.createdAfter.toISOString());
          }

          if (filter.createdBefore) {
            conditions.push('created_at < ?');
            params.push(filter.createdBefore.toISOString());
          }

          if (filter.completedAfter) {
            conditions.push('completed_at > ?');
            params.push(filter.completedAfter.toISOString());
          }

          if (filter.completedBefore) {
            conditions.push('completed_at < ?');
            params.push(filter.completedBefore.toISOString());
          }

          if (filter.titleContains) {
            conditions.push('title LIKE ?');
            params.push(`%${filter.titleContains}%`);
          }

          if (filter.descriptionContains) {
            conditions.push('description LIKE ?');
            params.push(`%${filter.descriptionContains}%`);
          }

          if (filter.tags && filter.tags.length > 0) {
            // Check if task has ALL specified tags
            for (const tag of filter.tags) {
              conditions.push('json_extract(tags, "$") LIKE ?');
              params.push(`%"${tag}"%`);
            }
          }
        }

        if (conditions.length > 0) {
          sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY created_at DESC';

        // Add pagination
        if (filter?.limit) {
          sql += ' LIMIT ?';
          params.push(filter.limit);

          if (filter.offset) {
            sql += ' OFFSET ?';
            params.push(filter.offset);
          }
        }

        const stmt = this.db.prepare(sql);
        const results = stmt.all(...params);
        const tasks = results.map(convertSQLiteRow);

        logger.debug('Tasks found', { count: tasks.length });
        return tasks;
      },
      'find all tasks'
    );
  }

  /**
   * {@inheritDoc ITaskRepository.update}
   */
  public async update(updateData: TaskUpdate): Promise<Task | null> {
    logger.info('Updating task', { id: updateData.id });

    // Validate input data
    validateTaskData(updateData);

    const sqliteData = convertToSQLiteFormat({
      id: updateData.id,
      title: updateData.title,
      description: updateData.description,
      estimated_minutes: updateData.estimatedMinutes,
      is_completed: updateData.isCompleted,
      tags: updateData.tags
    });

    return executeWithErrorHandling(
      this.db,
      () => {
        const result = this.updateStmt.get(sqliteData);
        if (!result) {
          logger.warn('Task not found for update', { id: updateData.id });
          return null;
        }
        const task = convertSQLiteRow(result);
        logger.info('Task updated successfully', { id: task.id, title: task.title });
        return task;
      },
      'update task'
    );
  }

  /**
   * {@inheritDoc ITaskRepository.markComplete}
   */
  public async markComplete(id: string): Promise<Task | null> {
    logger.info('Marking task as complete', { id });

    return executeWithErrorHandling(
      this.db,
      () => {
        const result = this.markCompleteStmt.get(id);
        if (!result) {
          logger.warn('Task not found for completion', { id });
          return null;
        }
        const task = convertSQLiteRow(result);
        logger.info('Task marked as complete', {
          id: task.id,
          title: task.title,
          actualMinutes: task.actualMinutes
        });
        return task;
      },
      'mark task complete'
    );
  }

  /**
   * {@inheritDoc ITaskRepository.markIncomplete}
   */
  public async markIncomplete(id: string): Promise<Task | null> {
    logger.info('Marking task as incomplete', { id });

    return executeWithErrorHandling(
      this.db,
      () => {
        const result = this.markIncompleteStmt.get(id);
        if (!result) {
          logger.warn('Task not found for incompletion', { id });
          return null;
        }
        const task = convertSQLiteRow(result);
        logger.info('Task marked as incomplete', { id: task.id, title: task.title });
        return task;
      },
      'mark task incomplete'
    );
  }

  /**
   * {@inheritDoc ITaskRepository.delete}
   */
  public async delete(id: string): Promise<boolean> {
    logger.info('Deleting task', { id });

    return executeWithErrorHandling(
      this.db,
      () => {
        const result = this.deleteStmt.run(id);
        const deleted = result.changes > 0;
        if (deleted) {
          logger.info('Task deleted successfully', { id });
        } else {
          logger.warn('Task not found for deletion', { id });
        }
        return deleted;
      },
      'delete task'
    );
  }

  /**
   * {@inheritDoc ITaskRepository.count}
   */
  public async count(filter?: TaskFilter): Promise<number> {
    logger.debug('Counting tasks', { filter });

    return executeWithErrorHandling(
      this.db,
      () => {
        if (!filter) {
          const result = this.countStmt.get() as { count: number };
          return result.count;
        }

        // Build filtered count query
        let sql = 'SELECT COUNT(*) as count FROM tasks';
        const conditions: string[] = [];
        const params: any[] = [];

        if (filter.isCompleted !== undefined) {
          conditions.push('is_completed = ?');
          params.push(filter.isCompleted ? 1 : 0);
        }

        if (filter.createdAfter) {
          conditions.push('created_at > ?');
          params.push(filter.createdAfter.toISOString());
        }

        if (filter.createdBefore) {
          conditions.push('created_at < ?');
          params.push(filter.createdBefore.toISOString());
        }

        if (filter.titleContains) {
          conditions.push('title LIKE ?');
          params.push(`%${filter.titleContains}%`);
        }

        if (conditions.length > 0) {
          sql += ' WHERE ' + conditions.join(' AND ');
        }

        const stmt = this.db.prepare(sql);
        const result = stmt.get(...params) as { count: number };

        logger.debug('Task count completed', { count: result.count });
        return result.count;
      },
      'count tasks'
    );
  }

  /**
   * {@inheritDoc ITaskRepository.findPaginated}
   */
  public async findPaginated(
    offset: number,
    limit: number,
    filter?: TaskFilter
  ): Promise<Task[]> {
    logger.debug('Finding paginated tasks', { offset, limit, filter });

    const paginatedFilter: TaskFilter = {
      ...filter,
      offset,
      limit
    };

    return this.findAll(paginatedFilter);
  }

  /**
   * {@inheritDoc ITaskRepository.getCompletionStats}
   */
  public async getCompletionStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  }> {
    logger.debug('Getting completion statistics');

    return executeWithErrorHandling(
      this.db,
      () => {
        const statsStmt = this.db.prepare(`
          SELECT
            COUNT(*) as total,
            COALESCE(SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END), 0) as completed,
            COALESCE(SUM(CASE WHEN is_completed = 0 THEN 1 ELSE 0 END), 0) as pending
          FROM tasks
        `);

        const result = statsStmt.get() as {
          total: number;
          completed: number;
          pending: number;
        };

        const completionRate = result.total > 0
          ? Math.round((result.completed / result.total) * 100)
          : 0;

        const stats = {
          total: result.total,
          completed: result.completed,
          pending: result.pending,
          completionRate
        };

        logger.debug('Completion statistics calculated', stats);
        return stats;
      },
      'get completion statistics'
    );
  }

  /**
   * Closes the repository and cleans up resources.
   * Should be called when the repository is no longer needed.
   */
  public close(): void {
    // Prepared statements are automatically cleaned up when database closes
    logger.info('SQLite task repository closed');
  }
}