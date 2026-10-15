import fs from 'fs';
import os from 'os';
import path from 'path';
import { test, expect } from 'vitest';

// Another test run (e.g. a different RN version in the same monorepo) can
// remove this run's cache dir. Transforming a not-yet-loaded RN module must
// still work: the cache write fails, but the module loads uncached.
test('loads React Native modules after the cache dir is removed', () => {
  // The other workers in this run are writing into the same shared cache dir, so a
  // file can appear between rm's readdir and its rmdir. `force` only swallows ENOENT,
  // not ENOTEMPTY, so retry and then tolerate it: what this test asserts is that the
  // transform survives losing its cache, and a concurrent writer re-creating an entry
  // is the very condition it is simulating.
  try {
    fs.rmSync(path.join(os.tmpdir(), 'vrn'), {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 50,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOTEMPTY') throw error;
  }
  const deepDiffer = require('react-native/Libraries/Utilities/differ/deepDiffer');
  expect(typeof (deepDiffer.default ?? deepDiffer)).toBe('function');
});
