# Security

## Input Validation
- **Validation Library:** Joi 17.11.0 for schema validation with TypeScript integration
- **Validation Location:** All input boundaries - CLI argument parsing, API request bodies, database writes
- **Required Rules:**
  - All external inputs MUST be validated before processing
  - Validation at API boundary before reaching business logic
  - Whitelist approach preferred over blacklist for task content and commands

## Authentication & Authorization
- **Auth Method:** No authentication system for MVP (single-user local storage model)
- **Session Management:** Not applicable - local file system access only
- **Required Patterns:**
  - File system permissions protect SQLite database from other users on shared systems
  - Future multi-user design documented but not implemented for MVP simplicity

## Secrets Management
- **Development:** No secrets required for local-first architecture
- **Production:** No server-side secrets - all data local to user's machine
- **Code Requirements:**
  - No hardcoded configuration values that could become secrets in future versions
  - Configuration loaded from environment variables or local config files only
  - No API keys, tokens, or credentials in any codebase

## API Security
- **Rate Limiting:** express-rate-limit middleware - 100 requests per minute per IP for web interface
- **CORS Policy:** Strict CORS configuration allowing only localhost and production domain origins
- **Security Headers:** Helmet.js middleware for security headers (XSS protection, content type sniffing prevention)
- **HTTPS Enforcement:** Enforced in production via Vercel configuration, optional in local development

## Data Protection
- **Encryption at Rest:** Not required for MVP - SQLite file permissions provide adequate protection for todo data
- **Encryption in Transit:** HTTPS for web interface API calls, not applicable for CLI (local file access)
- **PII Handling:** No PII collected beyond task content - all data stored locally on user's machine
- **Logging Restrictions:** Never log task content, user data, or file paths - log only operation types and error conditions

## Dependency Security
- **Scanning Tool:** npm audit integrated into CI/CD pipeline with automated dependency updates
- **Update Policy:** Security updates applied immediately, feature updates reviewed monthly
- **Approval Process:** New dependencies require architecture review to prevent supply chain risks

## Security Testing
- **SAST Tool:** ESLint security rules via eslint-plugin-security for code pattern analysis
- **DAST Tool:** Not applicable for local-first architecture - no running web services to test
- **Penetration Testing:** Not required for MVP due to local data storage model
