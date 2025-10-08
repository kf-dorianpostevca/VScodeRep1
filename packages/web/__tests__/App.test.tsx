/**
 * Tests for App component
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from '../src/App';

// Mock the API calls to prevent actual network requests during tests
jest.mock('../src/services/TaskApiService', () => ({
  taskApiService: {
    getTasks: jest.fn().mockResolvedValue([]),
    createTask: jest.fn().mockResolvedValue({ id: '1', title: 'Test', description: '', createdAt: new Date(), isCompleted: false }),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    completeTask: jest.fn(),
  }
}));

describe('App Component', () => {
  beforeEach(() => {
    // Clear all timers and mocks before each test
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('should render the main heading', async () => {
    await act(async () => {
      render(<App />);
    });

    const heading = screen.getByRole('heading', { name: /intelligent todo/i });
    expect(heading).toBeInTheDocument();
  });

  it('should display task form', async () => {
    await act(async () => {
      render(<App />);
    });

    const taskInput = screen.getByPlaceholderText(/what would you like to accomplish/i);
    expect(taskInput).toBeInTheDocument();
  });

  it('should show add new task heading', async () => {
    await act(async () => {
      render(<App />);
    });

    const addTaskHeading = screen.getByText(/add new task/i);
    expect(addTaskHeading).toBeInTheDocument();
  });
});