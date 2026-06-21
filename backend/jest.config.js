module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/verify.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
    './src/controllers/**': {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    './src/services/**': {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    './src/routes/**': {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    './src/middleware/**': {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
};
