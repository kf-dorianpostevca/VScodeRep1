/**
 * Completion Chart Component
 * Interactive daily completion chart using Recharts with celebration-focused styling
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useState } from 'react';

interface ChartDataPoint {
  date: string;
  completed: number;
}

interface CompletionChartProps {
  data: ChartDataPoint[];
}

export function CompletionChart({ data }: CompletionChartProps): JSX.Element {
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');

  // Format data for better display
  const chartData = data.map(point => ({
    ...point,
    day: new Date(point.date).getDate(),
    formattedDate: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Calculate chart insights
  const totalCompletions = data.reduce((sum, point) => sum + point.completed, 0);
  const maxDay = data.reduce((max, point) => point.completed > max.completed ? point : max, data[0]);
  const averagePerDay = totalCompletions / data.length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.formattedDate}</p>
          <p className="text-sm text-blue-600">
            🎯 {payload[0].value} task{payload[0].value !== 1 ? 's' : ''} completed
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              chartType === 'bar'
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Bar Chart
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              chartType === 'line'
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📈 Line Chart
          </button>
        </div>

        {/* Chart Insights */}
        <div className="text-right text-xs text-gray-600">
          <div>Total: {totalCompletions} completed</div>
          <div>Average: {averagePerDay.toFixed(1)}/day</div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="completed"
                fill="#3b82f6"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Summary */}
      {maxDay && maxDay.completed > 0 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center text-sm">
            <span className="mr-2">🏆</span>
            <span className="text-green-800">
              Best day: {new Date(maxDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              with {maxDay.completed} completion{maxDay.completed !== 1 ? 's' : ''}!
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalCompletions === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📈</div>
          <p>Complete some tasks to see your progress chart!</p>
        </div>
      )}
    </div>
  );
}