export interface RNVersion {
  major: number;
  minor: number;
  patch: number;
}

// Parse a react-native version string. Nightlies published as `0.0.0-<date>`
// are treated as newer than any release. Returns null when unparseable.
export const parseRNVersion = (version: string): RNVersion | null => {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!m) return null;
  const [major, minor, patch] = m.slice(1).map(Number) as [number, number, number];
  if (major === 0 && minor === 0 && patch === 0) {
    return { major: Number.MAX_SAFE_INTEGER, minor: 0, patch: 0 };
  }
  return { major, minor, patch };
};

// True when `version` is older than `major.minor`. An unknown version counts
// as current, so mocks never re-add APIs React Native has removed.
export const isRNBefore = (version: RNVersion | null, major: number, minor: number): boolean =>
  version !== null && (version.major < major || (version.major === major && version.minor < minor));
