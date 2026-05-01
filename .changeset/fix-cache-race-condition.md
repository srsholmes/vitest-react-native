---
'@srsholmes/vitest-react-native': patch
---

Fix race condition in transform cache under parallel Vitest workers (#23).

- Atomic cache writes via tmp+rename so concurrent readers never see partial bytes.
- Cache key now includes a content hash of `setup.ts`, so editing the plugin (e.g. adding a new mock) invalidates the cache automatically.
- Removed the destructive end-of-setup cache wipe that ran in every worker — the new content-hashed key makes it unnecessary, and removing it eliminates the worst cross-worker `unlink`-vs-read race.
