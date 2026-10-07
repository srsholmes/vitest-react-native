import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { existsSync } from 'fs';
import type { Plugin, UserConfig } from 'vite';
import * as esbuild from 'esbuild';
import { resolveReactNativeDeepImport, splitBareSpecifier, isReactNativePackage } from './resolve.js';

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
// dist/setup.js when installed; src/setup.ts when running from source.
const setupFile = existsSync(resolve(__dirname, 'setup.js'))
  ? resolve(__dirname, 'setup.js')
  : resolve(__dirname, 'setup.ts');

/**
 * Put the plugin's setup file first, dropping any other reference to it
 * (e.g. a manually listed `@srsholmes/vitest-react-native/setup`) so it only
 * runs once.
 */
export function withSetupFirst(own: string, user: string | string[] | undefined): string[] {
  const userFiles = user === undefined ? [] : Array.isArray(user) ? user : [user];
  const isOwn = (f: string) =>
    f === own || /(^|[\\/])vitest-react-native[\\/](setup|dist[\\/]setup(\.c?js)?)$/.test(f);
  return [own, ...userFiles.filter((f) => !isOwn(f))];
}

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
    config(config): UserConfig {
      // The setup file must run before any user setup file: those commonly
      // require('react-native') or mock RN libraries, which needs the globals
      // and mocks in place. Vite would append a returned setupFiles after the
      // user's, so prepend it on the user config directly.
      const test = ((config as { test?: { setupFiles?: string | string[] } }).test ??= {});
      test.setupFiles = withSetupFirst(setupFile, test.setupFiles);
      return {
        resolve: {
          extensions,
          conditions: ['react-native'],
        },
        test: {
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
    async resolveId(source, importer, resolveOptions) {
      if (!importer) return;

      // RN 0.87's "exports" map blocks deep imports like
      // `react-native/src/private/…`. Metro falls back to file resolution;
      // mirror that for RN packages once Vite's own resolver has given up.
      const spec = splitBareSpecifier(source);
      if (spec && isReactNativePackage(spec.pkg)) {
        let resolved: { id: string } | null = null;
        try {
          resolved = await this.resolve(source, importer, { ...resolveOptions, skipSelf: true });
        } catch {
          // Vite throws for subpaths not listed in "exports"
        }
        return resolved ?? resolveReactNativeDeepImport(source, dirname(importer), extensions) ?? undefined;
      }

      if (!source.startsWith('.') || !importer.includes('node_modules')) return;
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
      const result = esbuild.transformSync(flowStripped, {
        loader: 'jsx',
        sourcefile: id,
      });
      return { code: result.code, map: null };
    },
  };
}

export default reactNative;
