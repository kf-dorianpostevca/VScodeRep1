# REST API Spec

```yaml
openapi: 3.0.0
info:
  title: Intelligent Todo Application API
  version: 1.0.0
  description: |
    REST API providing identical functionality to CLI interface for celebration-focused
    productivity tracking with intelligent time estimation learning.

servers:
  - url: http://localhost:3000/api/v1
    description: Local development server
  - url: https://todo-app.vercel.app/api/v1
    description: Production server

paths:
  /tasks:
    get:
      summary: List tasks with filtering options
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, completed, all]
            default: pending
      responses:
        200:
          description: Tasks retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  tasks:
                    type: array
                    items:
                      $ref: '#/components/schemas/Task'

    post:
      summary: Create new task
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title]
              properties:
                title:
                  type: string
                  maxLength: 200
                estimatedMinutes:
                  type: integer
                  minimum: 1
                  maximum: 1440
      responses:
        201:
          description: Task created successfully

  /tasks/{taskId}/complete:
    post:
      summary: Mark task as completed
      responses:
        200:
          description: Task completed with celebration message
          content:
            application/json:
              schema:
                type: object
                properties:
                  task:
                    $ref: '#/components/schemas/Task'
                  celebrationMessage:
                    type: string

  /analytics/monthly:
    get:
      summary: Get monthly summary
      parameters:
        - name: month
          in: query
          schema:
            type: string
            pattern: '^\d{4}-\d{2}$'
      responses:
        200:
          description: Monthly summary retrieved successfully

components:
  schemas:
    Task:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        createdAt:
          type: string
          format: date-time
        completedAt:
          type: string
          format: date-time
          nullable: true
        estimatedMinutes:
          type: integer
          nullable: true
        isCompleted:
          type: boolean
```
