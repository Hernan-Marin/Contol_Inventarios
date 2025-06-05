module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  setupFilesAfterEnv: ['./tests/setup.js'], // Add this line
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
};
