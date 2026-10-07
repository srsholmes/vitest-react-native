---
'@srsholmes/vitest-react-native': minor
---

Support React Native 0.87, and follow React Native's support policy.

**Breaking:** the supported React Native range is now the releases React Native itself supports (Active and End of Cycle): **0.85 – 0.87**. Peer dependencies are now `react-native >=0.85` and `react >=19.2.3`, and Node.js `>=20.19.4`. On React Native 0.79 – 0.84, keep using `@srsholmes/vitest-react-native@0.1`.

- Resolve deep imports that RN 0.87's package `exports` map no longer allows (e.g. `react-native/src/private/...`) by falling back to the file, as Metro does. This applies to `require()` and to ESM `import`s in test files, and only to `react-native` and `@react-native/*` packages. RN's own `@react-native/virtualized-lists` still deep-imports `src/private`, so without this `VirtualizedSectionList` failed to load.
- Run the plugin's setup file before any user `setupFiles`. It was appended after them, so user setup code that touched React Native ran before the environment was ready.
- Upgrade `flow-remove-types` to parse the Flow syntax RN 0.87 ships (`readonly` variance and friends).
- Add the 30 feature flags introduced in RN 0.84 – 0.87 to the `ReactNativeFeatureFlags` mock. RN reads them via `import * as`, which bypasses the Proxy fallback, so new flags were `undefined`.
- Mirror APIs React Native has removed, based on the installed version: on 0.87, `StatusBar.setBackgroundColor` / `setNetworkActivityIndicatorVisible` / `setTranslucent` are no longer mocked and `InteractionManager` throws React Native's removal error. `StyleSheet.absoluteFillObject` (removed in 0.85) is no longer mocked.
- Read the React Native version from the project rather than the plugin's install location, and report it from `Platform.constants.reactNativeVersion` / `PlatformConstants` instead of a hard-coded 0.83.

Not yet supported: the `unstable_*` / `experimental_*` exports written in Flow `component` / `enum` syntax (`unstable_VirtualView`, `unstable_VirtualColumn` / `Row`, `unstable_createVirtualCollectionView`, `VirtualViewMode`, `experimental_LayoutConformance`).
