/**
 * Tests for API Documentation endpoints
 */

import request from 'supertest';
import { initializeApp } from '../../src/index';

describe('API Documentation', () => {
  const app = initializeApp();

  describe('GET /api/docs', () => {
    it('should serve interactive API documentation', async () => {
      const response = await request(app)
        .get('/api/docs')
        .expect(200)
        .expect('Content-Type', /html/);

      expect(response.text).toContain('🎉 Intelligent Todo API');
      expect(response.text).toContain('swagger-ui');
      expect(response.text).toContain('celebration-focused task management');
    });
  });

  describe('GET /api/docs/openapi.json', () => {
    it('should serve OpenAPI specification as JSON', async () => {
      const response = await request(app)
        .get('/api/docs/openapi.json')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        openapi: '3.0.0',
        info: {
          title: 'Intelligent Todo API',
          version: '1.0.0',
          description: expect.stringContaining('celebration-focused')
        },
        paths: expect.objectContaining({
          '/tasks': expect.any(Object),
          '/tasks/{id}': expect.any(Object),
          '/tasks/{id}/complete': expect.any(Object)
        }),
        components: expect.objectContaining({
          schemas: expect.objectContaining({
            Task: expect.any(Object),
            TaskCreate: expect.any(Object),
            TaskResponse: expect.any(Object),
            ErrorResponse: expect.any(Object)
          })
        })
      });
    });

    it('should include celebration-focused schema examples', async () => {
      const response = await request(app)
        .get('/api/docs/openapi.json')
        .expect(200);

      const { components } = response.body;

      // Check Task schema has proper structure
      expect(components.schemas.Task.properties).toMatchObject({
        id: expect.objectContaining({ type: 'string' }),
        title: expect.objectContaining({
          type: 'string',
          minLength: 1,
          maxLength: 200
        }),
        isCompleted: expect.objectContaining({ type: 'boolean' }),
        estimatedMinutes: expect.objectContaining({
          type: ['number', 'null'],
          minimum: 1,
          maximum: 1440
        })
      });

      // Check TaskResponse includes celebration messaging
      expect(components.schemas.TaskResponse.properties).toMatchObject({
        success: expect.objectContaining({ type: 'boolean' }),
        message: expect.objectContaining({
          type: 'string',
          description: expect.stringContaining('Celebration-focused')
        }),
        celebrationTip: expect.objectContaining({
          type: 'string',
          description: expect.stringContaining('Motivational')
        })
      });
    });

    it('should include all API endpoints in paths', async () => {
      const response = await request(app)
        .get('/api/docs/openapi.json')
        .expect(200);

      const { paths } = response.body;

      // Check all CRUD operations are documented
      expect(paths['/tasks']).toHaveProperty('get');
      expect(paths['/tasks']).toHaveProperty('post');
      expect(paths['/tasks/{id}']).toHaveProperty('get');
      expect(paths['/tasks/{id}']).toHaveProperty('put');
      expect(paths['/tasks/{id}']).toHaveProperty('delete');
      expect(paths['/tasks/{id}/complete']).toHaveProperty('post');

      // Check celebration emojis in summaries
      expect(paths['/tasks'].get.summary).toContain('🎯');
      expect(paths['/tasks'].post.summary).toContain('✨');
      expect(paths['/tasks/{id}'].get.summary).toContain('🔍');
      expect(paths['/tasks/{id}'].put.summary).toContain('✏️');
      expect(paths['/tasks/{id}'].delete.summary).toContain('🗑️');
      expect(paths['/tasks/{id}/complete'].post.summary).toContain('🎉');
    });

    it('should include proper HTTP status codes and responses', async () => {
      const response = await request(app)
        .get('/api/docs/openapi.json')
        .expect(200);

      const createTaskPath = response.body.paths['/tasks'].post;

      // Check success and error responses are documented
      expect(createTaskPath.responses).toMatchObject({
        '201': expect.objectContaining({
          description: expect.stringContaining('celebration'),
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskResponse' }
            }
          }
        }),
        '400': expect.objectContaining({
          description: expect.stringContaining('helpful'),
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }),
        '500': expect.objectContaining({
          description: expect.stringContaining('encouragement')
        })
      });
    });
  });
});