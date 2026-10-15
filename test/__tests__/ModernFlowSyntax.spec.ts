import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

/**
 * React Native writes a growing number of modules in Flow's modern declaration
 * syntax — `enum`, `component` and `hook`. `flow-remove-types` erases type
 * annotations only and passes those declarations through untouched, after which
 * esbuild fails on them, so the modules could not be loaded at all until the
 * transform gained its Babel fallback.
 *
 * These are the exports whose modules use that syntax today. All of them are
 * experimental, but the syntax is spreading, so this is the coverage that matters
 * for the next React Native release rather than for current application code.
 *
 * None of them exist before React Native 0.86, and CI runs a 0.85 leg, so each test
 * is gated on the installed version actually exporting the name.
 */

const require_ = createRequire(import.meta.url);

const MODERN_SYNTAX_EXPORTS = [
  'experimental_LayoutConformance',
  'unstable_VirtualView',
  'unstable_VirtualColumn',
  'unstable_VirtualRow',
  'unstable_createVirtualCollectionView',
  'VirtualViewMode',
];

/** The export names the installed React Native defines, from its own index.js. */
const installedExports = (): Set<string> => {
  const pkgPath = require_.resolve('react-native/package.json');
  const main = (require_(pkgPath) as { main?: string }).main ?? 'index.js';
  const source = fs.readFileSync(path.resolve(path.dirname(pkgPath), main), 'utf-8');
  return new Set([...source.matchAll(/^ {2}get (\w+)\(\)/gm)].map((match) => match[1]));
};

const present = installedExports();
const has = (name: string) => present.has(name);

describe('modern Flow syntax', () => {
  for (const name of MODERN_SYNTAX_EXPORTS) {
    // Reported as skipped rather than passing vacuously, so a version that does not
    // export the name cannot look like coverage.
    it.skipIf(!has(name))(`${name} is accessible`, () => {
      const ReactNative = require_('react-native') as Record<string, unknown>;

      expect(() => ReactNative[name]).not.toThrow();
      expect(ReactNative[name]).toBeDefined();
    });
  }

  // The declaration must survive, not just parse. React Native's Babel preset merges
  // strip-types ahead of its own enum handling, which deletes `export enum Foo {}`
  // while leaving the code that references Foo — a module that parses and then throws
  // ReferenceError. Asserting a member proves the enum itself came through.
  it.skipIf(!has('VirtualViewMode'))(
    'keeps enum members rather than deleting the declaration',
    () => {
      const { VirtualViewMode } = require_('react-native') as {
        VirtualViewMode: Record<string, number>;
      };

      expect(VirtualViewMode.Visible).toBe(0);
      expect(VirtualViewMode.Prerender).toBe(1);
      expect(VirtualViewMode.Hidden).toBe(2);
    }
  );
});
