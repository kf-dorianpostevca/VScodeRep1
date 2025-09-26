module.exports = {
  projects: [
    '<rootDir>/packages/shared',
    '<rootDir>/packages/cli',
    '<rootDir>/packages/api',
    '<rootDir>/packages/web'
  ],
  collectCoverageFrom: [
    '<rootDir>/packages/*/src/**/*.ts',
    '<rootDir>/packages/*/src/**/*.tsx',
    '!<rootDir>/packages/*/src/**/*.d.ts',
    '!<rootDir>/packages/*/src/**/*.test.ts',
    '!<rootDir>/packages/*/src/**/*.spec.ts'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ]
};