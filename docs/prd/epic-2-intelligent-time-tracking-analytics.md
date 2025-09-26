# Epic 2: Intelligent Time Tracking & Analytics

**Epic Goal:** Implement celebration-focused productivity insights through minimal data capture (timestamps only) to provide meaningful differentiation without creating obsessive tracking behaviors. Generate monthly summaries that highlight achievements and time estimation improvements, delivering the core value proposition of intelligent simplicity.

## Story 2.1: Duration Calculation and Time Estimation Learning

As a user interested in improving my time estimation skills,
I want the system to calculate actual task duration and compare it to my estimates,
so that I can learn from patterns and improve future planning accuracy.

**Acceptance Criteria:**
1. System automatically calculates actual duration when tasks have both creation and completion timestamps
2. `todo stats` command shows current month's estimation accuracy summary
3. Time estimate parsing supports formats like "30m", "2h", "1.5h", "90 minutes"
4. Estimation accuracy displayed as percentage and improvement trend over time
5. Only tasks with estimates contribute to accuracy calculations
6. Handles edge cases like tasks completed in under 1 minute gracefully

## Story 2.2: Monthly Progress Summary Generation

As an Atomic Habits enthusiast,
I want monthly celebration-focused reports highlighting my productivity patterns,
so that I can see progress and maintain motivation without obsessive daily tracking.

**Acceptance Criteria:**
1. `todo monthly` generates current month's progress summary automatically
2. Summary includes: tasks completed, completion rate, time estimation accuracy, productivity streaks
3. Language emphasizes celebration and achievement rather than failure or gaps
4. Visual ASCII charts show completion patterns across weeks
5. Identifies most productive days/times for pattern recognition
6. Monthly summary generated in under 5 seconds as per NFR requirements
7. Summary data persisted for historical access

## Story 2.3: Historical Monthly Reports and Trends

As a data-driven professional,
I want to access previous monthly summaries and see longer-term trends,
so that I can understand my productivity evolution and validate improvement efforts.

**Acceptance Criteria:**
1. `todo monthly --month 2025-08` retrieves specific month's summary
2. `todo monthly --history` shows last 6 months of key metrics in compact format
3. Historical data includes completion trends, estimation accuracy improvements, and productivity patterns
4. Trend visualization shows month-over-month changes in key metrics
5. Missing months handled gracefully (show "No data" rather than errors)
6. Archive old detailed data while preserving key metrics for performance

## Story 2.4: Celebration-Focused Insights and Encouragement

As a user seeking positive productivity reinforcement,
I want insights that celebrate achievements and provide gentle guidance,
so that I maintain motivation without developing productivity anxiety.

**Acceptance Criteria:**
1. Monthly summaries lead with accomplishments and positive trends
2. Improvement suggestions framed as opportunities rather than criticisms
3. Recognition of consistency streaks and milestone achievements
4. Gentle reminders about abandoned tasks without guilt-inducing language
5. Contextual encouragement based on recent productivity patterns
6. Option to disable insights for users preferring raw data only
