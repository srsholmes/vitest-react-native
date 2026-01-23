import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Plugin, UserConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface VitestReactNativePluginOptions {
  /**
   * Additional file extensions to resolve for iOS platform
   * @default []
   */
  additionalExtensions?: string[];
}

/**
 * Vitest plugin for React Native
 * Configures Vite to properly resolve React Native modules and sets up
 * the test environment for running React Native components in Vitest.
 */
export function reactNative(options: VitestReactNativePluginOptions = {}): Plugin {
  const { additionalExtensions = [] } = options;

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
              external: ['react-native'],
            },
          },
        },
      } as UserConfig;
    },
  };
}

export default reactNative;
