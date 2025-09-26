# Technical Assumptions

## Repository Structure: Monorepo
Single repository containing both frontend and backend with clear separation, enabling simplified development workflow and coordinated deployments while maintaining BMAD principle of intelligent simplicity.

## Service Architecture
**CRITICAL DECISION - Monolithic REST API within Monorepo Structure**
Simple Node.js/Express backend with TypeScript providing REST API endpoints. Monolithic approach aligns with MVP scope and single-developer constraints while avoiding microservices complexity that would violate BMAD methodology. Future GraphQL layer possible if user interaction patterns justify the addition.

## Testing Requirements
**CRITICAL DECISION - Unit + Integration Testing Strategy**
Comprehensive unit tests for business logic (time calculation, monthly summary generation) plus integration tests for API endpoints and database operations. Manual testing convenience methods for user workflow validation. Automated testing pipeline ensures reliability while maintaining development velocity within 20 hours/week constraint.

## Additional Technical Assumptions and Requests

**Frontend Technology Stack:**
- TypeScript with React for type safety and component reusability
- Utility-first CSS approach (Tailwind CSS) for rapid UI development and consistent design system
- Offline-first architecture using service workers for core functionality persistence

**Backend Technology Stack:**
- Node.js with Express framework for API development
- SQLite for initial data storage (simple, file-based, no external dependencies)
- Migration path to PostgreSQL documented for future scaling needs

**CLI Interface Priority:**
- CLI as primary interface for power users and development workflow
- Web interface as secondary, responsive companion for visual users
- Shared TypeScript business logic between CLI and web implementations
- CLI supports full feature parity with web interface

**Development & Deployment:**
- Vercel or Netlify for web interface hosting
- npm package distribution for CLI interface
- GitHub Actions for CI/CD pipeline with automated testing and deployment
- Development environment using local SQLite with seeded test data

**Authentication & User Management:**
- No authentication system for MVP (single-user focus)
- Local data storage per user environment
- Future multi-user support designed but not implemented initially

**Data Architecture:**
- Minimal schema focusing on task entities with timestamps
- Simple backup/export mechanisms for user data portability
- Local data storage eliminates server-side user management complexity

**Security Considerations:**
- Basic input validation and sanitization for CLI and web inputs
- No sensitive data storage beyond task content
- HTTPS enforcement for web interface communications
- Local data storage reduces attack surface for MVP
