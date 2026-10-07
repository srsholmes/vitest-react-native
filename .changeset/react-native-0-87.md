---
'@srsholmes/vitest-react-native': minor
---

Support React Native 0.87.

- Resolve deep imports that RN 0.87's package `exports` map no longer allows (e.g. `react-native/src/private/...`) by falling back to plain file resolution, as Metro does. RN's own `@react-native/virtualized-lists` still deep-imports `src/private`, so without this `VirtualizedSectionList` failed to load.
- Upgrade `flow-remove-types` to parse the Flow syntax RN 0.87 ships (`readonly` variance and friends).
- Add the 30 feature flags introduced in RN 0.84–0.87 to the `ReactNativeFeatureFlags` mock. RN reads them via `import * as`, which bypasses the Proxy fallback, so new flags were `undefined`.
- Mirror APIs React Native has removed, based on the installed version: `StatusBar.setBackgroundColor` / `setNetworkActivityIndicatorVisible` / `setTranslucent` (0.87) and `StyleSheet.absoluteFillObject` (0.85) are no longer mocked on those versions, so tests fail like the app would. `InteractionManager` throws RN's removal error on 0.87.
- `Platform.constants.reactNativeVersion` and `PlatformConstants` now report the installed RN version instead of a hard-coded 0.83.

Not yet supported: the `unstable_*` / `experimental_*` exports written in Flow `component` / `enum` syntax (`unstable_VirtualView`, `unstable_VirtualColumn`/`Row`, `unstable_createVirtualCollectionView`, `VirtualViewMode`, `experimental_LayoutConformance`).
