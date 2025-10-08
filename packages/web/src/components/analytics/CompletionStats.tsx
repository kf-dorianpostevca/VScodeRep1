/**
 * Completion Stats Component
 * Displays key completion statistics with celebration-focused design
 */

import { MonthlySummaryBasic } from '../../services/AnalyticsApiService';

interface CompletionStatsProps {
  summary: MonthlySummaryBasic;
}

export function CompletionStats({ summary }: CompletionStatsProps): JSX.Element {
  const getCompletionIcon = (rate: number): string => {
    if (rate >= 90) return '🏆';
    if (rate >= 70) return '🌟';
    if (rate >= 50) return '💪';
    if (rate > 0) return '🚀';
    return '📋';
  };

  const getCompletionColor = (rate: number): string => {
    if (rate >= 90) return 'text-green-700';
    if (rate >= 70) return 'text-blue-700';
    if (rate >= 50) return 'text-indigo-700';
    return 'text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">📊</span>
        Completion Statistics
      </h3>

      <div className="space-y-4">
        {/* Completion Rate */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <span className="text-3xl mr-2">{getCompletionIcon(summary.completionRate)}</span>
            <span className={`text-3xl font-bold ${getCompletionColor(summary.completionRate)}`}>
              {summary.completionRate.toFixed(1)}%
            </span>
          </div>
          <div className="text-sm font-medium text-gray-700">Completion Rate</div>
        </div>

        {/* Task Counts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{summary.totalTasks}</div>
            <div className="text-xs text-blue-600">Total Tasks</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{summary.completedTasks}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
        </div>

        {/* Remaining Tasks */}
        {summary.totalTasks - summary.completedTasks > 0 && (
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-700">
              {summary.totalTasks - summary.completedTasks}
            </div>
            <div className="text-xs text-orange-600">Still to Complete</div>
          </div>
        )}
      </div>
    </div>
  );
}