import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { createRequire } from 'module';
import type { Plugin } from 'vite';

const require = createRequire(import.meta.url);
const removeTypes = require('flow-remove-types');

function flowRemoveTypesPlugin(): Plugin {
  return {
    name: 'flow-remove-types',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (
        (normalized.includes('/node_modules/react-native/') ||
          normalized.includes('/node_modules/@react-native/') ||
          normalized.includes('/node_modules/@react-native-community/')) &&
        (id.endsWith('.js') || id.endsWith('.ios.js'))
      ) {
        const result = removeTypes(code, { all: true }).toString();
        return { code: result, map: null };
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), flowRemoveTypesPlugin()],
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
    include: [
      'test/**/*.spec.{ts,tsx}',
      'apps/**/__tests__/**/*.test.{ts,tsx}',
      'apps/**/__parity-tests__/**/*.test.{ts,tsx}',
    ],
    server: {
      deps: {
        inline: ['react-native', /react-native/, /@react-native/, /@react-native-community/],
      },
    },
  },
});
