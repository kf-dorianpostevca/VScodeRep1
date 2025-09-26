# Tech Stack

## Cloud Infrastructure

- **Provider:** Local Development (No Cloud for MVP)
- **Key Services:** GitHub (repository), npm (CLI distribution), Vercel (web hosting)
- **Deployment Regions:** Global CDN via Vercel

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Language** | TypeScript | 5.2.2 | Primary development language | Strong typing, excellent tooling, shared between CLI/web |
| **Runtime** | Node.js | 20.9.0 LTS | JavaScript runtime | LTS stability, excellent performance, broad ecosystem |
| **CLI Framework** | Commander.js | 11.1.0 | Command-line interface | Mature, lightweight, excellent parsing and help generation |
| **Backend Framework** | Express.js | 4.18.2 | REST API server | Minimal, fast, perfect for simple API needs |
| **Database** | SQLite | 3.44.0 | Local data storage | File-based, zero-config, supports complex queries |
| **Database Driver** | better-sqlite3 | 9.1.0 | Node.js SQLite interface | Synchronous API, better performance than node-sqlite3 |
| **Frontend Framework** | React | 18.2.0 | Web interface | Component reusability, excellent TypeScript support |
| **CSS Framework** | Tailwind CSS | 3.3.5 | Utility-first styling | Rapid development, consistent design system |
| **Build Tool** | Vite | 4.5.0 | Development and bundling | Fast builds, excellent TypeScript support |
| **Package Manager** | npm | 10.2.0 | Dependency management | Comes with Node.js, workspace support |
| **Testing Framework** | Jest | 29.7.0 | Unit and integration testing | Excellent TypeScript support, powerful mocking |
| **Linter** | ESLint | 8.51.0 | Code quality enforcement | TypeScript rules, consistent code style |
| **Formatter** | Prettier | 3.0.3 | Code formatting | Automatic formatting, reduces style debates |
| **CI/CD** | GitHub Actions | Latest | Automated testing and deployment | Free for public repos, excellent Node.js support |
| **Web Hosting** | Vercel | Latest | Static site hosting | Zero-config React deployment, global CDN |
