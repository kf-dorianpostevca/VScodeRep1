/**
 * Task Item Component
 * Individual task display with inline editing, completion, and deletion
 */

import { useState } from 'react';
import { Task, UpdateTaskRequest } from '../services/TaskApiService';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, data: UpdateTaskRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
}

/**
 * Individual task component with inline editing capabilities
 */
export function TaskItem({ task, onUpdate, onDelete, onComplete }: TaskItemProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editEstimatedMinutes, setEditEstimatedMinutes] = useState(
    task.estimatedMinutes ? String(task.estimatedMinutes) : ''
  );
  const [loading, setLoading] = useState(false);

  /**
   * Handle task completion
   */
  const handleComplete = async () => {
    setLoading(true);
    try {
      await onComplete(task.id);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle task deletion with confirmation
   */
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      try {
        await onDelete(task.id);
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Save edited task
   */
  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;

    setLoading(true);
    try {
      const updateData: UpdateTaskRequest = {
        title: editTitle.trim(),
        estimatedMinutes: editEstimatedMinutes ? parseInt(editEstimatedMinutes) : undefined
      };

      await onUpdate(task.id, updateData);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel editing
   */
  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditEstimatedMinutes(task.estimatedMinutes ? String(task.estimatedMinutes) : '');
    setIsEditing(false);
  };

  /**
   * Format time display
   */
  const formatTime = (minutes: number | null): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
  };

  /**
   * Format task creation time
   */
  const formatCreatedAt = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  /**
   * Get short task ID for display
   */
  const getShortId = (id: string): string => {
    return id.substring(0, 7);
  };

  if (isEditing && !task.isCompleted) {
    return (
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 p-4 mb-3">
        <div className="flex items-start space-x-3">
          <div className="flex-1 space-y-3">
            {/* Edit Title */}
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Task title"
              maxLength={200}
              disabled={loading}
            />

            {/* Edit Estimated Time */}
            <input
              type="text"
              value={editEstimatedMinutes}
              onChange={(e) => setEditEstimatedMinutes(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="30m"
              disabled={loading}
            />

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEdit}
                disabled={loading || !editTitle.trim()}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-300"
              >
                {loading ? '⏳' : '✅'} Save
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={loading}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 mb-3 transition-all ${
      task.isCompleted
        ? 'border-green-500 bg-green-50'
        : 'border-blue-500 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Task Header */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-mono text-gray-500">#{getShortId(task.id)}</span>
            {task.isCompleted && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✅ Completed
              </span>
            )}
          </div>

          {/* Task Title */}
          <h3 className={`text-lg font-medium mb-2 ${
            task.isCompleted ? 'line-through text-gray-600' : 'text-gray-900'
          }`}>
            {task.title}
          </h3>

          {/* Task Description */}
          {task.description && (
            <p className={`text-sm mb-3 ${
              task.isCompleted ? 'text-gray-500' : 'text-gray-700'
            }`}>
              {task.description}
            </p>
          )}

          {/* Task Meta Information */}
          <div className="flex flex-wrap items-center space-x-4 text-xs text-gray-500">
            <span>Created {formatCreatedAt(task.createdAt)}</span>

            {task.estimatedMinutes && (
              <span className="flex items-center">
                <span className="mr-1">⏱️</span>
                Estimated: {formatTime(task.estimatedMinutes)}
              </span>
            )}

            {task.actualMinutes && (
              <span className="flex items-center">
                <span className="mr-1">⏰</span>
                Actual: {formatTime(task.actualMinutes)}
                {task.estimatedMinutes && task.actualMinutes <= task.estimatedMinutes && (
                  <span className="ml-1 text-green-600">🎯</span>
                )}
              </span>
            )}

            {task.completedAt && (
              <span>Completed {formatCreatedAt(task.completedAt)}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 ml-4">
          {!task.isCompleted && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit task"
                disabled={loading}
              >
                ✏️
              </button>
              <button
                onClick={handleComplete}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                title="Mark as completed"
                disabled={loading}
              >
                {loading ? '⏳' : '✅'}
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete task"
            disabled={loading}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}