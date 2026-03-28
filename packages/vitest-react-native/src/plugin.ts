import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import type { Plugin, UserConfig } from 'vite';
import * as esbuild from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const removeTypes = require('flow-remove-types');

export interface VitestReactNativePluginOptions {
  /**
   * Additional file extensions to resolve for iOS platform
   * @default []
   */
  additionalExtensions?: string[];

  /**
   * Additional package names or patterns whose .js files contain JSX or Flow
   * types and need to be transformed. Useful for React Native community
   * packages that use JSX in .js files (e.g., 'react-native-modal-datetime-picker').
   * @default []
   */
  transformPackages?: string[];
}

/**
 * Vitest plugin for React Native
 * Configures Vite to properly resolve React Native modules and sets up
 * the test environment for running React Native components in Vitest.
 */
export function reactNative(options: VitestReactNativePluginOptions = {}): Plugin {
  const { additionalExtensions = [], transformPackages = [] } = options;

  const defaultExtensions = [
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
  ];

  const extensions = [...additionalExtensions, ...defaultExtensions];

  return {
    name: 'vitest-plugin-react-native',
    enforce: 'pre',
    config(): UserConfig {
      return {
        resolve: {
          extensions,
          conditions: ['react-native'],
        },
        test: {
          setupFiles: [resolve(__dirname, 'setup.js')],
          globals: true,
          server: {
            deps: {
              inline: ['react-native', /react-native/, /@react-native/, /@react-native-community/],
            },
          },
        },
      } as UserConfig;
    },
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      const isJsFile = id.endsWith('.js') || id.endsWith('.ios.js');
      if (!isJsFile) return;

      // Core RN packages: strip Flow types
      if (
        normalized.includes('/node_modules/react-native/') ||
        normalized.includes('/node_modules/@react-native/') ||
        normalized.includes('/node_modules/@react-native-community/')
      ) {
        const result = removeTypes(code, { all: true }).toString();
        return { code: result, map: null };
      }

      // Additional user-specified packages: transform JSX in .js files
      if (
        transformPackages.length > 0 &&
        normalized.includes('/node_modules/') &&
        transformPackages.some((pkg) => normalized.includes(`/node_modules/${pkg}/`))
      ) {
        const result = esbuild.transformSync(code, {
          loader: 'jsx',
          format: 'esm',
        });
        return { code: result.code, map: null };
      }
    },
  };
}

export default reactNative;
