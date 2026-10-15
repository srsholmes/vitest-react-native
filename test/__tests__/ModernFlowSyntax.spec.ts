import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

/**
 * React Native writes a growing number of modules in Flow's modern declaration
 * syntax — `enum`, `component` and `hook`. `flow-remove-types` erases type
 * annotations only and passes those declarations through untouched, after which
 * esbuild fails on them, so the modules cannot be loaded at all.
 *
 * These are the exports whose modules use that syntax today. All of them are
 * experimental, but the syntax is spreading, so this is the coverage that matters
 * for the next React Native release rather than for current application code.
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

describe('modern Flow syntax', () => {
  it.each(MODERN_SYNTAX_EXPORTS)('%s is accessible', (name) => {
    const ReactNative = require_('react-native') as Record<string, unknown>;

    expect(() => ReactNative[name]).not.toThrow();
    expect(ReactNative[name]).toBeDefined();
  });

  // The declaration must survive, not just parse. React Native's Babel preset merges
  // strip-types ahead of its own enum handling, which deletes `export enum Foo {}`
  // while leaving the code that references Foo — a module that parses and then throws
  // ReferenceError. Asserting a member proves the enum itself came through.
  it('keeps enum members rather than deleting the declaration', () => {
    const { VirtualViewMode } = require_('react-native') as {
      VirtualViewMode: Record<string, number>;
    };

    expect(VirtualViewMode.Visible).toBe(0);
    expect(VirtualViewMode.Prerender).toBe(1);
    expect(VirtualViewMode.Hidden).toBe(2);
  });
});
