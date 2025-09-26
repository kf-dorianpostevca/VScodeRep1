# Infrastructure and Deployment

## Infrastructure as Code
- **Tool:** GitHub Actions workflows (no traditional IaC needed for local-first architecture)
- **Location:** `.github/workflows/`
- **Approach:** Declarative CI/CD pipelines with automated testing, building, and deployment

## Deployment Strategy
- **Strategy:** Dual deployment pattern - CLI via npm registry, Web via Vercel static hosting
- **CI/CD Platform:** GitHub Actions (free for public repositories, excellent Node.js ecosystem)
- **Pipeline Configuration:** `.github/workflows/ci.yml`, `cli-publish.yml`, `web-deploy.yml`

## Environments
- **Development:** Local development with SQLite database, hot reload for web interface
- **Staging:** GitHub PR previews via Vercel, npm beta releases for CLI testing
- **Production:** npm public registry for CLI, Vercel production deployment for web interface

## Environment Promotion Flow
```text
Local Development
    ↓ (git push to feature branch)
GitHub Actions CI
    ↓ (automated tests pass)
PR Preview Deployment
    ↓ (PR merge to main)
Production Deployment
    ├── CLI → npm publish
    └── Web → Vercel production
```

## Rollback Strategy
- **Primary Method:** Git revert + automated redeployment
- **Trigger Conditions:** Failed health checks, user-reported critical issues
- **Recovery Time Objective:** Under 10 minutes for web rollback, under 5 minutes for CLI version revert guidance
