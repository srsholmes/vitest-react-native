import { createRequire } from 'module';
import path from 'path';

/**
 * The Babel fallback for React Native source that esbuild cannot parse.
 *
 * `flow-remove-types` erases type ANNOTATIONS only: Flow's `enum`, `component` and
 * `hook` declarations pass through untouched and esbuild fails on them. React Native's
 * own Babel preset lowers them, so the transform retries there — which also means tests
 * compile those files with the same toolchain the app's Metro build uses.
 *
 * Kept separate from setup.ts so the resolution and the error message can be tested
 * without a project that actually lacks Babel.
 */

export interface BabelToolchain {
  transformSync: (
    code: string,
    options: Record<string, unknown>
  ) => { code?: string | null } | null;
  /** Resolved path to @react-native/babel-preset. */
  preset: string;
  /** Resolved path to babel-plugin-transform-flow-enums. */
  flowEnums: string;
}

/**
 * How a project's `require` is built. Injectable because inside a Vitest worker bare
 * specifiers resolve against the Vitest project whatever paths they are given, so a
 * fake root cannot stand in for a project that has no Babel.
 */
export type CreateRequire = (from: string) => NodeJS.Require;

/** Resolved versions used to key the transform cache, or null when Babel is absent. */
export const babelToolchainVersions = (
  projectRoot: string,
  createRequireFn: CreateRequire = createRequire
): string | null => {
  try {
    const projectRequire = createRequireFn(path.join(projectRoot, 'package.json'));
    const preset = projectRequire('@react-native/babel-preset/package.json').version;
    const core = projectRequire('@babel/core/package.json').version;
    return `b${core}-p${preset}`;
  } catch {
    return null;
  }
};

/**
 * Locate the project's Babel toolchain. Resolved from the project rather than from this
 * package, so the preset is the one the app itself builds with.
 *
 * Returns null when any piece is missing, which is the supported state for a project
 * that never loads React Native's modern-syntax modules.
 */
export const resolveBabelToolchain = (
  projectRoot: string,
  createRequireFn: CreateRequire = createRequire
): BabelToolchain | null => {
  try {
    const projectRequire = createRequireFn(path.join(projectRoot, 'package.json'));
    const { transformSync } = projectRequire('@babel/core');
    const preset = projectRequire.resolve('@react-native/babel-preset');
    // Resolved through the preset, which depends on it, so this adds no dependency of
    // our own. Without it the preset's merged strip-types pass deletes `enum`
    // declarations and the module throws ReferenceError instead of failing to parse.
    const flowEnums = createRequireFn(
      projectRequire.resolve('@react-native/babel-preset/package.json')
    ).resolve('babel-plugin-transform-flow-enums');
    return { transformSync, preset, flowEnums };
  } catch {
    return null;
  }
};

/** What a project without the Babel toolchain is told, with esbuild's own error kept. */
export const missingToolchainMessage = (filename: string, esbuildMessage: string): string =>
  `${esbuildMessage}\n` +
  `[vitest-react-native] ${filename} uses Flow syntax that only React Native's Babel ` +
  `preset can transform. Install '@babel/core' and '@react-native/babel-preset' as ` +
  `devDependencies to load it.`;

/** Compile `code` with the React Native preset. Throws if Babel returns no output. */
export const transformWithBabel = (
  toolchain: BabelToolchain,
  code: string,
  filename: string
): string => {
  const result = toolchain.transformSync(code, {
    filename,
    babelrc: false,
    configFile: false,
    sourceMaps: false,
    // `plugins` run before `presets`. That ordering is the point: the preset merges
    // strip-types ahead of its own enum handling, so naming the enum plugin here is
    // what keeps `export enum Foo {}` from being deleted outright.
    plugins: [toolchain.flowEnums],
    presets: [toolchain.preset],
    // The require hook feeds CommonJS, so the preset must not emit ESM.
    caller: { name: 'vitest-react-native', supportsStaticESM: false },
  });
  if (!result?.code) {
    throw new Error(`[vitest-react-native] Babel returned no output for ${filename}.`);
  }
  return result.code;
};
