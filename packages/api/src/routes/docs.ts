/**
 * API Documentation Route
 * Serves OpenAPI documentation for the REST API
 */

import { Router } from 'express';

const router = Router();

/**
 * OpenAPI specification for the Intelligent Todo API
 * Generated from TypeScript interfaces with celebration-focused messaging
 */
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Intelligent Todo API',
    version: '1.0.0',
    description: '🎉 A celebration-focused task management API that keeps you motivated!',
    contact: {
      name: 'API Support',
      url: 'https://github.com/your-org/intelligent-todo'
    }
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Production server'
    }
  ],
  paths: {
    '/tasks': {
      get: {
        summary: '🎯 Get all tasks',
        description: 'Retrieve all tasks with optional filtering by completion status',
        parameters: [
          {
            name: 'status',
            in: 'query',
            description: 'Filter tasks by completion status',
            required: false,
            schema: {
              type: 'string',
              enum: ['pending', 'completed', 'all'],
              default: 'all'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Tasks retrieved successfully with celebration message',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskListResponse' }
              }
            }
          },
          '500': {
            description: 'Server error with encouragement',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      post: {
        summary: '✨ Create a new task',
        description: 'Create a new task with celebration-focused response',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskCreate' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Task created successfully with celebration message',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskResponse' }
              }
            }
          },
          '400': {
            description: 'Validation error with helpful tips',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '500': {
            description: 'Server error with encouragement',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/tasks/{id}': {
      get: {
        summary: '🔍 Get a specific task',
        description: 'Retrieve a single task by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'Task UUID or short ID',
            required: true,
            schema: {
              type: 'string',
              example: 'abc123 or 123e4567-e89b-12d3-a456-426614174000'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Task found successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskResponse' }
              }
            }
          },
          '404': {
            description: 'Task not found with helpful suggestion',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      put: {
        summary: '✏️ Update a task',
        description: 'Update an existing task (cannot update completed tasks)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'Task UUID or short ID',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskUpdateRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Task updated successfully with celebration',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskResponse' }
              }
            }
          },
          '400': {
            description: 'Validation error or completed task edit attempt',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        summary: '🗑️ Delete a task',
        description: 'Permanently delete a task',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'Task UUID or short ID',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Task deleted successfully with celebration',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/tasks/{id}/complete': {
      post: {
        summary: '🎉 Complete a task',
        description: 'Mark a task as completed with time tracking and celebration',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'Task UUID or short ID',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Task completed successfully with celebration and time comparison',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskResponse' }
              }
            }
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Task: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique task identifier (UUID)',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          title: {
            type: 'string',
            description: 'Task title (1-200 characters)',
            example: 'Complete API documentation',
            minLength: 1,
            maxLength: 200
          },
          description: {
            type: ['string', 'null'],
            description: 'Detailed task description (max 1000 characters)',
            example: 'Create comprehensive OpenAPI documentation',
            maxLength: 1000
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Task creation timestamp',
            example: '2025-09-29T10:30:00.000Z'
          },
          completedAt: {
            type: ['string', 'null'],
            format: 'date-time',
            description: 'Task completion timestamp',
            example: '2025-09-29T12:15:00.000Z'
          },
          estimatedMinutes: {
            type: ['number', 'null'],
            description: 'Estimated time in minutes (1-1440)',
            example: 60,
            minimum: 1,
            maximum: 1440
          },
          actualMinutes: {
            type: ['number', 'null'],
            description: 'Actual time taken in minutes',
            example: 45
          },
          isCompleted: {
            type: 'boolean',
            description: 'Task completion status',
            example: false
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Task tags for organization',
            example: ['work', 'documentation']
          }
        },
        required: ['id', 'title', 'createdAt', 'isCompleted']
      },
      TaskCreate: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Task title (1-200 characters)',
            example: 'Complete API documentation',
            minLength: 1,
            maxLength: 200
          },
          description: {
            type: ['string', 'null'],
            description: 'Detailed task description (max 1000 characters)',
            example: 'Create comprehensive OpenAPI documentation',
            maxLength: 1000
          },
          estimatedMinutes: {
            type: ['number', 'null'],
            description: 'Estimated time in minutes (1-1440)',
            example: 60,
            minimum: 1,
            maximum: 1440
          }
        },
        required: ['title']
      },
      TaskUpdateRequest: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Updated task title (1-200 characters)',
            example: 'Updated API documentation',
            minLength: 1,
            maxLength: 200
          },
          description: {
            type: ['string', 'null'],
            description: 'Updated task description (max 1000 characters)',
            example: 'Updated comprehensive OpenAPI documentation',
            maxLength: 1000
          },
          estimatedMinutes: {
            type: ['number', 'null'],
            description: 'Updated estimated time in minutes (1-1440)',
            example: 90,
            minimum: 1,
            maximum: 1440
          }
        }
      },
      TaskResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            description: 'Celebration-focused success message',
            example: '🎉 Task created successfully! You\'re building momentum!'
          },
          data: {
            $ref: '#/components/schemas/Task'
          },
          celebrationTip: {
            type: 'string',
            description: 'Motivational tip for the user',
            example: 'Every task added is a step toward your goals! 🚀'
          }
        },
        required: ['success', 'message', 'data']
      },
      TaskListResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            description: 'Celebration-focused success message',
            example: '🎯 Found 5 tasks!'
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Task'
            }
          },
          count: {
            type: 'number',
            description: 'Number of tasks returned',
            example: 5
          }
        },
        required: ['success', 'message', 'data', 'count']
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            description: 'Celebration-focused success message',
            example: '🗑️ Task deleted successfully! One less thing on your plate!'
          },
          celebrationTip: {
            type: 'string',
            description: 'Motivational tip for the user',
            example: 'Decluttering your task list keeps you focused on what matters! 🌟'
          }
        },
        required: ['success', 'message']
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            description: 'User-friendly error message',
            example: 'Task title is required and cannot be empty.'
          },
          celebrationTip: {
            type: 'string',
            description: 'Positive guidance for the user',
            example: 'Give your task a clear, descriptive title to stay organized! 📝'
          }
        },
        required: ['success', 'error']
      }
    }
  }
};

/**
 * Serve OpenAPI specification as JSON
 * GET /api/docs/openapi.json
 */
router.get('/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});

/**
 * Serve interactive API documentation
 * GET /api/docs
 */
router.get('/', (_req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎉 Intelligent Todo API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        .swagger-ui .topbar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .swagger-ui .topbar .download-url-wrapper {
            display: none;
        }
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2rem;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Intelligent Todo API</h1>
        <p>A celebration-focused task management API that keeps you motivated!</p>
    </div>
    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script>
        SwaggerUIBundle({
            url: '/api/docs/openapi.json',
            dom_id: '#swagger-ui',
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
            ],
            layout: 'BaseLayout',
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
            docExpansion: 'list',
            tryItOutEnabled: true,
            supportedSubmitMethods: ['get', 'post', 'put', 'delete'],
            validatorUrl: null
        });
    </script>
</body>
</html>
  `;

  res.send(html);
});

export { router as docsRouter };