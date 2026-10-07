import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';

// Single-syscall read — returns null on ENOENT. Collapses the old
// existsSync+readFileSync TOCTOU into one atomic operation, so a concurrent
// unlink between the check and the read can no longer surface as a thrown
// ENOENT.
export const readFromCache = (cachePath: string): string | null => {
  try {
    return fs.readFileSync(cachePath, 'utf-8');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
};

// Atomic write via tmp+rename. POSIX rename is atomic on the same filesystem,
// so concurrent readers either see the old contents (or ENOENT) or the new
// full contents — never a partial write. The unique tmp suffix (pid + random
// bytes) prevents two workers from clobbering each other's tmp file when both
// are writing the same cache key.
export const writeToCache = (cachePath: string, code: string): void => {
  const tmp = `${cachePath}.${process.pid}.${crypto
    .randomBytes(4)
    .toString('hex')}.tmp`;
  fs.writeFileSync(tmp, code);
  try {
    fs.renameSync(tmp, cachePath);
  } catch (e) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
    throw e;
  }
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Remove cache dirs for other versions, but only once they have been idle for
// `maxAgeMs`. Several test runs can share os.tmpdir() with different cache
// versions (e.g. monorepo apps on different RN versions running in parallel);
// deleting a sibling dir unconditionally pulled it out from under a run that
// was still using it. Each run touches its own dir on startup to stay fresh.
export const pruneStaleCacheDirs = (
  base: string,
  keep: string,
  maxAgeMs: number = DAY_MS,
  now: number = Date.now()
): void => {
  let folders: string[];
  try {
    folders = fs.readdirSync(base);
  } catch {
    return;
  }
  for (const folder of folders) {
    if (folder === keep) continue;
    const dir = path.join(base, folder);
    try {
      if (now - fs.statSync(dir).mtimeMs > maxAgeMs) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    } catch {
      /* raced with another run's cleanup — ignore */
    }
  }
};
