# @srsholmes/vitest-react-native

## 0.2.0

### Minor Changes

- 268633a: Support React Native 0.87, and follow React Native's support policy.

  **Breaking:** the supported React Native range is now the releases React Native itself supports (Active and End of Cycle): **0.85 – 0.87**. Peer dependencies are now `react-native >=0.85` and `react >=19.2.3`, and Node.js `>=20.19.4`. On React Native 0.79 – 0.84, keep using `@srsholmes/vitest-react-native@0.1`.
  - Resolve deep imports that RN 0.87's package `exports` map no longer allows (e.g. `react-native/src/private/...`) by falling back to the file, as Metro does. This applies to `require()` and to ESM `import`s in test files, and only to `react-native` and `@react-native/*` packages. RN's own `@react-native/virtualized-lists` still deep-imports `src/private`, so without this `VirtualizedSectionList` failed to load.
  - Run the plugin's setup file before any user `setupFiles`. It was appended after them, so user setup code that touched React Native ran before the environment was ready.
  - Upgrade `flow-remove-types` to parse the Flow syntax RN 0.87 ships (`readonly` variance and friends).
  - Add the 30 feature flags introduced in RN 0.84 – 0.87 to the `ReactNativeFeatureFlags` mock. RN reads them via `import * as`, which bypasses the Proxy fallback, so new flags were `undefined`.
  - Mirror APIs React Native has removed, based on the installed version: on 0.87, `StatusBar.setBackgroundColor` / `setNetworkActivityIndicatorVisible` / `setTranslucent` are no longer mocked and `InteractionManager` throws React Native's removal error. `StyleSheet.absoluteFillObject` (removed in 0.85) is no longer mocked.
  - Read the React Native version from the project rather than the plugin's install location, and report it from `Platform.constants.reactNativeVersion` / `PlatformConstants` instead of a hard-coded 0.83.

  Not yet supported: the `unstable_*` / `experimental_*` exports written in Flow `component` / `enum` syntax (`unstable_VirtualView`, `unstable_VirtualColumn` / `Row`, `unstable_createVirtualCollectionView`, `VirtualViewMode`, `experimental_LayoutConformance`).

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
