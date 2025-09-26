# Data Models

## Task

**Purpose:** Core entity representing individual todo items with timestamp capture for analytics and time estimation learning.

**Key Attributes:**
- id: string (UUID) - Unique identifier for task references and CLI operations
- title: string - User-provided task description (required)
- description: string | null - Optional detailed description for complex tasks
- createdAt: Date - Automatic timestamp for duration calculations and analytics
- completedAt: Date | null - Timestamp when marked complete, enables celebration insights
- estimatedMinutes: number | null - User's time estimate for accuracy learning
- actualMinutes: number | null - Calculated from createdAt/completedAt difference
- isCompleted: boolean - Status flag for filtering and display logic
- tags: string[] - Optional categorization for advanced analytics (future enhancement)

**Relationships:**
- Task belongs to implicit User (single-user MVP, no explicit relationship)
- Task contributes to MonthlySummary aggregations
- Task participates in EstimationAccuracy calculations

## MonthlySummary

**Purpose:** Pre-calculated celebration-focused analytics to avoid real-time computation and provide consistent monthly insights.

**Key Attributes:**
- id: string (UUID) - Unique identifier for summary retrieval
- month: string - ISO month format (YYYY-MM) for easy querying
- totalTasks: number - Count of tasks created in month
- completedTasks: number - Count of tasks completed in month
- completionRate: number - Percentage for celebration messaging
- averageActualMinutes: number | null - Mean actual duration for completed tasks
- estimationAccuracy: number | null - Percentage accuracy for tasks with estimates
- longestStreak: number - Consecutive days with task completions
- mostProductiveDay: string | null - Day of week with highest completion rate
- celebrationMessage: string - Generated positive reinforcement text

**Relationships:**
- MonthlySummary aggregates multiple Task entities
- MonthlySummary enables historical trend analysis
- MonthlySummary supports export functionality

## Configuration

**Purpose:** User preferences and application settings that persist across sessions and interfaces.

**Key Attributes:**
- id: string - Single row identifier (singleton pattern)
- defaultEstimateMinutes: number - Default time estimate for quick task creation
- celebrationLanguage: string - Tone preference ('enthusiastic' | 'gentle' | 'professional')
- dateFormat: string - Display format preference (ISO, US, EU)
- timeFormat: string - 12h/24h preference
- enableInsights: boolean - Toggle for celebration messaging
- exportFormat: string - Default format for data exports
- lastSummaryGenerated: Date | null - Optimization for monthly report timing

**Relationships:**
- Configuration affects Task display formatting
- Configuration controls MonthlySummary generation behavior
- Configuration enables consistent CLI/web interface behavior
