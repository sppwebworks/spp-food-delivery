export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  // Required for ES modules (your server uses import syntax)
  transform: {},
  extensionsToTreatAsEsm: [".js"],
};
