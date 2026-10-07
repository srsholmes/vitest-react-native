import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import reactNative from './packages/vitest-react-native/src/plugin';

// Dogfood the plugin from source so its resolution and transforms are what the
// tests exercise. It adds src/setup.ts to setupFiles.
export default defineConfig({
  plugins: [react(), reactNative()],
  test: {
    setupFiles: [resolve(__dirname, 'apps/example-app/test-setup.ts')],
    environment: 'node',
    include: [
      'test/**/*.spec.{ts,tsx}',
      'apps/**/__tests__/**/*.test.{ts,tsx}',
      'apps/**/__parity-tests__/**/*.test.{ts,tsx}',
    ],
  },
});
