/**
 * Tests for API application entry point
 */

import request from 'supertest';
import { initializeApp } from '../src/index';

describe('API Application', () => {
  const app = initializeApp();

  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      version: '1.0.0',
    });
    expect(response.body.timestamp).toBeDefined();
  });

  it('should respond to API root endpoint', async () => {
    const response = await request(app)
      .get('/api')
      .expect(200);

    expect(response.body).toMatchObject({
      message: '🎉 Welcome to intelligent-todo API!',
      version: '1.0.0',
      endpoints: ['/health', '/api'],
    });
  });

  it('should return 404 for unknown endpoints', async () => {
    await request(app)
      .get('/nonexistent')
      .expect(404);
  });
});