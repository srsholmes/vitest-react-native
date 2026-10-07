import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  cacheFileName,
  hashSetupSources,
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
    const leftovers = fs.readdirSync(tmpRoot).filter((name) => name.endsWith('.tmp'));
    expect(leftovers).toEqual([]);
  });

  it('readFromCache rethrows non-ENOENT errors', () => {
    // EISDIR — read a directory as if it were a file.
    expect(() => readFromCache(tmpRoot)).toThrow();
  });

  it('many concurrent writes to distinct paths all succeed without partial reads', async () => {
    const writers = Array.from({ length: 32 }, (_, i) => i);
    const payload = (i: number): string =>
      `// payload ${i}\n${'x'.repeat(8 * 1024)}\n// end ${i}\n`;

    await Promise.all(
      writers.map(
        (i) =>
          new Promise<void>((resolve) => {
            writeToCache(path.join(tmpRoot, `w-${i}.js`), payload(i));
            resolve();
          })
      )
    );

    for (const i of writers) {
      const got = readFromCache(path.join(tmpRoot, `w-${i}.js`));
      expect(got).toBe(payload(i));
    }

    const leftovers = fs.readdirSync(tmpRoot).filter((name) => name.endsWith('.tmp'));
    expect(leftovers).toEqual([]);
  });

  it('many concurrent writes to the same path always produce one valid full payload', async () => {
    // The race we are protecting against: two workers transform the same
    // module simultaneously. Both writes must complete with the file ending
    // up as one of the valid full payloads (not partial, not interleaved).
    const target = path.join(tmpRoot, 'contended.js');
    const payloads = Array.from(
      { length: 16 },
      (_, i) => `// variant ${i}\n${'y'.repeat(4 * 1024)}\n// end ${i}\n`
    );

    await Promise.all(
      payloads.map(
        (p) =>
          new Promise<void>((resolve) => {
            writeToCache(target, p);
            resolve();
          })
      )
    );

    const final = readFromCache(target);
    expect(payloads).toContain(final);

    const leftovers = fs.readdirSync(tmpRoot).filter((name) => name.endsWith('.tmp'));
    expect(leftovers).toEqual([]);
  });
});

describe('cacheFileName', () => {
  const file = '/app/node_modules/react-native/Libraries/Text/Text.js';

  it('keeps the basename for readability and is a single path segment', () => {
    const name = cacheFileName(file, 'code');
    expect(name.startsWith('Text.js_')).toBe(true);
    expect(name).not.toMatch(/[\\/:]/);
  });

  it('is stable for the same file and source', () => {
    expect(cacheFileName(file, 'code')).toBe(cacheFileName(file, 'code'));
  });

  it('changes when the source changes (e.g. patch-package)', () => {
    expect(cacheFileName(file, 'a')).not.toBe(cacheFileName(file, 'b'));
  });

  it('distinguishes same-named files in different directories', () => {
    expect(cacheFileName('/a/Text.js', 'code')).not.toBe(cacheFileName('/b/Text.js', 'code'));
  });

  it('stays short for deeply nested paths outside the project root', () => {
    const deep = `${'/very-long-directory-name'.repeat(40)}/node_modules/react-native/index.js`;
    expect(cacheFileName(deep, 'code').length).toBeLessThan(100);
  });

  it('handles Windows paths on another drive', () => {
    const name = cacheFileName('D:\\store\\react-native\\index.js', 'code');
    expect(name.startsWith('index.js_')).toBe(true);
    expect(name).not.toMatch(/[\\/:]/);
  });
});

describe('hashSetupSources', () => {
  it('hashes a bundled file on its own', () => {
    const bundle = path.join(tmpRoot, 'setup.js');
    fs.writeFileSync(bundle, 'one');
    const before = hashSetupSources(bundle);
    fs.writeFileSync(path.join(tmpRoot, 'other.js'), 'unrelated');
    expect(hashSetupSources(bundle)).toBe(before);
    fs.writeFileSync(bundle, 'two');
    expect(hashSetupSources(bundle)).not.toBe(before);
  });

  it('includes sibling .ts modules when running from source', () => {
    const entry = path.join(tmpRoot, 'setup.ts');
    fs.writeFileSync(entry, 'setup');
    fs.writeFileSync(path.join(tmpRoot, 'mocks.ts'), 'v1');
    const before = hashSetupSources(entry);
    fs.writeFileSync(path.join(tmpRoot, 'mocks.ts'), 'v2');
    expect(hashSetupSources(entry)).not.toBe(before);
  });
});
