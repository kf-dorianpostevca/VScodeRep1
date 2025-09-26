# Test Strategy and Standards

## Testing Philosophy
- **Approach:** Test-driven development for business logic, test-after for UI components and CLI commands
- **Coverage Goals:** 90% line coverage for shared package, 80% for CLI/API packages, 70% for web package
- **Test Pyramid:** 60% unit tests, 30% integration tests, 10% end-to-end tests focused on critical user workflows

## Test Types and Organization

### Unit Tests
- **Framework:** Jest 29.7.0 with TypeScript support via ts-jest
- **File Convention:** `*.test.ts` files in `__tests__/` directories co-located with source code
- **Location:** Each package maintains its own unit test suite in `packages/{package}/__tests__/`
- **Mocking Library:** Jest built-in mocking with manual mocks for external dependencies
- **Coverage Requirement:** 90% line coverage for business logic, 80% for service layers

### Integration Tests
- **Scope:** Cross-package integration, database operations, CLI workflow testing
- **Location:** `packages/{package}/__tests__/integration/` directories
- **Test Infrastructure:**
  - **Database:** In-memory SQLite for fast test execution, isolated test databases per test suite
  - **CLI Testing:** Spawn actual CLI processes with temporary databases for realistic workflow validation
  - **API Testing:** Supertest with Express app instance, temporary SQLite database per test

### End-to-End Tests
- **Framework:** Jest with custom CLI testing utilities for command-line workflows
- **Scope:** Complete user journeys covering task creation → completion → monthly summary generation
- **Environment:** Isolated test environment with fresh SQLite database, temporary file system
- **Test Data:** Factory functions generating realistic task data with various estimation patterns

## Test Data Management
- **Strategy:** Factory pattern with realistic data generation matching user behavior patterns
- **Fixtures:** JSON files with sample monthly summaries and task data for consistent testing
- **Factories:** `TaskFactory.ts`, `SummaryFactory.ts` generating data with celebration-appropriate variations
- **Cleanup:** Automatic cleanup of temporary databases and files after each test suite

## Continuous Testing
- **CI Integration:** GitHub Actions runs full test suite on every PR with parallel execution across packages
- **Performance Tests:** Benchmark tests ensuring CLI responses under 1 second, monthly summary generation under 5 seconds
- **Security Tests:** Input validation testing with malicious payloads, SQL injection prevention validation
