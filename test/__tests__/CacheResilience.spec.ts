import fs from 'fs';
import os from 'os';
import path from 'path';
import { test, expect } from 'vitest';

// Another test run (e.g. a different RN version in the same monorepo) can
// remove this run's cache dir. Transforming a not-yet-loaded RN module must
// still work: the cache write fails, but the module loads uncached.
test('loads React Native modules after the cache dir is removed', () => {
  fs.rmSync(path.join(os.tmpdir(), 'vrn'), { recursive: true, force: true });
  const deepDiffer = require('react-native/Libraries/Utilities/differ/deepDiffer');
  expect(typeof (deepDiffer.default ?? deepDiffer)).toBe('function');
});
