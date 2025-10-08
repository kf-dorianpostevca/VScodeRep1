/**
 * Task List Component
 * Displays filtered list of tasks with real-time updates
 */

import { Task } from '../services/TaskApiService';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onUpdateTask: (id: string, data: any) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onCompleteTask: (id: string) => Promise<void>;
  filter: 'all' | 'pending' | 'completed';
}

/**
 * Task list component with filtering and real-time updates
 */
export function TaskList({
  tasks,
  loading,
  onUpdateTask,
  onDeleteTask,
  onCompleteTask,
  filter
}: TaskListProps): JSX.Element {
  /**
   * Get filtered tasks based on current filter
   */
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return !task.isCompleted;
      case 'completed':
        return task.isCompleted;
      default:
        return true;
    }
  });

  /**
   * Get filter status text
   */
  const getFilterStatusText = (): string => {
    const pendingCount = tasks.filter(t => !t.isCompleted).length;
    const completedCount = tasks.filter(t => t.isCompleted).length;
    const totalCount = tasks.length;

    switch (filter) {
      case 'pending':
        return `${pendingCount} pending task${pendingCount !== 1 ? 's' : ''}`;
      case 'completed':
        return `${completedCount} completed task${completedCount !== 1 ? 's' : ''}`;
      default:
        return `${totalCount} total task${totalCount !== 1 ? 's' : ''} (${pendingCount} pending, ${completedCount} completed)`;
    }
  };

  /**
   * Get empty state message
   */
  const getEmptyStateMessage = (): { title: string; message: string; emoji: string } => {
    switch (filter) {
      case 'pending':
        return {
          emoji: '🎉',
          title: 'No pending tasks!',
          message: 'Great job! You\'ve completed everything on your list. Time to add some new goals!'
        };
      case 'completed':
        return {
          emoji: '💪',
          title: 'No completed tasks yet',
          message: 'Start completing some tasks to see your accomplishments here!'
        };
      default:
        return {
          emoji: '🚀',
          title: 'No tasks yet',
          message: 'Ready to be productive? Create your first task and start achieving your goals!'
        };
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-blue-600 font-medium">Loading your tasks...</span>
        </div>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    const emptyState = getEmptyStateMessage();
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="text-6xl mb-4">{emptyState.emoji}</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {emptyState.title}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {emptyState.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Task Count Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <span className="mr-2">📋</span>
          Your Tasks
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {getFilterStatusText()}
          </span>
          {loading && (
            <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-0">
        {filteredTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onComplete={onCompleteTask}
          />
        ))}
      </div>

      {/* Progress Indicator */}
      {tasks.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {tasks.filter(t => t.isCompleted).length} of {tasks.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${tasks.length === 0 ? 0 : (tasks.filter(t => t.isCompleted).length / tasks.length) * 100}%`
              }}
            ></div>
          </div>
          {tasks.filter(t => t.isCompleted).length === tasks.length && tasks.length > 0 && (
            <div className="text-center mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                🎉 All tasks completed! Amazing work!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}