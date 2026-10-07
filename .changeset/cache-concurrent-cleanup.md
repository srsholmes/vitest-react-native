---
'@srsholmes/vitest-react-native': patch
---

Fix intermittent `ENOENT` failures when several test runs share the transform cache.

On startup each run deleted every cache directory except its own version's. When runs with different cache versions overlapped (for example monorepo apps on different React Native versions testing in parallel), one run removed the directory another was writing to, and its tests failed with `ENOENT … .tmp`. Other versions' directories are now only removed after a day of inactivity, each run marks its own directory as in use, and a failed cache write falls back to the uncached transform instead of failing the test.
