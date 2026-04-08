import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { createRequire } from 'module';
import type { Plugin } from 'vite';

const require = createRequire(import.meta.url);
const removeTypes = require('flow-remove-types');

// Resolve rolldown through vite's dependencies (pnpm nests it)
const viteRequire = createRequire(require.resolve('vite'));
const rolldownPath = viteRequire.resolve('rolldown/utils');
const { transformSync } = await import(rolldownPath) as { transformSync: (filename: string, code: string, options?: { lang?: string }) => { code: string } };

function reactNativeDependencyTransformPlugin(): Plugin {
  const rnSpecificExts = ['.ios.js', '.ios.jsx', '.android.js', '.android.jsx', '.native.js', '.native.jsx'];
  const transformableExts = ['.js', '.jsx', ...rnSpecificExts];

  return {
    name: 'react-native-dependency-transform',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!transformableExts.some((ext) => normalized.endsWith(ext))) return;
      if (!normalized.includes('/node_modules/')) return;

      const nodeModIdx = normalized.lastIndexOf('/node_modules/');
      if (nodeModIdx === -1) return;
      const depPath = normalized.slice(nodeModIdx + '/node_modules/'.length);
      const segments = depPath.split('/');
      const pkgName = segments[0]?.startsWith('@') ? `${segments[0]}/${segments[1]}` : segments[0];
      if (!pkgName) return;

      const isRN =
        pkgName === 'react-native' ||
        pkgName.startsWith('@react-native/') ||
        pkgName.includes('react-native') ||
        rnSpecificExts.some((ext) => normalized.endsWith(ext));

      if (!isRN) return;

      const flowStripped = removeTypes(code, { all: true }).toString();
      const result = transformSync(id, flowStripped, { lang: 'jsx' });
      return { code: result.code, map: null };
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
