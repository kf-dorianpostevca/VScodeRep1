/**
 * Task Filters Component
 * Status filtering interface (pending/completed/all) matching CLI functionality
 */

interface TaskFiltersProps {
  currentFilter: 'all' | 'pending' | 'completed';
  onFilterChange: (filter: 'all' | 'pending' | 'completed') => void;
  taskCounts: {
    all: number;
    pending: number;
    completed: number;
  };
}

/**
 * Task filter component for status-based filtering
 */
export function TaskFilters({ currentFilter, onFilterChange, taskCounts }: TaskFiltersProps): JSX.Element {
  const filters = [
    {
      key: 'all' as const,
      label: 'All Tasks',
      icon: '📋',
      count: taskCounts.all,
      description: 'Show all tasks'
    },
    {
      key: 'pending' as const,
      label: 'Pending',
      icon: '⏳',
      count: taskCounts.pending,
      description: 'Show active tasks'
    },
    {
      key: 'completed' as const,
      label: 'Completed',
      icon: '✅',
      count: taskCounts.completed,
      description: 'Show finished tasks'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Tasks</h3>
      <div className="flex space-x-2">
        {filters.map(filter => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentFilter === filter.key
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
            }`}
            title={filter.description}
          >
            <span className="mr-2">{filter.icon}</span>
            <span>{filter.label}</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              currentFilter === filter.key
                ? 'bg-blue-200 text-blue-800'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Description */}
      <div className="mt-3 text-xs text-gray-500">
        {currentFilter === 'all' && 'Showing all tasks in your list'}
        {currentFilter === 'pending' && 'Showing tasks that need your attention'}
        {currentFilter === 'completed' && 'Showing your accomplishments'}
      </div>
    </div>
  );
}