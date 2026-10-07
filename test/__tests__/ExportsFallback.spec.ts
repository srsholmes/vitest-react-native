import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  isReactNativePackage,
  splitBareSpecifier,
} from '../../packages/vitest-react-native/src/resolve.js';

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

describe('isReactNativePackage', () => {
  it.each(['react-native', '@react-native/virtualized-lists'])('accepts %s', (pkg) => {
    expect(isReactNativePackage(pkg)).toBe(true);
  });

  it.each(['react-native-svg', '@react-navigation/native', 'lodash'])('rejects %s', (pkg) => {
    expect(isReactNativePackage(pkg)).toBe(false);
  });
});

describe('exports fallback (installed by setup)', () => {
  let tmp: string;

  // node_modules/<name> with `exports` exposing only ".", plus a hidden file.
  const writeStrictPackage = (root: string, name: string) => {
    const pkgDir = path.join(root, 'node_modules', name);
    fs.mkdirSync(path.join(pkgDir, 'internal'), { recursive: true });
    fs.writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({ name, exports: { '.': './index.js' } })
    );
    fs.writeFileSync(path.join(pkgDir, 'index.js'), 'module.exports = "root";');
    fs.writeFileSync(path.join(pkgDir, 'internal', 'deep.js'), `module.exports = "${root}";`);
  };

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vrn-exports-'));
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('resolves an RN package subpath blocked by "exports" to the file, like Metro', () => {
    writeStrictPackage(tmp, '@react-native/fixture');
    const req = createRequire(path.join(tmp, 'entry.js'));
    expect(req('@react-native/fixture')).toBe('root');
    expect(req('@react-native/fixture/internal/deep')).toBe(tmp);
  });

  it('keeps Node’s strict behaviour for non-RN packages', () => {
    writeStrictPackage(tmp, 'strict-pkg');
    const req = createRequire(path.join(tmp, 'entry.js'));
    expect(() => req('strict-pkg/internal/deep')).toThrow(
      expect.objectContaining({ code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' })
    );
  });

  it('rethrows the original exports error when the file does not exist either', () => {
    writeStrictPackage(tmp, '@react-native/fixture');
    const req = createRequire(path.join(tmp, 'entry.js'));
    expect(() => req('@react-native/fixture/missing')).toThrow(
      expect.objectContaining({ code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' })
    );
  });

  it('honours require.resolve paths', () => {
    const a = path.join(tmp, 'a');
    const b = path.join(tmp, 'b');
    writeStrictPackage(a, '@react-native/fixture');
    writeStrictPackage(b, '@react-native/fixture');
    const req = createRequire(path.join(a, 'entry.js'));
    expect(req.resolve('@react-native/fixture/internal/deep', { paths: [b] })).toBe(
      fs.realpathSync(path.join(b, 'node_modules/@react-native/fixture/internal/deep.js'))
    );
  });

  // RN 0.87: @react-native/virtualized-lists deep-imports
  // react-native/src/private/featureflags/ReactNativeFeatureFlags.
  it('loads VirtualizedSectionList', () => {
    const { VirtualizedSectionList } = require('react-native');
    expect(VirtualizedSectionList).toBeDefined();
  });
});
