/**
 * Tests for Task API endpoints
 * Comprehensive testing of all CRUD operations with celebration-focused messaging
 */

import request from 'supertest';
import { initializeApp } from '../../src/index';

describe('Task API Endpoints', () => {
  const app = initializeApp();
  let testTaskId: string;

  describe('POST /api/v1/tasks', () => {
    it('should create a new task with title only', async () => {
      const taskData = {
        title: 'Test task creation'
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('🎉 Task created successfully!'),
        data: {
          title: taskData.title,
          description: null,
          estimatedMinutes: null,
          isCompleted: false,
          completedAt: null,
          actualMinutes: null
        },
        celebrationTip: expect.stringContaining('Every task added is a step toward your goals!')
      });

      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      testTaskId = response.body.data.id;
    });

    it('should create a new task with all fields', async () => {
      const taskData = {
        title: 'Complete API development',
        description: 'Implement REST API with celebration messaging',
        estimatedMinutes: 120
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.data).toMatchObject({
        title: taskData.title,
        description: taskData.description,
        estimatedMinutes: taskData.estimatedMinutes,
        isCompleted: false
      });
    });

    it('should return validation error for empty title', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({ title: '' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Task title is required and cannot be empty.',
        celebrationTip: expect.stringContaining('Give your task a clear, descriptive title')
      });
    });

    it('should return validation error for title too long', async () => {
      const longTitle = 'a'.repeat(201);
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({ title: longTitle })
        .expect(400);

      expect(response.body.error).toContain('Task title must be 200 characters or less');
    });

    it('should return validation error for invalid estimated minutes', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({
          title: 'Test task',
          estimatedMinutes: 1500 // Over 24 hours limit
        })
        .expect(400);

      expect(response.body.error).toContain('Estimated minutes must be between 1 and 1440');
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should retrieve all tasks', async () => {
      const response = await request(app)
        .get('/api/v1/tasks')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('🎯 Found'),
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            createdAt: expect.any(String)
          })
        ]),
        count: expect.any(Number)
      });
    });

    it('should filter pending tasks', async () => {
      const response = await request(app)
        .get('/api/v1/tasks?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ isCompleted: false })
        ])
      );
    });

    it('should filter completed tasks', async () => {
      const response = await request(app)
        .get('/api/v1/tasks?status=completed')
        .expect(200);

      expect(response.body.success).toBe(true);
      // May be empty if no completed tasks exist
      response.body.data.forEach((task: any) => {
        expect(task.isCompleted).toBe(true);
      });
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should retrieve a specific task', async () => {
      const response = await request(app)
        .get(`/api/v1/tasks/${testTaskId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: '✅ Task found!',
        data: {
          id: testTaskId,
          title: 'Test task creation'
        }
      });
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/v1/tasks/${nonExistentId}`)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: "Hmm, I couldn't find that task.",
        celebrationTip: expect.stringContaining('Check your task list')
      });
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should update a task title', async () => {
      const updateData = {
        title: 'Updated task title'
      };

      const response = await request(app)
        .put(`/api/v1/tasks/${testTaskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('✏️ Task updated successfully!'),
        data: {
          id: testTaskId,
          title: updateData.title
        },
        celebrationTip: expect.stringContaining('excellent organization skills')
      });
    });

    it('should update task estimate', async () => {
      // Create a task for this specific test to ensure it exists
      const createResponse = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Task for estimate update test' });
      const taskId = createResponse.body.data.id;

      const updateData = {
        estimatedMinutes: 60
      };

      const response = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.estimatedMinutes).toBe(60);
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/v1/tasks/${nonExistentId}`)
        .send({ title: 'New title' })
        .expect(404);

      expect(response.body.error).toContain("couldn't find that task to update");
    });

    it('should return validation error for empty title', async () => {
      const response = await request(app)
        .put(`/api/v1/tasks/${testTaskId}`)
        .send({ title: '' })
        .expect(400);

      expect(response.body.error).toContain('Task title cannot be empty');
    });
  });

  describe('POST /api/v1/tasks/:id/complete', () => {
    it('should complete a task', async () => {
      const response = await request(app)
        .post(`/api/v1/tasks/${testTaskId}/complete`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('🎉 Task completed!'),
        data: {
          id: testTaskId,
          isCompleted: true,
          completedAt: expect.any(String),
          actualMinutes: expect.any(Number)
        },
        celebrationTip: expect.stringContaining('Every completed task brings you closer')
      });
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/api/v1/tasks/${nonExistentId}/complete`)
        .expect(404);

      expect(response.body.error).toContain("couldn't find that task to complete");
    });

    it('should not allow editing completed task', async () => {
      const response = await request(app)
        .put(`/api/v1/tasks/${testTaskId}`)
        .send({ title: 'Try to update completed task' })
        .expect(400);

      expect(response.body.error).toContain('This completed task is locked in');
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    let taskToDeleteId: string;

    beforeEach(async () => {
      // Create a task specifically for deletion testing
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Task to be deleted' });
      taskToDeleteId = response.body.data.id;
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/v1/tasks/${taskToDeleteId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('🗑️ Task deleted successfully!'),
        celebrationTip: expect.stringContaining('Decluttering your task list')
      });

      // Verify task is actually deleted
      await request(app)
        .get(`/api/v1/tasks/${taskToDeleteId}`)
        .expect(404);
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/v1/tasks/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toContain("couldn't find that task to delete");
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining("The endpoint GET /api/v1/nonexistent doesn't exist"),
        availableEndpoints: expect.arrayContaining([
          'GET /api/v1/tasks',
          'POST /api/v1/tasks'
        ])
      });
    });

    it('should handle JSON parsing errors', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      // Express automatically handles JSON parsing errors
      expect(response.status).toBe(400);
    });
  });
});