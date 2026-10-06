export interface MockEntry {
  path: string;
  code: string;
}

// Mock paths are matched as substrings of the resolved filename, so sibling
// modules (e.g. Keyboard/Keyboard and Keyboard/KeyboardAvoidingView) both
// match the longer file. Pick the longest — most specific — match so a mock
// can't be shadowed by one registered earlier. Paths are normalised first so
// Windows backslash filenames match the forward-slash mock paths.
export const findMock = (entries: MockEntry[], filePath: string): MockEntry | undefined => {
  const p = filePath.replace(/\\/g, '/');
  let best: MockEntry | undefined;
  for (const entry of entries) {
    if (p.includes(entry.path) && (!best || entry.path.length > best.path.length)) {
      best = entry;
    }
  }
  return best;
};
