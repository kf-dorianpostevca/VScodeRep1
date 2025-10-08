/**
 * Month Navigator Component
 * Navigation interface for browsing historical analytics data
 */

import { AnalyticsApiService } from '../../services/AnalyticsApiService';

interface MonthNavigatorProps {
  selectedYear: number;
  selectedMonth: number;
  onMonthChange: (year: number, month: number) => void;
  loading: boolean;
}

export function MonthNavigator({ selectedYear, selectedMonth, onMonthChange, loading }: MonthNavigatorProps): JSX.Element {
  const availableMonths = AnalyticsApiService.getAvailableMonths();
  const currentMonthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const handlePreviousMonth = () => {
    const currentIndex = availableMonths.findIndex(m => m.key === currentMonthKey);
    if (currentIndex < availableMonths.length - 1) {
      const nextMonth = availableMonths[currentIndex + 1];
      onMonthChange(nextMonth.year, nextMonth.month);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = availableMonths.findIndex(m => m.key === currentMonthKey);
    if (currentIndex > 0) {
      const prevMonth = availableMonths[currentIndex - 1];
      onMonthChange(prevMonth.year, prevMonth.month);
    }
  };

  const canGoPrevious = () => {
    const currentIndex = availableMonths.findIndex(m => m.key === currentMonthKey);
    return currentIndex < availableMonths.length - 1;
  };

  const canGoNext = () => {
    const currentIndex = availableMonths.findIndex(m => m.key === currentMonthKey);
    return currentIndex > 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between">
        {/* Previous Month Button */}
        <button
          onClick={handlePreviousMonth}
          disabled={!canGoPrevious() || loading}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous month"
        >
          <span className="text-lg mr-2">←</span>
          <span className="text-sm">Previous</span>
        </button>

        {/* Current Month Display */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {AnalyticsApiService.formatMonthDisplay(currentMonthKey)}
          </h2>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            {AnalyticsApiService.isCurrentMonth(selectedYear, selectedMonth) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                📅 Current Month
              </span>
            )}
          </div>
        </div>

        {/* Next Month Button */}
        <button
          onClick={handleNextMonth}
          disabled={!canGoNext() || loading}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next month"
        >
          <span className="text-sm mr-2">Next</span>
          <span className="text-lg">→</span>
        </button>
      </div>

      {/* Month Selector Dropdown */}
      <div className="mt-4 text-center">
        <select
          value={currentMonthKey}
          onChange={(e) => {
            const month = availableMonths.find(m => m.key === e.target.value);
            if (month) {
              onMonthChange(month.year, month.month);
            }
          }}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          disabled={loading}
        >
          {availableMonths.map((month) => (
            <option key={month.key} value={month.key}>
              {month.label}
              {AnalyticsApiService.isCurrentMonth(month.year, month.month) && ' (Current)'}
            </option>
          ))}
        </select>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="mt-4 text-center">
        <nav className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <span>📊 Analytics</span>
          <span>›</span>
          <span className="font-medium text-gray-700">
            {AnalyticsApiService.formatMonthDisplay(currentMonthKey)}
          </span>
        </nav>
      </div>
    </div>
  );
}