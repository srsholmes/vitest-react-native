import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  // @ts-expect-error - Vite version mismatch between vitest and @vitejs/plugin-react
  plugins: [react()],
  resolve: {
    extensions: [
      '.ios.js',
      '.ios.jsx',
      '.ios.ts',
      '.ios.tsx',
      '.native.js',
      '.native.jsx',
      '.native.ts',
      '.native.tsx',
      '.mjs',
      '.js',
      '.mts',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
    ],
    conditions: ['react-native'],
  },
  test: {
    setupFiles: [
      resolve(__dirname, 'packages/vitest-react-native/src/setup.ts'),
      resolve(__dirname, 'apps/example-app/test-setup.ts'),
    ],
    globals: true,
    environment: 'node',
    include: ['test/**/*.spec.{ts,tsx}', 'apps/**/__tests__/**/*.test.{ts,tsx}'],
    server: {
      deps: {
        external: ['react-native'],
      },
    },
  },
});
