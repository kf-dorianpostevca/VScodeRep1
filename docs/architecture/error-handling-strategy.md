# Error Handling Strategy

## General Approach
- **Error Model:** Result-based error handling with typed error objects for predictable error management
- **Exception Hierarchy:** Custom error classes extending base Error with specific error types (ValidationError, DatabaseError, NotFoundError)
- **Error Propagation:** Errors bubble up through service layers with context enrichment, transformed to user-friendly messages at interface boundaries

## Logging Standards
- **Library:** winston 3.11.0 for structured logging with JSON output
- **Format:** Structured JSON with timestamp, level, message, context, and correlation ID
- **Levels:** error, warn, info, debug (production logs info and above)
- **Required Context:**
  - Correlation ID: UUID v4 format for request tracing (`req-${uuid}`)
  - Service Context: Package name, version, component (e.g., "cli/v1.0.0/TaskService")
  - User Context: No PII - only session type (cli/web) and operation type

## Error Handling Patterns

### Business Logic Errors
- **Custom Exceptions:**
  - `TaskValidationError` - Invalid task data or constraints
  - `TaskNotFoundError` - Task ID not found in database
  - `AnalyticsError` - Issues generating celebration summaries
  - `ExportError` - Data export/import failures
- **User-Facing Errors:** Gentle, solution-oriented messages maintaining positive tone
- **Error Codes:** Alphanumeric codes (TASK001, EXPORT002) for support and debugging

### Data Consistency
- **Transaction Strategy:** SQLite transactions for multi-step operations (task completion + analytics update)
- **Compensation Logic:** Rollback incomplete operations, maintain audit trail for debugging
- **Idempotency:** Task operations idempotent by design - duplicate completions ignored with friendly message
