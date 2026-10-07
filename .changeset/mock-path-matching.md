---
'@srsholmes/vitest-react-native': patch
---

Fix `KeyboardAvoidingView` and `ImageBackground` resolving to the wrong mock (#31).

Mocks were looked up by substring match, first registered wins, so `Keyboard/Keyboard` also matched `KeyboardAvoidingView.js` and `KeyboardAvoidingView` resolved to the Keyboard API object ("Element type is invalid … got: object"). Likewise `ImageBackground` got the `Image` mock. The most specific match now wins, and filenames are normalised so mocks also match Windows paths.

Behaviour changes:

- Snapshots containing `ImageBackground` or `KeyboardAvoidingView` now render those element names instead of `Image` / `View`.
- `ImageBackground` no longer carries `Image`'s statics (`getSize`, `prefetch`, …), matching real React Native.
- The `ViewNativeComponent` mock now exports no-op `Commands` (`focus`, `blur`, `hotspotUpdate`, `setPressed`).
