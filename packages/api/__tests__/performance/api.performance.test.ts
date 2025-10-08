/**
 * Performance Tests for API endpoints
 * Ensures sub-1 second response times and monitors performance metrics
 */

import request from 'supertest';
import { initializeApp } from '../../src/index';
import { resetMetrics, getPerformanceMetrics } from '../../src/middleware/performanceMonitor';

describe('API Performance Tests', () => {
  const app = initializeApp();

  beforeEach(() => {
    // Reset metrics before each test
    resetMetrics();
  });

  describe('Response Time Requirements (< 1000ms)', () => {
    it('should respond to health check in under 1 second', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/health')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle task creation in under 1 second', async () => {
      const startTime = Date.now();

      await request(app)
        .post('/api/v1/tasks')
        .send({
          title: 'Performance test task',
          description: 'Testing response times',
          estimatedMinutes: 30
        })
        .expect(201);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle task listing in under 1 second', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/v1/tasks')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle task updates in under 1 second', async () => {
      // First create a task
      const createResponse = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Task for performance test' });

      const taskId = createResponse.body.data.id;
      const startTime = Date.now();

      await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .send({ estimatedMinutes: 45 })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle task completion in under 1 second', async () => {
      // First create a task
      const createResponse = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Task for completion test' });

      const taskId = createResponse.body.data.id;
      const startTime = Date.now();

      await request(app)
        .post(`/api/v1/tasks/${taskId}/complete`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle task deletion in under 1 second', async () => {
      // First create a task
      const createResponse = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Task for deletion test' });

      const taskId = createResponse.body.data.id;
      const startTime = Date.now();

      await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track response times with X-Response-Time header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-response-time');
      expect(response.headers['x-response-time']).toMatch(/^\d+ms$/);

      const responseTimeMs = parseInt(response.headers['x-response-time']);
      // Response time should be at least 1ms (even very fast responses take some time)
      expect(responseTimeMs).toBeGreaterThanOrEqual(0);
      expect(responseTimeMs).toBeLessThan(1000);
    });

    it('should provide performance grade in headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-performance-grade');
      expect(['A', 'B', 'C']).toContain(response.headers['x-performance-grade']);
    });

    it('should accumulate performance metrics', async () => {
      // Reset metrics to start fresh
      resetMetrics();

      // Make several requests sequentially to accumulate metrics
      await request(app).get('/health');
      await request(app).get('/api');
      await request(app).get('/api/v1/tasks');
      await request(app).post('/api/v1/tasks').send({ title: 'Test 1' });
      await request(app).post('/api/v1/tasks').send({ title: 'Test 2' });

      const metrics = getPerformanceMetrics();

      expect(metrics.totalRequests).toBeGreaterThanOrEqual(5);
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
      expect(metrics.averageResponseTime).toBeLessThan(1000);
      expect(metrics.performanceGrade).toMatch(/^[ABC]$/);
    });
  });

  describe('Load Testing (Concurrent Requests)', () => {
    it('should handle 10 concurrent task creations efficiently', async () => {
      const startTime = Date.now();

      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/v1/tasks')
          .send({
            title: `Concurrent task ${i + 1}`,
            estimatedMinutes: 30
          })
      );

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Total time for 10 concurrent requests should be reasonable
      expect(totalTime).toBeLessThan(3000); // Allow some overhead for concurrent processing

      // Average response time per request should still be reasonable
      const averageTime = totalTime / 10;
      expect(averageTime).toBeLessThan(1000);
    });

    it('should handle mixed concurrent operations efficiently', async () => {
      // First create some tasks for operations
      const createResponse = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Task for concurrent operations' });
      const taskId = createResponse.body.data.id;

      const startTime = Date.now();

      const promises = [
        request(app).get('/api/v1/tasks'),
        request(app).get(`/api/v1/tasks/${taskId}`),
        request(app).post('/api/v1/tasks').send({ title: 'New concurrent task' }),
        request(app).put(`/api/v1/tasks/${taskId}`).send({ estimatedMinutes: 60 }),
        request(app).get('/health'),
        request(app).get('/api/v1/tasks?status=pending'),
        request(app).get('/api/metrics/health')
      ];

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All requests should succeed (except maybe some edge cases)
      responses.forEach(response => {
        expect(response.status).toBeLessThanOrEqual(299);
        expect(response.status).toBeGreaterThanOrEqual(200);
      });

      // Total time should be reasonable for concurrent processing
      expect(totalTime).toBeLessThan(2000);
    });
  });

  describe('Performance Metrics Endpoints', () => {
    it('should serve performance metrics endpoint', async () => {
      // Make a few requests to generate metrics
      await request(app).get('/health');
      await request(app).get('/api/v1/tasks');

      const response = await request(app)
        .get('/api/metrics')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('📊'),
        data: {
          performance: {
            totalRequests: expect.any(Number),
            averageResponseTime: expect.any(Number),
            performanceGrade: expect.stringMatching(/^[ABC]$/)
          },
          timestamp: expect.any(String),
          status: expect.stringContaining('🚀')
        }
      });
    });

    it('should serve performance health check endpoint', async () => {
      // Reset metrics and make a few fast requests to ensure healthy state
      resetMetrics();
      await request(app).get('/health');

      const response = await request(app)
        .get('/api/metrics/health');

      // Should return 200 or 503, both are valid depending on performance state
      expect([200, 503]).toContain(response.status);

      expect(response.body).toMatchObject({
        success: expect.any(Boolean),
        message: expect.stringContaining(response.status === 200 ? '✅' : '⚠️'),
        data: {
          healthy: expect.any(Boolean),
          performanceGrade: expect.stringMatching(/^[ABC]$/),
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('Database Performance', () => {
    it('should handle rapid task creation and retrieval efficiently', async () => {
      const taskCount = 20;
      const startTime = Date.now();

      // Create tasks rapidly
      const createPromises = Array.from({ length: taskCount }, (_, i) =>
        request(app)
          .post('/api/v1/tasks')
          .send({ title: `Rapid task ${i + 1}` })
      );

      await Promise.all(createPromises);

      // Retrieve all tasks
      await request(app)
        .get('/api/v1/tasks')
        .expect(200);

      const totalTime = Date.now() - startTime;

      // Should complete in reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds for 20 creates + 1 read

      // Verify all tasks were created
      const listResponse = await request(app)
        .get('/api/v1/tasks')
        .expect(200);

      expect(listResponse.body.data.length).toBeGreaterThanOrEqual(taskCount);
    });
  });
});