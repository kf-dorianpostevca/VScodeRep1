module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',

    // General code quality
    'no-console': 'error', // Enforce winston logger usage
    'prefer-const': 'error',
    'no-var': 'error',

    // Code organization
    'import/order': 'off', // Let Prettier handle this
    'sort-imports': 'off',
  },
  overrides: [
    {
      // Test files can use console and have relaxed rules
      files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      }
    },
    {
      // Config files can have relaxed rules
      files: ['*.config.js', '*.config.ts', 'jest.config.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      }
    }
  ],
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
};