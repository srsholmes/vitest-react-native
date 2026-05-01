import crypto from 'node:crypto';
import fs from 'fs';

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
