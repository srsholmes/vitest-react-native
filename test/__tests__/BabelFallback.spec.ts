import { describe, expect, it } from 'vitest';

import {
  babelToolchainVersions,
  missingToolchainMessage,
  resolveBabelToolchain,
  transformWithBabel,
} from '../../packages/vitest-react-native/src/babel.js';

/**
 * The fallback's resolution and error path, which a suite running inside a project that
 * HAS Babel cannot otherwise reach.
 */

/**
 * A project with no Babel installed. Injected rather than simulated with a fake path:
 * inside a Vitest worker, bare specifiers resolve against the Vitest project whatever
 * paths they are handed, so a nonexistent root still finds this repo's own @babel/core.
 */
const noBabel = () =>
  ({
    resolve: () => {
      throw Object.assign(new Error('Cannot find module'), { code: 'MODULE_NOT_FOUND' });
    },
  }) as unknown as NodeJS.Require;

describe('resolveBabelToolchain', () => {
  it('finds the toolchain in a project that has it', () => {
    const toolchain = resolveBabelToolchain(process.cwd());

    expect(toolchain).not.toBeNull();
    expect(typeof toolchain?.transformSync).toBe('function');
    expect(toolchain?.preset).toMatch(/@react-native[/\\]babel-preset/);
    expect(toolchain?.flowEnums).toMatch(/babel-plugin-transform-flow-enums/);
  });

  it('returns null when the project has no Babel toolchain', () => {
    expect(resolveBabelToolchain('/app', noBabel)).toBeNull();
  });
});

describe('babelToolchainVersions', () => {
  it('reports both versions so they can key the transform cache', () => {
    expect(babelToolchainVersions(process.cwd())).toMatch(/^b\d+\.\d+\.\d+-p\d+\.\d+\.\d+/);
  });

  it('returns null when the project has no Babel toolchain', () => {
    expect(babelToolchainVersions('/app', noBabel)).toBeNull();
  });
});

describe('missingToolchainMessage', () => {
  it("keeps esbuild's own error and names what to install", () => {
    const message = missingToolchainMessage('/app/Thing.js', 'Transform failed: Unexpected "enum"');

    expect(message).toContain('Transform failed: Unexpected "enum"');
    expect(message).toContain('/app/Thing.js');
    expect(message).toContain('@babel/core');
    expect(message).toContain('@react-native/babel-preset');
  });
});

describe('transformWithBabel', () => {
  const toolchain = resolveBabelToolchain(process.cwd());
  // The preset enables Flow's parser plugins from the pragma, so the source needs one.
  const flow = (body: string) => `/**\n * @flow strict-local\n * @format\n */\n\n${body}`;

  it('lowers an enum declaration instead of deleting it', () => {
    const code = transformWithBabel(
      toolchain!,
      flow('export enum Mode {\n  Visible = 0,\n}\n'),
      '/app/Mode.js'
    );

    // The declaration survives: something still defines Mode, rather than only
    // referencing it.
    expect(code).toMatch(/Mode/);
    expect(code).not.toMatch(/\benum\s+Mode\b/);
  });

  it('lowers component syntax', () => {
    const code = transformWithBabel(
      toolchain!,
      flow('export component Thing(label: string) {\n  return null;\n}\n'),
      '/app/Thing.js'
    );

    expect(code).not.toMatch(/\bcomponent\s+Thing\b/);
    expect(code).toMatch(/Thing/);
  });

  it('emits CommonJS, since the require hook cannot take ESM', () => {
    const code = transformWithBabel(toolchain!, flow('export const value = 1;\n'), '/app/v.js');

    expect(code).toMatch(/exports/);
    expect(code).not.toMatch(/^export /m);
  });
});
