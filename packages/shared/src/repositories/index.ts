/**
 * Task repository implementations and interfaces.
 * Provides data access layer abstraction for task persistence operations.
 */

export type { ITaskRepository } from './ITaskRepository';
export { SQLiteTaskRepository } from './SQLiteTaskRepository';