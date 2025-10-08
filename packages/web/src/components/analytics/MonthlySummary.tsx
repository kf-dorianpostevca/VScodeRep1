/**
 * Monthly Summary Component
 * Displays comprehensive monthly analytics with celebration-focused messaging
 */

import { MonthlySummaryBasic } from '../../services/AnalyticsApiService';
import { CompletionStats } from './CompletionStats';
import { ProductivityInsights } from './ProductivityInsights';
import { CompletionChart } from '../charts/CompletionChart';
import { ProgressMeter } from './ProgressMeter';

interface MonthlySummaryProps {
  summary: MonthlySummaryBasic;
  isCurrentMonth: boolean;
}

export function MonthlySummary({ summary, isCurrentMonth }: MonthlySummaryProps): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Celebration Message */}
      {summary.celebrationMessage && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg bg-green-200 mr-4">
              🎉
            </div>
            <div className="flex-1">
              <p className="text-lg font-medium text-gray-900 mb-2">
                {summary.celebrationMessage}
              </p>
              {isCurrentMonth && (
                <p className="text-sm text-gray-600">
                  💡 Keep up the amazing momentum - you're building great habits!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Stats */}
        <CompletionStats summary={summary} />

        {/* Progress Meter */}
        <ProgressMeter summary={summary} />
      </div>

      {/* Productivity Insights */}
      <ProductivityInsights summary={summary} />

      {/* Completion Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📈</span>
            Daily Completion Pattern
          </h3>
          <button
            onClick={() => window.print()}
            className="px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Print analytics"
          >
            🖨️ Print
          </button>
        </div>
        <CompletionChart data={summary.dailyCompletions} />
      </div>

      {/* Month-over-Month Trend */}
      {summary.monthlyTrend.previousMonth > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Month-over-Month Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                {summary.monthlyTrend.previousMonth.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Previous Month</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {summary.completionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-600">This Month</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className={`text-2xl font-bold ${
                summary.monthlyTrend.improvement >= 0 ? 'text-green-700' : 'text-orange-700'
              }`}>
                {summary.monthlyTrend.improvement >= 0 ? '+' : ''}
                {summary.monthlyTrend.improvement.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                {summary.monthlyTrend.improvement >= 0 ? '📈 Improvement' : '📉 Change'}
              </div>
            </div>
          </div>
          {summary.monthlyTrend.improvement >= 0 && (
            <div className="mt-4 text-center">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                🎯 {summary.monthlyTrend.improvement >= 10 ? 'Excellent' : 'Great'} improvement from last month!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Export Actions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            📋 Want to keep a record of your progress?
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              🖨️ Print Summary
            </button>
            <button
              onClick={() => {
                const text = `Monthly Summary - ${summary.month}\n\nTotal Tasks: ${summary.totalTasks}\nCompleted: ${summary.completedTasks}\nCompletion Rate: ${summary.completionRate.toFixed(1)}%\n\n${summary.celebrationMessage || ''}`;
                navigator.clipboard.writeText(text);
              }}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              📄 Copy Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}