/**
 * Productivity Insights Component
 * Displays celebration-focused insights and motivational messaging
 */

import { MonthlySummaryBasic } from '../../services/AnalyticsApiService';

interface ProductivityInsightsProps {
  summary: MonthlySummaryBasic;
}

export function ProductivityInsights({ summary }: ProductivityInsightsProps): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">💡</span>
        Productivity Insights
      </h3>

      {summary.insights && summary.insights.length > 0 ? (
        <div className="space-y-3">
          {summary.insights.map((insight, index) => (
            <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 mr-3 text-sm">✨</span>
              <p className="text-sm text-blue-800 font-medium">{insight}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🌟</div>
          <p className="text-gray-600">
            Keep building momentum to unlock personalized insights!
          </p>
        </div>
      )}

      {/* Motivational Actions */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <div className="text-center">
          <h4 className="font-medium text-gray-900 mb-2">🎯 Keep Growing!</h4>
          <p className="text-sm text-gray-700 mb-3">
            Every completed task is a step toward your goals
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            📝 Add New Tasks
          </a>
        </div>
      </div>
    </div>
  );
}