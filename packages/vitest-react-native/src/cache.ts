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
  const tmp = `${cachePath}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
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

// Cache file name for a transformed module: readable basename plus a hash of
// the full path and source. Hashing the path keeps the name a short single
// segment (no ENAMETOOLONG when node_modules sits far outside cwd, no `:` from
// a Windows drive letter); hashing the source invalidates entries when a
// dependency is patched in place (e.g. patch-package) without a version bump.
export const cacheFileName = (filename: string, code: string): string => {
  const p = filename.replace(/\\/g, '/');
  const hash = crypto.createHash('sha1').update(p).update('\0').update(code).digest('hex');
  return `${p.slice(p.lastIndexOf('/') + 1)}_${hash.slice(0, 16)}`;
};

// Hash of the setup code, used in the cache key so editing any mock
// invalidates the cache. The published build bundles everything into
// dist/setup.{js,cjs}, so that file alone suffices; running from source
// (src/setup.ts) also has to cover the sibling modules it imports.
export const hashSetupSources = (entryPath: string): string => {
  const hash = crypto.createHash('sha1');
  const files = entryPath.endsWith('.ts')
    ? fs
        .readdirSync(path.dirname(entryPath))
        .filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
        .sort()
        .map((f) => path.join(path.dirname(entryPath), f))
    : [entryPath];
  for (const file of files) {
    hash.update(file.slice(file.lastIndexOf(path.sep) + 1)).update('\0');
    hash.update(fs.readFileSync(file)).update('\0');
  }
  return hash.digest('hex').slice(0, 12);
};
