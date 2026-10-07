import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  pruneStaleCacheDirs,
  readFromCache,
  writeToCache,
} from '../../packages/vitest-react-native/src/cache.js';

let tmpRoot: string;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vrn-cache-test-'));
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe('cache primitives', () => {
  it('readFromCache returns null when the file does not exist', () => {
    const target = path.join(tmpRoot, 'missing.js');
    expect(readFromCache(target)).toBeNull();
  });

  it('writeToCache + readFromCache round-trips exact bytes', () => {
    const target = path.join(tmpRoot, 'round-trip.js');
    const payload = 'module.exports = { hello: "world" };\n';
    writeToCache(target, payload);
    expect(readFromCache(target)).toBe(payload);
  });

  it('writeToCache leaves no .tmp file behind on success', () => {
    const target = path.join(tmpRoot, 'no-leftover.js');
    writeToCache(target, 'ok');
    const leftovers = fs
      .readdirSync(tmpRoot)
      .filter((name) => name.endsWith('.tmp'));
    expect(leftovers).toEqual([]);
  });

  it('readFromCache rethrows non-ENOENT errors', () => {
    // EISDIR — read a directory as if it were a file.
    expect(() => readFromCache(tmpRoot)).toThrow();
  });

  it('many concurrent writes to distinct paths all succeed without partial reads', async () => {
    const writers = Array.from({ length: 32 }, (_, i) => i);
    const payload = (i: number): string => `// payload ${i}\n${'x'.repeat(8 * 1024)}\n// end ${i}\n`;

    await Promise.all(
      writers.map(
        (i) =>
          new Promise<void>((resolve) => {
            writeToCache(path.join(tmpRoot, `w-${i}.js`), payload(i));
            resolve();
          }),
      ),
    );

    for (const i of writers) {
      const got = readFromCache(path.join(tmpRoot, `w-${i}.js`));
      expect(got).toBe(payload(i));
    }

    const leftovers = fs
      .readdirSync(tmpRoot)
      .filter((name) => name.endsWith('.tmp'));
    expect(leftovers).toEqual([]);
  });

  it('many concurrent writes to the same path always produce one valid full payload', async () => {
    // The race we are protecting against: two workers transform the same
    // module simultaneously. Both writes must complete with the file ending
    // up as one of the valid full payloads (not partial, not interleaved).
    const target = path.join(tmpRoot, 'contended.js');
    const payloads = Array.from({ length: 16 }, (_, i) =>
      `// variant ${i}\n${'y'.repeat(4 * 1024)}\n// end ${i}\n`,
    );

    await Promise.all(
      payloads.map(
        (p) =>
          new Promise<void>((resolve) => {
            writeToCache(target, p);
            resolve();
          }),
      ),
    );

    const final = readFromCache(target);
    expect(payloads).toContain(final);

    const leftovers = fs
      .readdirSync(tmpRoot)
      .filter((name) => name.endsWith('.tmp'));
    expect(leftovers).toEqual([]);
  });
});

describe('pruneStaleCacheDirs', () => {
  const makeDir = (name: string, ageMs: number) => {
    const dir = path.join(tmpRoot, name);
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'entry.js'), 'x');
    const t = new Date(Date.now() - ageMs);
    fs.utimesSync(dir, t, t);
    return dir;
  };
  const DAY = 24 * 60 * 60 * 1000;

  it('removes other versions that have been idle for longer than maxAge', () => {
    makeDir('old', 2 * DAY);
    pruneStaleCacheDirs(tmpRoot, 'current');
    expect(fs.existsSync(path.join(tmpRoot, 'old'))).toBe(false);
  });

  it('keeps recently used dirs of other versions (concurrent runs)', () => {
    makeDir('other-run', 60 * 1000);
    pruneStaleCacheDirs(tmpRoot, 'current');
    expect(fs.existsSync(path.join(tmpRoot, 'other-run', 'entry.js'))).toBe(true);
  });

  it('never removes the current version, however old', () => {
    makeDir('current', 10 * DAY);
    pruneStaleCacheDirs(tmpRoot, 'current');
    expect(fs.existsSync(path.join(tmpRoot, 'current'))).toBe(true);
  });

  it('ignores a missing base dir', () => {
    expect(() => pruneStaleCacheDirs(path.join(tmpRoot, 'nope'), 'current')).not.toThrow();
  });
});
