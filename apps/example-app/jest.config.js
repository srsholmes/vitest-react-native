module.exports = {
  testMatch: ['<rootDir>/__parity-tests__/**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm/.*?/node_modules/)?(react-native|@react-native|@testing-library/react-native|@react-native-community)/)',
  ],
  moduleFileExtensions: ['ios.ts', 'ios.tsx', 'ts', 'tsx', 'js', 'jsx', 'json'],
  setupFiles: ['<rootDir>/jest-setup.js'],
  testEnvironment: 'node',
  watchman: false,
};
