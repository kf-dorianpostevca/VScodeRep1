/**
 * useTasks Hook
 * Manages task state and API operations with celebration messaging
 */

import { useState, useEffect, useCallback } from 'react';
import { taskApiService, Task, CreateTaskRequest, UpdateTaskRequest } from '../services/TaskApiService';

export interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  celebrationMessage: string | null;
  celebrationTip: string | null;
  filter: 'all' | 'pending' | 'completed';
  // Actions
  refreshTasks: () => Promise<void>;
  createTask: (data: CreateTaskRequest) => Promise<void>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  setFilter: (filter: 'all' | 'pending' | 'completed') => void;
  clearMessages: () => void;
}

/**
 * Custom hook for managing tasks with celebration-focused feedback
 */
export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [celebrationTip, setCelebrationTip] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  /**
   * Clear success/error messages
   */
  const clearMessages = useCallback(() => {
    setError(null);
    setCelebrationMessage(null);
    setCelebrationTip(null);
  }, []);

  /**
   * Show celebration message temporarily
   */
  const showCelebration = useCallback((message: string, tip?: string) => {
    setCelebrationMessage(message);
    setCelebrationTip(tip || null);
    setError(null);

    // Auto-clear after 4 seconds
    setTimeout(() => {
      setCelebrationMessage(null);
      setCelebrationTip(null);
    }, 4000);
  }, []);

  /**
   * Show error message temporarily
   */
  const showError = useCallback((errorMsg: string, tip?: string) => {
    setError(errorMsg);
    setCelebrationTip(tip || null);
    setCelebrationMessage(null);

    // Auto-clear after 6 seconds for errors (longer than success)
    setTimeout(() => {
      setError(null);
      setCelebrationTip(null);
    }, 6000);
  }, []);

  /**
   * Refresh tasks from API
   */
  const refreshTasks = useCallback(async () => {
    setLoading(true);
    clearMessages();

    try {
      const fetchedTasks = await taskApiService.getTasks(filter === 'all' ? undefined : filter);
      setTasks(fetchedTasks);
    } catch (err) {
      const error = err as Error & { celebrationTip?: string };
      showError(error.message, error.celebrationTip);
    } finally {
      setLoading(false);
    }
  }, [filter, clearMessages, showError]);

  /**
   * Create a new task
   */
  const createTask = useCallback(async (data: CreateTaskRequest) => {
    setLoading(true);
    clearMessages();

    try {
      const result = await taskApiService.createTask(data);

      // Add the new task to the current list (optimistic update)
      setTasks(prevTasks => [result.task, ...prevTasks]);

      showCelebration(result.message, result.celebrationTip);
    } catch (err) {
      const error = err as Error & { celebrationTip?: string };
      showError(error.message, error.celebrationTip);
    } finally {
      setLoading(false);
    }
  }, [clearMessages, showCelebration, showError]);

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (id: string, data: UpdateTaskRequest) => {
    clearMessages();

    try {
      const result = await taskApiService.updateTask(id, data);

      // Update the task in the current list
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? result.task : task
        )
      );

      showCelebration(result.message, result.celebrationTip);
    } catch (err) {
      const error = err as Error & { celebrationTip?: string };
      showError(error.message, error.celebrationTip);
    }
  }, [clearMessages, showCelebration, showError]);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: string) => {
    clearMessages();

    try {
      const result = await taskApiService.deleteTask(id);

      // Remove the task from the current list
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));

      showCelebration(result.message, result.celebrationTip);
    } catch (err) {
      const error = err as Error & { celebrationTip?: string };
      showError(error.message, error.celebrationTip);
    }
  }, [clearMessages, showCelebration, showError]);

  /**
   * Complete a task
   */
  const completeTask = useCallback(async (id: string) => {
    clearMessages();

    try {
      const result = await taskApiService.completeTask(id);

      // Update the task in the current list
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? result.task : task
        )
      );

      showCelebration(result.message, result.celebrationTip);
    } catch (err) {
      const error = err as Error & { celebrationTip?: string };
      showError(error.message, error.celebrationTip);
    }
  }, [clearMessages, showCelebration, showError]);

  // Load tasks when filter changes
  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  return {
    tasks,
    loading,
    error,
    celebrationMessage,
    celebrationTip,
    filter,
    refreshTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    setFilter,
    clearMessages
  };
}