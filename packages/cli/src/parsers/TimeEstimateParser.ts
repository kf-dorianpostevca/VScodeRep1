/**
 * Time estimate parser for CLI time input formats
 * Converts human-friendly time formats to minutes for database storage
 */

/**
 * Parses time estimate strings into minutes
 * Supports formats: 30m, 2h, 1h30m, 1.5h, 90 minutes, 2 hours
 * @param timeStr - Time string to parse (e.g., "30m", "2h", "1h30m", "1.5h", "90 minutes")
 * @returns Number of minutes or null if invalid
 * @throws Error if format is invalid or exceeds 24-hour limit
 * @example
 * ```typescript
 * parseTimeEstimate("30m")        // Returns 30
 * parseTimeEstimate("2h")         // Returns 120
 * parseTimeEstimate("1h30m")      // Returns 90
 * parseTimeEstimate("1.5h")       // Returns 90
 * parseTimeEstimate("90 minutes") // Returns 90
 * parseTimeEstimate("2 hours")    // Returns 120
 * parseTimeEstimate("invalid")    // Throws Error
 * ```
 */
export function parseTimeEstimate(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') {
    throw new Error('Time estimate is required');
  }

  const trimmed = timeStr.trim().toLowerCase();

  // Try spelled-out formats first: "90 minutes", "2 hours"
  const spelledOutMinutesRegex = /^(\d+(?:\.\d+)?)\s*(?:minute|minutes|min|mins)$/;
  const spelledOutHoursRegex = /^(\d+(?:\.\d+)?)\s*(?:hour|hours|h)$/;

  const minutesMatch = trimmed.match(spelledOutMinutesRegex);
  if (minutesMatch) {
    const totalMinutes = Math.round(parseFloat(minutesMatch[1]));

    if (totalMinutes === 0) {
      throw new Error('Time estimate must be greater than 0');
    }

    if (totalMinutes < 1 || totalMinutes > 1440) {
      throw new Error('Time estimate must be between 1 minute and 24 hours');
    }

    return totalMinutes;
  }

  const hoursMatch = trimmed.match(spelledOutHoursRegex);
  if (hoursMatch) {
    const hours = parseFloat(hoursMatch[1]);
    const totalMinutes = Math.round(hours * 60);

    if (totalMinutes === 0) {
      throw new Error('Time estimate must be greater than 0');
    }

    if (totalMinutes < 1 || totalMinutes > 1440) {
      throw new Error('Time estimate must be between 1 minute and 24 hours');
    }

    return totalMinutes;
  }

  // Match compact formats: 30m, 2h, 1.5h, 1h30m
  // Support decimal hours like 1.5h
  const timeRegex = /^(?:(\d+(?:\.\d+)?)h)?(?:(\d+)m)?$/;
  const match = trimmed.match(timeRegex);

  if (!match) {
    throw new Error('Invalid time format. Use formats like: 30m, 2h, 1.5h, 1h30m, 90 minutes, 2 hours');
  }

  const hoursStr = match[1];
  const minutesStr = match[2];

  // Parse hours (may be decimal)
  const hours = hoursStr ? parseFloat(hoursStr) : 0;
  const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;

  // Validate we got at least some time
  if (hours === 0 && minutes === 0) {
    throw new Error('Time estimate must be greater than 0');
  }

  const totalMinutes = Math.round((hours * 60) + minutes);

  // Validate against database constraints (1-1440 minutes = 24 hours max)
  if (totalMinutes < 1 || totalMinutes > 1440) {
    throw new Error('Time estimate must be between 1 minute and 24 hours');
  }

  return totalMinutes;
}

/**
 * Formats minutes back to human-readable format for display
 * @param minutes - Number of minutes to format
 * @returns Formatted time string (e.g., "30m", "2h", "1h30m")
 * @example
 * ```typescript
 * formatTimeEstimate(30)   // Returns "30m"
 * formatTimeEstimate(120)  // Returns "2h"
 * formatTimeEstimate(90)   // Returns "1h30m"
 * ```
 */
export function formatTimeEstimate(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${remainingMinutes}m`;
}