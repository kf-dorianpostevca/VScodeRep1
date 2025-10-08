/**
 * Progress Meter Component
 * Visual progress indicator with celebration animations
 */

import { MonthlySummaryBasic } from '../../services/AnalyticsApiService';

interface ProgressMeterProps {
  summary: MonthlySummaryBasic;
}

export function ProgressMeter({ summary }: ProgressMeterProps): JSX.Element {
  const completionRate = summary.completionRate;
  const isExcellent = completionRate >= 90;
  const isGood = completionRate >= 70;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">⚡</span>
        Progress Meter
      </h3>

      <div className="space-y-4">
        {/* Circular Progress */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={isExcellent ? "#10b981" : isGood ? "#3b82f6" : "#6366f1"}
              strokeWidth="2"
              strokeDasharray={`${completionRate}, 100`}
              strokeLinecap="round"
              className={`transition-all duration-500 ${isExcellent ? 'animate-pulse-success' : ''}`}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isExcellent ? 'text-green-700' : isGood ? 'text-blue-700' : 'text-indigo-700'}`}>
                {completionRate.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isExcellent
                ? 'bg-gradient-to-r from-green-400 to-green-600'
                : isGood
                ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                : 'bg-gradient-to-r from-indigo-400 to-indigo-600'
            }`}
            style={{ width: `${Math.min(completionRate, 100)}%` }}
          />
        </div>

        {/* Achievement Level */}
        <div className="text-center">
          {isExcellent && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              🏆 Excellence Level
            </div>
          )}
          {isGood && !isExcellent && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
              🌟 Strong Performance
            </div>
          )}
          {!isGood && completionRate > 0 && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
              💪 Building Momentum
            </div>
          )}
          {completionRate === 0 && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
              🚀 Ready to Start
            </div>
          )}
        </div>

        {/* Motivational Message */}
        <div className="text-center text-sm text-gray-600">
          {isExcellent && "Outstanding work! You're crushing your goals! 🎉"}
          {isGood && !isExcellent && "Great progress! Keep up the momentum! 📈"}
          {!isGood && completionRate > 0 && "Every step counts - you're building great habits! 💪"}
          {completionRate === 0 && "Ready to make progress? Start with one task! 🎯"}
        </div>
      </div>
    </div>
  );
}