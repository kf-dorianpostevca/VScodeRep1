# Source Tree

```
intelligent-todo/
├── .github/workflows/                 # CI/CD workflows
│   ├── ci.yml                        # Test, lint, build
│   ├── cli-publish.yml               # npm publishing
│   └── web-deploy.yml                # Vercel deployment
├── docs/                             # Documentation
│   ├── prd.md                        # Product Requirements
│   ├── architecture.md               # This document
│   └── user-guides/                  # User documentation
├── packages/                         # Monorepo packages
│   ├── shared/                       # Core business logic
│   │   ├── src/
│   │   │   ├── models/              # Data models
│   │   │   ├── repositories/        # Data access layer
│   │   │   ├── services/            # Business logic
│   │   │   └── utils/               # Utilities
│   │   └── __tests__/               # Unit tests
│   ├── cli/                         # CLI application
│   │   ├── src/
│   │   │   ├── commands/            # CLI commands
│   │   │   ├── formatters/          # Output formatting
│   │   │   └── parsers/             # Input parsing
│   │   ├── bin/todo                 # CLI binary
│   │   └── __tests__/               # CLI tests
│   ├── api/                         # REST API server
│   │   ├── src/
│   │   │   ├── routes/              # Express routes
│   │   │   ├── middleware/          # Express middleware
│   │   │   └── controllers/         # Route controllers
│   │   └── __tests__/               # API tests
│   └── web/                         # React web application
│       ├── src/
│       │   ├── components/          # React components
│       │   ├── pages/               # Page components
│       │   ├── services/            # API clients
│       │   └── hooks/               # Custom hooks
│       └── __tests__/               # Web tests
├── scripts/                         # Monorepo scripts
│   ├── build-all.sh
│   ├── test-all.sh
│   └── setup-dev.sh
├── package.json                     # Root package.json
├── tsconfig.json                    # TypeScript config
└── README.md                        # Project overview
```
