/**
 * Task Controller
 * Handles HTTP requests for task operations, integrating with shared business logic
 */

import { Request, Response } from 'express';
import {
  SQLiteTaskRepository,
  TaskCreate,
  TaskUpdate,
  TaskFilter,
  createLogger
} from '@intelligent-todo/shared';
import { getDatabaseConnection } from '../database/connection';

const logger = createLogger('TaskController');

/**
 * Task Controller class for handling HTTP requests
 * Provides REST API endpoints for all task operations
 */
export class TaskController {
  private taskRepository: SQLiteTaskRepository;

  constructor() {
    // Use singleton database connection to ensure consistency across requests
    const db = getDatabaseConnection();
    this.taskRepository = new SQLiteTaskRepository(db);
  }

  /**
   * Get all tasks with optional filtering
   * GET /api/v1/tasks?status=pending|completed|all
   */
  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string | undefined;

      let filter: TaskFilter = {};

      if (status === 'pending') {
        filter.isCompleted = false;
      } else if (status === 'completed') {
        filter.isCompleted = true;
      }
      // status === 'all' or undefined means no filtering

      const tasks = await this.taskRepository.findAll(filter);

      res.status(200).json({
        success: true,
        message: `🎯 Found ${tasks.length} task${tasks.length !== 1 ? 's' : ''}!`,
        data: tasks,
        count: tasks.length
      });
    } catch (error) {
      logger.error('Error fetching tasks', { error });
      res.status(500).json({
        success: false,
        error: 'Oops! Something went wrong fetching your tasks. Please try again.',
        celebrationTip: 'Your tasks are safely stored - just a temporary hiccup! 🌟'
      });
    }
  }

  /**
   * Get a single task by ID
   * GET /api/v1/tasks/:id
   */
  async getTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskRepository.findById(id);

      if (!task) {
        res.status(404).json({
          success: false,
          error: "Hmm, I couldn't find that task.",
          celebrationTip: 'Check your task list to see what needs your attention! 🔍'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '✅ Task found!',
        data: task
      });
    } catch (error) {
      logger.error('Error fetching task', { error, taskId: req.params.id });
      res.status(500).json({
        success: false,
        error: 'Oops! Something went wrong fetching that task. Please try again.',
        celebrationTip: 'Your task is safely stored - just a temporary hiccup! 🌟'
      });
    }
  }

  /**
   * Create a new task
   * POST /api/v1/tasks
   */
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, estimatedMinutes } = req.body;

      // Validation
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Task title is required and cannot be empty.',
          celebrationTip: 'Give your task a clear, descriptive title to stay organized! 📝'
        });
        return;
      }

      if (title.length > 200) {
        res.status(400).json({
          success: false,
          error: 'Task title must be 200 characters or less.',
          celebrationTip: 'Keep it concise - shorter titles are easier to scan! ✨'
        });
        return;
      }

      if (description && description.length > 1000) {
        res.status(400).json({
          success: false,
          error: 'Task description must be 1000 characters or less.',
          celebrationTip: 'Detailed but focused descriptions work best! 📋'
        });
        return;
      }

      if (estimatedMinutes !== undefined && (
        typeof estimatedMinutes !== 'number' ||
        estimatedMinutes < 1 ||
        estimatedMinutes > 1440
      )) {
        res.status(400).json({
          success: false,
          error: 'Estimated minutes must be between 1 and 1440 (24 hours).',
          celebrationTip: 'Time estimates help you plan your day effectively! ⏱️'
        });
        return;
      }

      const taskData: TaskCreate = {
        title: title.trim(),
        description: description?.trim() || null,
        estimatedMinutes: estimatedMinutes || null
      };

      const task = await this.taskRepository.create(taskData);

      res.status(201).json({
        success: true,
        message: `🎉 Task created successfully! You're building momentum!`,
        data: task,
        celebrationTip: 'Every task added is a step toward your goals! 🚀'
      });
    } catch (error) {
      logger.error('Error creating task', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: 'Oops! Something went wrong creating your task. Please try again.',
        celebrationTip: 'Your productivity journey continues - just a small bump! 💪'
      });
    }
  }

  /**
   * Update an existing task
   * PUT /api/v1/tasks/:id
   */
  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, estimatedMinutes } = req.body;

      // Check if task exists
      const existingTask = await this.taskRepository.findById(id);
      if (!existingTask) {
        res.status(404).json({
          success: false,
          error: "Hmm, I couldn't find that task to update.",
          celebrationTip: 'Check your task list to see what needs your attention! 🔍'
        });
        return;
      }

      // Cannot edit completed tasks
      if (existingTask.isCompleted) {
        res.status(400).json({
          success: false,
          error: 'This completed task is locked in! Great job finishing it! 🏆',
          celebrationTip: 'Create a new task if you need to track additional work!'
        });
        return;
      }

      // Validation
      if (title !== undefined) {
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
          res.status(400).json({
            success: false,
            error: 'Task title cannot be empty.',
            celebrationTip: 'Give your task a clear, descriptive title to stay organized! 📝'
          });
          return;
        }

        if (title.length > 200) {
          res.status(400).json({
            success: false,
            error: 'Task title must be 200 characters or less.',
            celebrationTip: 'Keep it concise - shorter titles are easier to scan! ✨'
          });
          return;
        }
      }

      if (description !== undefined && description !== null && description.length > 1000) {
        res.status(400).json({
          success: false,
          error: 'Task description must be 1000 characters or less.',
          celebrationTip: 'Detailed but focused descriptions work best! 📋'
        });
        return;
      }

      if (estimatedMinutes !== undefined && estimatedMinutes !== null && (
        typeof estimatedMinutes !== 'number' ||
        estimatedMinutes < 1 ||
        estimatedMinutes > 1440
      )) {
        res.status(400).json({
          success: false,
          error: 'Estimated minutes must be between 1 and 1440 (24 hours).',
          celebrationTip: 'Time estimates help you plan your day effectively! ⏱️'
        });
        return;
      }

      // For partial updates, we need to merge with existing task data
      // to ensure validation passes. Let's build a complete update object.
      const updateData: TaskUpdate = {
        id,
        title: existingTask.title, // Keep existing title by default
        description: existingTask.description, // Keep existing description by default
        estimatedMinutes: existingTask.estimatedMinutes // Keep existing estimate by default
      };

      // Override only the fields that are being updated
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description?.trim() || null;
      if (estimatedMinutes !== undefined) updateData.estimatedMinutes = estimatedMinutes;

      const updatedTask = await this.taskRepository.update(updateData);

      if (!updatedTask) {
        res.status(404).json({
          success: false,
          error: "Hmm, I couldn't find that task to update.",
          celebrationTip: 'Check your task list to see what needs your attention! 🔍'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '✏️ Task updated successfully! Your task list is looking great!',
        data: updatedTask,
        celebrationTip: 'Keeping your tasks current shows excellent organization skills! 🚀'
      });
    } catch (error) {
      logger.error('Error updating task', { error: error instanceof Error ? error.message : error, taskId: req.params.id, body: req.body });
      res.status(500).json({
        success: false,
        error: 'Oops! Something went wrong updating your task. Please try again.',
        celebrationTip: 'Your task details are safely stored - just a temporary hiccup! 💪'
      });
    }
  }

  /**
   * Delete a task
   * DELETE /api/v1/tasks/:id
   */
  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if task exists
      const existingTask = await this.taskRepository.findById(id);
      if (!existingTask) {
        res.status(404).json({
          success: false,
          error: "Hmm, I couldn't find that task to delete.",
          celebrationTip: 'Check your task list to see what needs your attention! 🔍'
        });
        return;
      }

      const success = await this.taskRepository.delete(id);

      if (!success) {
        res.status(500).json({
          success: false,
          error: 'Oops! Something went wrong deleting your task. Please try again.',
          celebrationTip: 'Your task management journey continues - just a small bump! 💪'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '🗑️ Task deleted successfully! One less thing on your plate!',
        celebrationTip: 'Decluttering your task list keeps you focused on what matters! 🌟'
      });
    } catch (error) {
      logger.error('Error deleting task', { error, taskId: req.params.id });
      res.status(500).json({
        success: false,
        error: 'Oops! Something went wrong deleting your task. Please try again.',
        celebrationTip: 'Your task management journey continues - just a small bump! 💪'
      });
    }
  }

  /**
   * Complete a task
   * POST /api/v1/tasks/:id/complete
   */
  async completeTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const completedTask = await this.taskRepository.completeTask(id);

      // Generate celebration message with time comparison
      let celebrationMessage = '🎉 Task completed! You\'re making great progress!';
      let celebrationTip = 'Every completed task brings you closer to your goals! 🚀';

      if (completedTask.estimatedMinutes && completedTask.actualMinutes) {
        const estimated = completedTask.estimatedMinutes;
        const actual = completedTask.actualMinutes;

        if (actual <= estimated) {
          const saved = estimated - actual;
          celebrationMessage = `🎉 Task completed in ${actual}m! Estimated ${estimated}m, saved ${saved}m - Great time management! ⚡`;
        } else {
          celebrationMessage = `🎉 Task completed in ${actual}m! Took a bit longer than the ${estimated}m estimate, but you got it done! 💪`;
        }
      } else if (completedTask.actualMinutes) {
        celebrationMessage = `🎉 Task completed in ${completedTask.actualMinutes}m! Excellent work! ✨`;
      }

      res.status(200).json({
        success: true,
        message: celebrationMessage,
        data: completedTask,
        celebrationTip
      });
    } catch (error) {
      logger.error('Error completing task', { error, taskId: req.params.id });

      // Check if it's a "Task not found" error
      if (error instanceof Error && error.message === 'Task not found') {
        res.status(404).json({
          success: false,
          error: "Hmm, I couldn't find that task to complete.",
          celebrationTip: 'Check your task list to see what needs your attention! 🔍'
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Oops! Something went wrong completing your task. Please try again.',
        celebrationTip: 'Your progress is safely tracked - just a temporary hiccup! 🌟'
      });
    }
  }
}