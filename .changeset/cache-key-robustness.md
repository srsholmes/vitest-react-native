---
'@srsholmes/vitest-react-native': patch
---

Make transform cache file names robust.

Cache entries were named after the module's path relative to `cwd`, so they could hit `ENAMETOOLONG` when `node_modules` sits far outside the project (monorepos, symlinked stores) and contained a `:` when a Windows project and its dependencies are on different drives. Entries are now named `<basename>_<hash>`, where the hash covers the full path and the source, which also invalidates the cache when a dependency is patched in place (e.g. with patch-package).
