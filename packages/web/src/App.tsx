
/**
 * Main application component
 * Root component for the intelligent-todo web application with full task management
 */

import { useTasks } from './hooks/useTasks';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskList } from './components/TaskList';
import { TaskFilters } from './components/TaskFilters';
import { NotificationBanner } from './components/NotificationBanner';
import { OfflineIndicator } from './components/offline/OfflineIndicator';
import { InstallPrompt } from './components/InstallPrompt';
import { PWAUtils } from './utils/pwa';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function App(): JSX.Element {
  const {
    tasks,
    loading,
    error,
    celebrationMessage,
    celebrationTip,
    filter,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    setFilter,
    refreshTasks,
    clearMessages
  } = useTasks();

  // Calculate task counts for filters
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => !t.isCompleted).length,
    completed: tasks.filter(t => t.isCompleted).length
  };

  // Initialize PWA and keyboard shortcuts
  useEffect(() => {
    // Register service worker for PWA functionality
    PWAUtils.registerServiceWorker();

    // Track PWA usage
    PWAUtils.trackPWAUsage();

    // Handle quick task creation from PWA shortcut
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'new') {
      setTimeout(() => {
        const taskInput = document.querySelector('input[placeholder="What needs to be done?"]') as HTMLInputElement;
        if (taskInput) {
          taskInput.focus();
        }
      }, 500);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+N or Cmd+N: Focus on new task input
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        const taskInput = document.querySelector('input[placeholder="What needs to be done?"]') as HTMLInputElement;
        if (taskInput) {
          taskInput.focus();
        }
      }

      // Escape: Clear any focused input
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* PWA Components */}
      <OfflineIndicator />
      <InstallPrompt />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <div className="flex-1">
              <Link
                to="/analytics"
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors inline-flex items-center"
                title="View Analytics"
              >
                <span className="text-xl">📊</span>
                <span className="ml-2 text-sm font-medium">Analytics</span>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center flex-shrink-0">
              <span className="mr-3">🎯</span>
              Intelligent Todo
            </h1>
            <div className="flex-1 flex items-center justify-end space-x-4">
              <button
                onClick={refreshTasks}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Refresh tasks"
                disabled={loading}
              >
                {loading ? '⏳' : '🔄'}
              </button>
              <div className="text-sm text-gray-600">
                {taskCounts.completed > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                    🎉 {taskCounts.completed} completed!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Notifications */}
        {celebrationMessage && (
          <NotificationBanner
            type="success"
            message={celebrationMessage}
            celebrationTip={celebrationTip || undefined}
            onDismiss={clearMessages}
          />
        )}

        {error && (
          <NotificationBanner
            type="error"
            message={error}
            celebrationTip={celebrationTip || undefined}
            onDismiss={clearMessages}
          />
        )}

        {/* Add Task Form */}
        <AddTaskForm
          onSubmit={createTask}
          loading={loading}
        />

        {/* Task Filters */}
        <TaskFilters
          currentFilter={filter}
          onFilterChange={setFilter}
          taskCounts={taskCounts}
        />

        {/* Task List */}
        <TaskList
          tasks={tasks}
          loading={loading}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onCompleteTask={completeTask}
          filter={filter}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              🚀 Built with celebration-focused design to keep you motivated!
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs">
              <span>Keyboard shortcuts: Ctrl+N (new task)</span>
              <span>•</span>
              <Link to="/analytics" className="text-blue-600 hover:text-blue-800 underline">
                📊 View Analytics
              </Link>
              <span>•</span>
              <span>Made with ❤️ for productivity</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;