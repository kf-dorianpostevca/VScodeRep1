/**
 * Analytics Page
 * Monthly summary and analytics dashboard with celebration-focused design
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnalyticsApiService, MonthlySummaryBasic } from '../services/AnalyticsApiService';
import { MonthlySummary } from '../components/analytics/MonthlySummary';
import { MonthNavigator } from '../components/analytics/MonthNavigator';

export function AnalyticsPage(): JSX.Element {
  const [summary, setSummary] = useState<MonthlySummaryBasic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  /**
   * Load analytics data for selected month
   */
  const loadAnalytics = async (year: number, month: number) => {
    setLoading(true);
    setError(null);

    try {
      let data: MonthlySummaryBasic;

      if (AnalyticsApiService.isCurrentMonth(year, month)) {
        data = await AnalyticsApiService.getCurrentMonthSummary();
      } else {
        data = await AnalyticsApiService.getHistoricalMonthSummary(year, month);
      }

      setSummary(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(errorMessage);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle month navigation
   */
  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  /**
   * Load initial data
   */
  useEffect(() => {
    loadAnalytics(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center"
                title="Back to Tasks"
              >
                <span className="text-xl">🏠</span>
                <span className="ml-2 text-sm font-medium">Tasks</span>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">📊</span>
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => loadAnalytics(selectedYear, selectedMonth)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Refresh analytics"
                disabled={loading}
              >
                {loading ? '⏳' : '🔄'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Month Navigator */}
        <MonthNavigator
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
          loading={loading}
        />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm bg-red-200 mr-3">
                ⚠️
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-800">Unable to load analytics data</p>
                <p className="text-sm mt-1 text-red-700">{error}</p>
                <button
                  onClick={() => loadAnalytics(selectedYear, selectedMonth)}
                  className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !summary && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-6 py-3 bg-blue-50 rounded-lg">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-blue-600 font-medium text-lg">Loading your analytics...</span>
            </div>
          </div>
        )}

        {/* Analytics Summary */}
        {summary && !loading && (
          <MonthlySummary
            summary={summary}
            isCurrentMonth={AnalyticsApiService.isCurrentMonth(selectedYear, selectedMonth)}
          />
        )}
      </main>
    </div>
  );
}

// Default export for lazy loading
export default AnalyticsPage;