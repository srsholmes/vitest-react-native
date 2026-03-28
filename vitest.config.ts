import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { transformReactNativeDependency } from './packages/vitest-react-native/src/reactNativeDependencyTransform';

function reactNativeDependencyTransformPlugin(): Plugin {
  return {
    name: 'react-native-dependency-transform',
    enforce: 'pre',
    transform(code, id) {
      return transformReactNativeDependency(code, id);
    },
  };
}

export default defineConfig({
  plugins: [react(), reactNativeDependencyTransformPlugin()],
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
        inline: ['react-native', /react-native/, /@react-native/],
      },
    },
  },
});
