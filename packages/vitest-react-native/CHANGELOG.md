# @srsholmes/vitest-react-native

## 0.1.6

### Patch Changes

- c594093: Fix intermittent `ENOENT` failures when several test runs share the transform cache.

  On startup each run deleted every cache directory except its own version's. When runs with different cache versions overlapped (for example monorepo apps on different React Native versions testing in parallel), one run removed the directory another was writing to, and its tests failed with `ENOENT … .tmp`. Other versions' directories are now only removed after a day of inactivity, each run marks its own directory as in use, and a failed cache write falls back to the uncached transform instead of failing the test.

- 645796a: Make transform cache file names robust.

  Cache entries were named after the module's path relative to `cwd`, so they could hit `ENAMETOOLONG` when `node_modules` sits far outside the project (monorepos, symlinked stores) and contained a `:` when a Windows project and its dependencies are on different drives. Entries are now named `<basename>_<hash>`, where the hash covers the full path and the source, which also invalidates the cache when a dependency is patched in place (e.g. with patch-package).

- 1ead419: Fix `KeyboardAvoidingView` and `ImageBackground` resolving to the wrong mock (#31).

  Mocks were looked up by substring match, first registered wins, so `Keyboard/Keyboard` also matched `KeyboardAvoidingView.js` and `KeyboardAvoidingView` resolved to the Keyboard API object ("Element type is invalid … got: object"). Likewise `ImageBackground` got the `Image` mock. The most specific match now wins, and filenames are normalised so mocks also match Windows paths.

  Behaviour changes:
  - Snapshots containing `ImageBackground` or `KeyboardAvoidingView` now render those element names instead of `Image` / `View`.
  - `ImageBackground` no longer carries `Image`'s statics (`getSize`, `prefetch`, …), matching real React Native.
  - The `ViewNativeComponent` mock now exports no-op `Commands` (`focus`, `blur`, `hotspotUpdate`, `setPressed`).

## 0.1.5

### Patch Changes

- 6e842a1: Fix race condition in transform cache under parallel Vitest workers (#23).
  - Atomic cache writes via tmp+rename so concurrent readers never see partial bytes.
  - Cache key now includes a content hash of `setup.ts`, so editing the plugin (e.g. adding a new mock) invalidates the cache automatically.
  - Removed the destructive end-of-setup cache wipe that ran in every worker — the new content-hashed key makes it unnecessary, and removing it eliminates the worst cross-worker `unlink`-vs-read race.

## 0.1.4

### Patch Changes

- 7d0b1c2: Fix `ReactNativeFeatureFlags` mock missing own-properties (#24).

  The Proxy-only mock left every flag except `isLayoutAnimationEnabled` absent as an own-property, so named imports, `Object.keys`, and object spreads could miss `enableNativeCSSParsing` and the other ~100 flags. Now enumerates every flag from RN 0.83 with its real default (booleans, the numeric `preparedTextCacheSize`/`viewCullingOutsetRatio`/`virtualViewHysteresisRatio`/`virtualViewPrerenderRatio`, the string `virtualViewActivityBehavior`, and `override`). The Proxy fallback remains so flags added in future RN releases still degrade to `() => false`.

## 0.1.3

### Patch Changes

- c428ae9: Fix toBeDisabled()/toBeEnabled() matchers by mapping disabled prop to accessibilityState.disabled on all interactive components. Add resolveId hook for extensionless TypeScript imports from node_modules.
