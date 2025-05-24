const ignorePatterns = [
  '\\/build\\/',
  '\\/coverage\\/',
  '\\/\\.vscode\\/',
  '\\/\\.tmp\\/',
  '\\/\\.cache\\/',
];

/** @type {import('jest').Config} */
module.exports = {
  modulePathIgnorePatterns: ignorePatterns,
  testMatch: ['<rootDir>/**/*-test.[jt]s?(x)'],
  transform: {
    '\\.[jt]sx?$': require.resolve('./transform'),
  },
  watchPathIgnorePatterns: [...ignorePatterns, '\\/node_modules\\/'],
  globals: {
    __DEV__: true,
  },
  setupFiles: [],
};
