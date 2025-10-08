/**
 * Task API Service
 * Handles all communication with the REST API backend
 * Provides celebration-focused responses and error handling
 */

export interface Task {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  completedAt: string | null;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  isCompleted: boolean;
  tags: string[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  estimatedMinutes?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  estimatedMinutes?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  celebrationTip?: string;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  count: number;
}

export interface ApiError {
  success: false;
  error: string;
  celebrationTip?: string;
}

/**
 * Task API Service class
 * Handles all REST API communication with celebration-focused messaging
 */
export class TaskApiService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all tasks with optional status filtering
   */
  async getTasks(status?: 'pending' | 'completed' | 'all'): Promise<Task[]> {
    const url = status ? `${this.baseUrl}/tasks?status=${status}` : `${this.baseUrl}/tasks`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const result: ApiListResponse<Task> = await response.json();
    return result.data;
  }

  /**
   * Get a specific task by ID
   */
  async getTask(id: string): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const result: ApiResponse<Task> = await response.json();
    return result.data;
  }

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskRequest): Promise<{ task: Task; message: string; celebrationTip?: string }> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const result: ApiResponse<Task> = await response.json();
    return {
      task: result.data,
      message: result.message,
      celebrationTip: result.celebrationTip
    };
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, data: UpdateTaskRequest): Promise<{ task: Task; message: string; celebrationTip?: string }> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const result: ApiResponse<Task> = await response.json();
    return {
      task: result.data,
      message: result.message,
      celebrationTip: result.celebrationTip
    };
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<{ message: string; celebrationTip?: string }> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const result: Omit<ApiResponse<null>, 'data'> = await response.json();
    return {
      message: result.message,
      celebrationTip: result.celebrationTip
    };
  }

  /**
   * Mark a task as completed
   */
  async completeTask(id: string): Promise<{ task: Task; message: string; celebrationTip?: string }> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const result: ApiResponse<Task> = await response.json();
    return {
      task: result.data,
      message: result.message,
      celebrationTip: result.celebrationTip
    };
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private async handleError(response: Response): Promise<Error> {
    try {
      const errorResult: ApiError = await response.json();
      const error = new Error(errorResult.error || 'Something went wrong');
      // Add celebration tip as a property for UI to display
      (error as any).celebrationTip = errorResult.celebrationTip;
      return error;
    } catch {
      // If response isn't JSON, create generic error
      const error = new Error(`Request failed with status ${response.status}`);
      (error as any).celebrationTip = 'Please try again - we\'re here to help! 🌟';
      return error;
    }
  }
}

// Default instance
export const taskApiService = new TaskApiService();