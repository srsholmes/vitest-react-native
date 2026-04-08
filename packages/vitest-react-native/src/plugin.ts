import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { existsSync } from 'fs';
import type { Plugin, UserConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const removeTypes = require('flow-remove-types');

// Lazily resolved rolldown transform (ships with Vite 8+)
type TransformSyncFn = (filename: string, code: string, options?: { lang?: string }) => { code: string };
let _transformSync: TransformSyncFn | null = null;
let _transformSyncLoading: Promise<void> | null = null;
const ensureTransformSync = async (): Promise<void> => {
  if (_transformSync) return;
  if (!_transformSyncLoading) {
    _transformSyncLoading = (async () => {
      const viteRequire = createRequire(require.resolve('vite'));
      const rolldownPath = viteRequire.resolve('rolldown/utils');
      const mod = await import(rolldownPath);
      _transformSync = mod.transformSync;
    })();
  }
  await _transformSyncLoading;
};

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
    async buildStart() {
      await ensureTransformSync();
    },
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
    // Resolve extensionless imports from node_modules packages that ship
    // TypeScript source (e.g., @d11/react-native-fast-image).
    // Node's require() doesn't try .ts/.tsx extensions, so these fail at runtime.
    resolveId(source, importer) {
      if (!importer || !source.startsWith('.') || !importer.includes('node_modules')) return;
      // Skip if source already has a file extension
      const lastSegment = source.split('/').pop() || '';
      if (lastSegment.includes('.')) return;

      const importerDir = dirname(importer);
      for (const ext of extensions) {
        const candidate = resolve(importerDir, source + ext);
        if (existsSync(candidate)) return candidate;
      }
      // Also try index files (e.g., ./foo → ./foo/index.ts)
      for (const ext of extensions) {
        const candidate = resolve(importerDir, source, 'index' + ext);
        if (existsSync(candidate)) return candidate;
      }
    },
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');

      // Platform-specific extensions that always indicate RN ecosystem files
      const rnSpecificExts = ['.ios.js', '.ios.jsx', '.android.js', '.android.jsx', '.native.js', '.native.jsx'];
      const transformableExts = ['.js', '.jsx', ...rnSpecificExts];

      if (!transformableExts.some((ext) => normalized.endsWith(ext))) return;
      if (!normalized.includes('/node_modules/')) return;

      // Extract package name from path
      const nodeModIdx = normalized.lastIndexOf('/node_modules/');
      if (nodeModIdx === -1) return;
      const depPath = normalized.slice(nodeModIdx + '/node_modules/'.length);
      const segments = depPath.split('/');
      const pkgName = segments[0]?.startsWith('@') ? `${segments[0]}/${segments[1]}` : segments[0];
      if (!pkgName) return;

      // Auto-detect: any package with "react-native" in the name, or
      // any file with a platform-specific extension (.ios.js, .native.js, etc.)
      const isRNPackage =
        pkgName === 'react-native' ||
        pkgName.startsWith('@react-native/') ||
        pkgName.includes('react-native') ||
        rnSpecificExts.some((ext) => normalized.endsWith(ext));

      // Also match user-specified additional packages
      const isExtraPackage =
        transformPackages.length > 0 &&
        transformPackages.some((pkg) => pkgName === pkg || pkgName.startsWith(pkg + '/'));

      if (!isRNPackage && !isExtraPackage) return;

      // Strip Flow types then transform JSX
      const flowStripped = removeTypes(code, { all: true }).toString();
      const result = _transformSync!(id, flowStripped, { lang: 'jsx' });
      return { code: result.code, map: null };
    },
  };
}

export default reactNative;
