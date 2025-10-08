/**
 * Add Task Form Component
 * Form for creating new tasks with validation and celebration feedback
 */

import { useState, FormEvent } from 'react';
import { CreateTaskRequest } from '../services/TaskApiService';

interface AddTaskFormProps {
  onSubmit: (data: CreateTaskRequest) => Promise<void>;
  loading?: boolean;
}

/**
 * Form component for creating new tasks
 */
export function AddTaskForm({ onSubmit, loading = false }: AddTaskFormProps): JSX.Element {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    if (description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }

    if (estimatedMinutes) {
      const minutes = parseInt(estimatedMinutes);
      if (isNaN(minutes) || minutes < 1 || minutes > 1440) {
        newErrors.estimatedMinutes = 'Estimated time must be between 1 and 1440 minutes';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data: CreateTaskRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined
    };

    await onSubmit(data);

    // Reset form on success
    setTitle('');
    setDescription('');
    setEstimatedMinutes('');
    setErrors({});
  };

  /**
   * Parse time estimate input (support formats like "30m", "2h", "1h30m")
   */
  const parseTimeEstimate = (value: string): string => {
    if (!value) return '';

    // Remove spaces and convert to lowercase
    const cleanValue = value.replace(/\s/g, '').toLowerCase();

    // Match patterns like "30m", "2h", "1h30m"
    const hourMinuteMatch = cleanValue.match(/^(\d+)h(\d+)m$/);
    const hourMatch = cleanValue.match(/^(\d+)h$/);
    const minuteMatch = cleanValue.match(/^(\d+)m?$/);

    if (hourMinuteMatch) {
      const hours = parseInt(hourMinuteMatch[1]);
      const minutes = parseInt(hourMinuteMatch[2]);
      return String(hours * 60 + minutes);
    }

    if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      return String(hours * 60);
    }

    if (minuteMatch) {
      return minuteMatch[1];
    }

    return value;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">✨</span>
        Add New Task
      </h2>

      {/* Title Input */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="What would you like to accomplish?"
          maxLength={200}
          disabled={loading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {title.length}/200 characters
        </p>
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Add more details about this task..."
          rows={3}
          maxLength={1000}
          disabled={loading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {description.length}/1000 characters
        </p>
      </div>

      {/* Estimated Time Input */}
      <div className="mb-6">
        <label htmlFor="estimatedMinutes" className="block text-sm font-medium text-gray-700 mb-2">
          Estimated Time (optional)
        </label>
        <input
          type="text"
          id="estimatedMinutes"
          value={estimatedMinutes}
          onChange={(e) => setEstimatedMinutes(parseTimeEstimate(e.target.value))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.estimatedMinutes ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="30 (minutes) or 2h or 1h30m"
          disabled={loading}
        />
        {errors.estimatedMinutes && (
          <p className="mt-1 text-sm text-red-600">{errors.estimatedMinutes}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Enter time in minutes (30) or use formats like 2h, 1h30m
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
          loading || !title.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Task...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <span className="mr-2">🚀</span>
            Create Task
          </span>
        )}
      </button>
    </form>
  );
}