import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

/**
 * Touches every public React Native export and fails when one that used to work
 * stops working.
 *
 * This plugin keeps React Native's real `index.js`, so it has no "missing export"
 * problem — every name RN exports is reachable. What it can have is an export whose
 * underlying module no longer loads: a mock that drifted, or a file whose syntax the
 * Flow strip + esbuild pipeline cannot handle. Both surface as a throw on property
 * access, which nothing else in this suite would catch.
 *
 * The two allowlists below record the exports that are known not to work. They are
 * asserted in both directions, so an entry that starts working fails the test and has
 * to be removed — the list cannot quietly go stale.
 */

const require_ = createRequire(import.meta.url);

/**
 * Exports whose module cannot be compiled by `flow-remove-types` + esbuild.
 *
 * `flow-remove-types` erases type annotations only: it passes Flow's `enum`, `component`
 * and `hook` DECLARATIONS through untouched, and esbuild then fails on them
 * (`Unexpected "enum"`). React Native's own Babel preset is the only transformer that
 * lowers them. Every entry here is experimental or private API, so nothing an app should
 * import — but React Native is migrating core components to `component` syntax, so this
 * list is the early-warning signal for when that reaches exports people do use.
 */
const FLOW_SYNTAX_UNSUPPORTED = new Set([
  'VirtualViewMode',
  'experimental_LayoutConformance',
  'unstable_VirtualColumn',
  'unstable_VirtualRow',
  'unstable_VirtualView',
  'unstable_createVirtualCollectionView',
]);

/**
 * Exports that resolve to `undefined` rather than throwing.
 *
 * `Networking` and `unstable_NativeText` are private internals. `PlatformColor` is
 * public and documented, so its `undefined` is a real gap worth closing separately.
 */
const KNOWN_UNDEFINED = new Set(['Networking', 'PlatformColor', 'unstable_NativeText']);

/**
 * Names the parser must find, and the floor it must clear. React Native defines its
 * exports as getters on `module.exports`; if it ever stops, this parser would find
 * nothing and every assertion below would vacuously pass. Fail loudly instead.
 */
const REQUIRED_EXPORTS = ['View', 'Text', 'Platform', 'StyleSheet', 'NativeModules'];
const MINIMUM_EXPORTS = 50;

const reactNativeIndexSource = (): string => {
  const pkgPath = require_.resolve('react-native/package.json');
  const main = (require_(pkgPath) as { main?: string }).main ?? 'index.js';
  return fs.readFileSync(path.resolve(path.dirname(pkgPath), main), 'utf-8');
};

/** `  get Button(): Button {` → `Button`. Two-space indent, as RN writes them. */
const parseExportNames = (source: string): string[] =>
  [...new Set([...source.matchAll(/^ {2}get (\w+)\(\)/gm)].map((match) => match[1]))].sort();

const exportNames = parseExportNames(reactNativeIndexSource());

/** Access every export once, recording how each one behaves. */
const touchExports = () => {
  const ReactNative = require_('react-native') as Record<string, unknown>;
  const threw: string[] = [];
  const undef: string[] = [];
  for (const name of exportNames) {
    try {
      if (ReactNative[name] === undefined) undef.push(name);
    } catch {
      threw.push(name);
    }
  }
  return { threw, undef };
};

describe('React Native export surface', () => {
  it('parses React Native exports', () => {
    expect(exportNames.length).toBeGreaterThanOrEqual(MINIMUM_EXPORTS);
    for (const name of REQUIRED_EXPORTS) {
      expect(exportNames).toContain(name);
    }
  });

  it('no export throws on access', () => {
    const { threw } = touchExports();
    expect(threw.filter((name) => !FLOW_SYNTAX_UNSUPPORTED.has(name))).toEqual([]);
  });

  it('no export is undefined', () => {
    const { undef } = touchExports();
    expect(undef.filter((name) => !KNOWN_UNDEFINED.has(name))).toEqual([]);
  });

  it('allowlisted exports still need their allowance', () => {
    const { threw, undef } = touchExports();
    // Only names this React Native version actually exports: CI runs 0.85 and 0.87, and
    // several of the experimental ones do not exist on 0.85.
    const present = (names: Set<string>) => [...names].filter((n) => exportNames.includes(n));
    expect(present(FLOW_SYNTAX_UNSUPPORTED).filter((n) => !threw.includes(n))).toEqual([]);
    expect(present(KNOWN_UNDEFINED).filter((n) => !undef.includes(n))).toEqual([]);
  });
});
