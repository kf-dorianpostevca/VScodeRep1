/**
 * Task Routes
 * Express router for task-related API endpoints
 * Provides REST API endpoints matching CLI functionality exactly
 */

import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';

const router = Router();
const taskController = new TaskController();

/**
 * Task CRUD Operations
 * All endpoints include celebration-focused messaging for positive user experience
 */

// GET /api/v1/tasks - List all tasks with optional filtering
// Query parameters: status=pending|completed|all
router.get('/', (req, res) => taskController.getTasks(req, res));

// GET /api/v1/tasks/:id - Get a specific task by ID
router.get('/:id', (req, res) => taskController.getTask(req, res));

// POST /api/v1/tasks - Create a new task
// Body: { title: string, description?: string, estimatedMinutes?: number }
router.post('/', (req, res) => taskController.createTask(req, res));

// PUT /api/v1/tasks/:id - Update an existing task
// Body: { title?: string, description?: string, estimatedMinutes?: number }
router.put('/:id', (req, res) => taskController.updateTask(req, res));

// DELETE /api/v1/tasks/:id - Delete a task
router.delete('/:id', (req, res) => taskController.deleteTask(req, res));

// POST /api/v1/tasks/:id/complete - Mark task as completed
router.post('/:id/complete', (req, res) => taskController.completeTask(req, res));

export { router as tasksRouter };