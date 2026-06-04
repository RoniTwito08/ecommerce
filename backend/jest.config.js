'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.js'],
  setupFiles: ['dotenv/config'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/docs/**'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  clearMocks: true,
  restoreMocks: true,
};
