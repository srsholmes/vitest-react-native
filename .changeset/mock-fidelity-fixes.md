---
'@srsholmes/vitest-react-native': minor
---

Fix four mock-fidelity defects and add an export smoke test.

- `Platform.select` now reads `Platform.OS` when it is called. It was hardcoded to the
  `ios` key, so a test that set `Platform.OS = 'android'` still received the iOS value
  from every `select()`. Key presence still wins over value, matching React Native's own
  `Platform.ios.js`, so `select({ ios: undefined, default: 'D' })` is still `undefined`.
- `Dimensions.set()` now updates state and notifies `addEventListener` handlers, and
  `Dimensions.get()` returns a copy. `set()` was a no-op and handlers were discarded, so
  rotation and responsive-layout tests could not be written. A `_reset()` hook restores
  the resting state between tests.
- `useWindowDimensions()` now reads `Dimensions` when called, so the hook and
  `Dimensions.get('window')` can no longer disagree. It does not subscribe, so an update
  does not itself trigger a re-render.
- `ErrorUtils` and `__fbBatchedBridgeConfig` are now installed. `ErrorUtils` is read at
  module scope by Expo's `Expo.fx`, so Expo imports previously failed before any test
  ran. `globalThis.window` is now only assigned when it is absent, instead of replacing
  an existing one.
- `DeviceEventEmitter` gained a `_reset()` hook. It is a module-level singleton, so a
  listener registered in one test stayed subscribed for the rest of the file.

**Breaking:** `fontScale` is now `1` rather than `2`, in `Dimensions.get()`,
`PixelRatio.getFontScale()`, `useWindowDimensions()` and `DeviceInfo.getConstants()`. The
old value described a device with text size at 200%, which silently doubled any
`fontScale`-based layout maths. Tests asserting `fontScale === 2` need updating. Width,
height and `scale` are unchanged.
