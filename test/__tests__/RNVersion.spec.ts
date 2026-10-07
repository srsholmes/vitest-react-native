import { describe, it, expect } from 'vitest';

import { isRNBefore, parseRNVersion } from '../../packages/vitest-react-native/src/version.js';

describe('parseRNVersion', () => {
  it.each([
    ['0.87.1', { major: 0, minor: 87, patch: 1 }],
    ['0.88.0-rc.4', { major: 0, minor: 88, patch: 0 }],
    ['0.89.0-nightly-20261007-30e2d93b4', { major: 0, minor: 89, patch: 0 }],
    ['1.0.0', { major: 1, minor: 0, patch: 0 }],
  ])('parses %s', (input, expected) => {
    expect(parseRNVersion(input)).toEqual(expected);
  });

  it('treats 0.0.0 nightlies as newer than any release', () => {
    expect(isRNBefore(parseRNVersion('0.0.0-20261007-1234-abc'), 1, 0)).toBe(false);
  });

  it('returns null for unparseable versions', () => {
    expect(parseRNVersion('unknown')).toBeNull();
  });
});

describe('isRNBefore', () => {
  it.each([
    ['0.86.3', 0, 87, true],
    ['0.87.0', 0, 87, false],
    ['0.88.0-rc.4', 0, 87, false],
    ['1.0.0', 0, 87, false],
    ['1.2.0', 1, 3, true],
  ])('%s before %i.%i → %s', (version, major, minor, expected) => {
    expect(isRNBefore(parseRNVersion(version), major, minor)).toBe(expected);
  });

  it('treats an unknown version as current', () => {
    expect(isRNBefore(null, 0, 87)).toBe(false);
  });
});
