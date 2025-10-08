/**
 * Repository interface for Task data access operations.
 * Defines the contract for all task data persistence implementations.
 * Follows the Repository pattern to abstract database operations from business logic.
 */

import { Task, TaskCreate, TaskUpdate, TaskFilter } from '../models/Task';

/**
 * Interface defining all task data access operations.
 * Implementations must provide proper error handling and type safety.
 *
 * @example
 * ```typescript
 * const repository = new SQLiteTaskRepository(db);
 * const task = await repository.create({
 *   title: 'Complete project',
 *   description: 'Finish the todo app implementation'
 * });
 * console.log(`Created task: ${task.id}`);
 * ```
 */
export interface ITaskRepository {
  /**
   * Creates a new task with automatic ID and timestamp generation.
   * @param taskData - Task creation data
   * @returns Promise resolving to the created task
   * @throws Error if validation fails or database operation fails
   * @example
   * ```typescript
   * const task = await repository.create({
   *   title: 'Learn TypeScript',
   *   estimatedMinutes: 60,
   *   tags: ['learning', 'typescript']
   * });
   * ```
   */
  create(taskData: TaskCreate): Promise<Task>;

  /**
   * Retrieves a task by its unique ID.
   * @param id - Task UUID
   * @returns Promise resolving to the task or null if not found
   * @throws Error if database operation fails
   * @example
   * ```typescript
   * const task = await repository.findById('123e4567-e89b-12d3-a456-426614174000');
   * if (task) {
   *   console.log(`Found task: ${task.title}`);
   * }
   * ```
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Retrieves all tasks matching the specified filter criteria.
   * @param filter - Optional filter criteria
   * @returns Promise resolving to array of matching tasks
   * @throws Error if database operation fails
   * @example
   * ```typescript
   * const incompleteTasks = await repository.findAll({ isCompleted: false });
   * const recentTasks = await repository.findAll({
   *   createdAfter: new Date('2025-09-01'),
   *   limit: 10
   * });
   * ```
   */
  findAll(filter?: TaskFilter): Promise<Task[]>;

  /**
   * Updates an existing task with new data.
   * @param updateData - Task update data including ID
   * @returns Promise resolving to the updated task or null if not found
   * @throws Error if validation fails or database operation fails
   * @example
   * ```typescript
   * const updatedTask = await repository.update({
   *   id: '123e4567-e89b-12d3-a456-426614174000',
   *   title: 'Updated task title',
   *   isCompleted: true
   * });
   * ```
   */
  update(updateData: TaskUpdate): Promise<Task | null>;

  /**
   * Marks a task as completed, automatically setting completion timestamp.
   * @param id - Task UUID
   * @returns Promise resolving to the completed task or null if not found
   * @throws Error if database operation fails
   * @example
   * ```typescript
   * const completedTask = await repository.markComplete('123e4567-e89b-12d3-a456-426614174000');
   * if (completedTask) {
   *   console.log(`Task completed in ${completedTask.actualMinutes} minutes`);
   * }
   * ```
   */
  markComplete(id: string): Promise<Task | null>;

  /**
   * Marks a task as incomplete, clearing completion timestamp.
   * @param id - Task UUID
   * @returns Promise resolving to the updated task or null if not found
   * @throws Error if database operation fails
   * @example
   * ```typescript
   * const task = await repository.markIncomplete('123e4567-e89b-12d3-a456-426614174000');
   * if (task) {
   *   console.log('Task marked as incomplete');
   * }
   * ```
   */
  markIncomplete(id: string): Promise<Task | null>;

  /**
   * Completes a task with idempotent behavior - returns success for already completed tasks.
   * Provides celebration-friendly completion handling with automatic timestamp and duration calculation.
   * @param id - Task UUID
   * @returns Promise resolving to the task (completed or already completed)
   * @throws Error if task not found or database operation fails
   * @example
   * ```typescript
   * const completedTask = await repository.completeTask('123e4567-e89b-12d3-a456-426614174000');
   * console.log(`Task completed! Duration: ${completedTask.actualMinutes} minutes`);
   * ```
   */
  completeTask(id: string): Promise<Task>;

  /**
   * Permanently deletes a task from storage.
   * @param id - Task UUID
   * @returns Promise resolving to true if deleted, false if not found
   * @throws Error if database operation fails
   * @example
   * ```typescript
   * const deleted = await repository.delete('123e4567-e89b-12d3-a456-426614174000');
   * if (deleted) {
   *   console.log('Task deleted successfully');
   * }
   * ```
   */
  delete(id: string): Promise<boolean>;

  /**
   * Counts total number of tasks matching filter criteria.
   * @param filter - Optional filter criteria
   * @returns Promise resolving to count of matching tasks
   * @throws Error if database operation fails
   * @example
   * ```typescript
   * const totalTasks = await repository.count();
   * const completedCount = await repository.count({ isCompleted: true });
   * console.log(`Completed ${completedCount} of ${totalTasks} tasks`);
   * ```
   */
  count(filter?: TaskFilter): Promise<number>;

  /**
   * Retrieves tasks with pagination support.
   * @param offset - Number of tasks to skip
   * @param limit - Maximum number of tasks to return
   * @param filter - Optional filter criteria
   * @returns Promise resolving to array of tasks
   * @throws Error if database operation fails
   * @example
   * ```typescript
   * // Get second page of 10 tasks
   * const secondPage = await repository.findPaginated(10, 10, {
   *   isCompleted: false
   * });
   * ```
   */
  findPaginated(offset: number, limit: number, filter?: TaskFilter): Promise<Task[]>;

  /**
   * Retrieves tasks grouped by completion status for analytics.
   * @returns Promise resolving to completion statistics
   * @throws Error if database operation fails
   * @example
   * ```typescript
   * const stats = await repository.getCompletionStats();
   * console.log(`Completion rate: ${stats.completionRate}%`);
   * ```
   */
  getCompletionStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  }>;
}