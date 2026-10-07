import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { describe, it, expect, afterEach } from 'vitest';

import { splitBareSpecifier } from '../../packages/vitest-react-native/src/resolve.js';

describe('splitBareSpecifier', () => {
  it.each([
    ['react-native/src/x/y', { pkg: 'react-native', subpath: 'src/x/y' }],
    [
      '@react-native/virtualized-lists/Lists/X',
      { pkg: '@react-native/virtualized-lists', subpath: 'Lists/X' },
    ],
  ])('splits %s', (request, expected) => {
    expect(splitBareSpecifier(request)).toEqual(expected);
  });

  it.each(['react-native', '@scope/pkg', './rel', '../rel', '/abs/path', 'node:fs'])(
    'ignores %s',
    (request) => {
      expect(splitBareSpecifier(request)).toBeNull();
    }
  );
});

describe('exports fallback (installed by setup)', () => {
  let tmp: string | undefined;
  afterEach(() => {
    if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('resolves a subpath blocked by "exports" to the file, like Metro', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vrn-exports-'));
    const pkgDir = path.join(tmp, 'node_modules', 'strict-pkg');
    fs.mkdirSync(path.join(pkgDir, 'internal'), { recursive: true });
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({ name: 'strict-pkg', exports: { '.': './index.js' } })
    );
    fs.writeFileSync(path.join(pkgDir, 'index.js'), 'module.exports = "root";');
    fs.writeFileSync(path.join(pkgDir, 'internal', 'deep.js'), 'module.exports = "deep";');

    const req = createRequire(path.join(tmp, 'entry.js'));
    expect(req('strict-pkg')).toBe('root');
    expect(req('strict-pkg/internal/deep')).toBe('deep');
  });

  it('still throws for subpaths that do not exist', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vrn-exports-'));
    const pkgDir = path.join(tmp, 'node_modules', 'strict-pkg');
    fs.mkdirSync(pkgDir, { recursive: true });
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({ name: 'strict-pkg', exports: { '.': './index.js' } })
    );
    const req = createRequire(path.join(tmp, 'entry.js'));
    expect(() => req('strict-pkg/missing')).toThrow(/Cannot find module/);
  });

  // RN 0.87: @react-native/virtualized-lists deep-imports
  // react-native/src/private/featureflags/ReactNativeFeatureFlags.
  it('loads VirtualizedSectionList', () => {
    const { VirtualizedSectionList } = require('react-native');
    expect(VirtualizedSectionList).toBeDefined();
  });
});
