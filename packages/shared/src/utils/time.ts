/**
 * Time calculation and parsing utilities
 * Handles duration calculations and time estimate parsing
 */

/**
 * Represents a duration in minutes
 */
export interface Duration {
  /** Duration in minutes */
  minutes: number;
  /** Human-readable format */
  display: string;
}

/**
 * Estimation accuracy data
 */
export interface EstimationAccuracy {
  /** Estimated duration in minutes */
  estimatedMinutes: number;
  /** Actual duration in minutes */
  actualMinutes: number;
  /** Accuracy as a percentage (100% = perfect estimate) */
  accuracyPercentage: number;
  /** Whether estimate was over or under actual time */
  estimationType: 'overestimate' | 'underestimate' | 'accurate';
}

/**
 * Calculates duration between two timestamps
 * @param startDate - Task creation timestamp
 * @param endDate - Task completion timestamp
 * @returns Duration object with minutes and display format
 */
export function calculateDuration(startDate: Date, endDate: Date): Duration {
  const diffMs = endDate.getTime() - startDate.getTime();
  const minutes = Math.max(1, Math.round(diffMs / (1000 * 60))); // Minimum 1 minute

  return {
    minutes,
    display: formatDuration(minutes)
  };
}

/**
 * Formats duration in minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  } else if (minutes < 60 * 24) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  } else {
    const days = Math.floor(minutes / (60 * 24));
    const remainingHours = Math.floor((minutes % (60 * 24)) / 60);
    const remainingMinutes = minutes % 60;

    let result = `${days}d`;
    if (remainingHours > 0) {
      result += ` ${remainingHours}h`;
    }
    if (remainingMinutes > 0) {
      result += ` ${remainingMinutes}m`;
    }
    return result;
  }
}

/**
 * Parses time estimate string into minutes
 * Supports formats: "30m", "2h", "1.5h", "90 minutes", "2 hours", "1h 30m"
 * @param estimate - Time estimate string
 * @returns Duration in minutes or null if invalid format
 */
export function parseTimeEstimate(estimate: string): number | null {
  if (!estimate || typeof estimate !== 'string') {
    return null;
  }

  // Normalize the input - remove extra spaces and convert to lowercase
  const normalized = estimate.trim().toLowerCase().replace(/\s+/g, ' ');

  // Pattern for combined format like "1h 30m" or "2 hours 15 minutes"
  const combinedPattern = /^(\d+(?:\.\d+)?)\s*(?:h|hour|hours)\s*(?:(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes))?$/;
  const combinedMatch = normalized.match(combinedPattern);

  if (combinedMatch) {
    const hours = parseFloat(combinedMatch[1]);
    const minutes = combinedMatch[2] ? parseFloat(combinedMatch[2]) : 0;
    return Math.round(hours * 60 + minutes);
  }

  // Pattern for simple formats
  const patterns = [
    // Minutes: "30m", "90 minutes", "15 mins"
    { regex: /^(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)$/, multiplier: 1 },
    // Hours: "2h", "1.5h", "3 hours"
    { regex: /^(\d+(?:\.\d+)?)\s*(?:h|hour|hours)$/, multiplier: 60 },
    // Days: "2d", "1 day", "3 days"
    { regex: /^(\d+(?:\.\d+)?)\s*(?:d|day|days)$/, multiplier: 60 * 24 },
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern.regex);
    if (match) {
      const value = parseFloat(match[1]);
      return Math.round(value * pattern.multiplier);
    }
  }

  // Try parsing plain number as minutes
  const numberMatch = normalized.match(/^(\d+(?:\.\d+)?)$/);
  if (numberMatch) {
    return Math.round(parseFloat(numberMatch[1]));
  }

  return null;
}

/**
 * Calculates estimation accuracy between estimated and actual time
 * @param estimatedMinutes - Estimated duration in minutes
 * @param actualMinutes - Actual duration in minutes
 * @returns Estimation accuracy data
 */
export function calculateEstimationAccuracy(
  estimatedMinutes: number,
  actualMinutes: number
): EstimationAccuracy {
  // Calculate accuracy as percentage where 100% = perfect estimate
  // Formula: 100% - abs(estimated - actual) / max(estimated, actual) * 100%
  const maxTime = Math.max(estimatedMinutes, actualMinutes);
  const difference = Math.abs(estimatedMinutes - actualMinutes);
  const accuracyPercentage = Math.max(0, Math.round(100 - (difference / maxTime) * 100));

  // Determine estimation type
  let estimationType: 'overestimate' | 'underestimate' | 'accurate';
  const tolerancePercent = 10; // 10% tolerance for "accurate"
  const toleranceMinutes = Math.max(1, Math.round(actualMinutes * tolerancePercent / 100));

  if (Math.abs(estimatedMinutes - actualMinutes) <= toleranceMinutes) {
    estimationType = 'accurate';
  } else if (estimatedMinutes > actualMinutes) {
    estimationType = 'overestimate';
  } else {
    estimationType = 'underestimate';
  }

  return {
    estimatedMinutes,
    actualMinutes,
    accuracyPercentage,
    estimationType,
  };
}

/**
 * Calculates average estimation accuracy from multiple tasks
 * @param accuracyData - Array of estimation accuracy data
 * @returns Average accuracy percentage and breakdown by estimation type
 */
export function calculateAverageAccuracy(accuracyData: EstimationAccuracy[]): {
  averageAccuracy: number;
  totalTasks: number;
  accurateCount: number;
  overestimateCount: number;
  underestimateCount: number;
  improvementTrend?: 'improving' | 'declining' | 'stable';
} {
  if (accuracyData.length === 0) {
    return {
      averageAccuracy: 0,
      totalTasks: 0,
      accurateCount: 0,
      overestimateCount: 0,
      underestimateCount: 0,
    };
  }

  const totalAccuracy = accuracyData.reduce((sum, data) => sum + data.accuracyPercentage, 0);
  const averageAccuracy = Math.round(totalAccuracy / accuracyData.length);

  const accurateCount = accuracyData.filter(d => d.estimationType === 'accurate').length;
  const overestimateCount = accuracyData.filter(d => d.estimationType === 'overestimate').length;
  const underestimateCount = accuracyData.filter(d => d.estimationType === 'underestimate').length;

  // Calculate improvement trend if we have enough data points
  let improvementTrend: 'improving' | 'declining' | 'stable' | undefined;
  if (accuracyData.length >= 6) {
    const firstHalf = accuracyData.slice(0, Math.floor(accuracyData.length / 2));
    const secondHalf = accuracyData.slice(Math.floor(accuracyData.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.accuracyPercentage, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.accuracyPercentage, 0) / secondHalf.length;

    const difference = secondHalfAvg - firstHalfAvg;
    if (Math.abs(difference) <= 5) {
      improvementTrend = 'stable';
    } else if (difference > 0) {
      improvementTrend = 'improving';
    } else {
      improvementTrend = 'declining';
    }
  }

  return {
    averageAccuracy,
    totalTasks: accuracyData.length,
    accurateCount,
    overestimateCount,
    underestimateCount,
    improvementTrend,
  };
}

/**
 * Validates if a time estimate string is in a supported format
 * @param estimate - Time estimate string to validate
 * @returns True if the estimate can be parsed
 */
export function isValidTimeEstimate(estimate: string): boolean {
  return parseTimeEstimate(estimate) !== null;
}