# Coding Standards

## Core Standards
- **Languages & Runtimes:** TypeScript 5.2.2 with strict mode, Node.js 20.9.0 LTS
- **Style & Linting:** ESLint 8.51.0 with `@typescript-eslint/recommended`, Prettier 3.0.3 for formatting
- **Test Organization:** `__tests__/` directories co-located with source, `.test.ts` suffix for all test files

## Critical Rules
- **No console.log in production code:** Always use the winston logger with appropriate levels - console.log bypasses structured logging and correlation IDs
- **All database operations must use Repository pattern:** Never access SQLite directly from services - maintains abstraction for testing and future migration
- **CLI responses must include celebration elements:** Success messages should use positive language and appropriate emojis to maintain user motivation
- **API responses must use ApiResponse wrapper type:** Ensures consistent error handling and response structure across all endpoints
- **Time calculations must use shared utilities:** dateUtils.ts functions prevent inconsistent duration calculations between CLI and web
- **Task operations must be idempotent:** Completing an already-completed task should return success with friendly message, not error
- **Never expose database errors to users:** Transform technical errors into user-friendly messages that maintain the celebration-focused tone
- **All public functions and interfaces must have JSDoc comments:** Every exported function, class, interface, and type must include comprehensive JSDoc documentation with @param, @returns, @throws, and @example tags where applicable - enables proper IDE intellisense and maintains code clarity for AI agents
