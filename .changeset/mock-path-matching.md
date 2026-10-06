---
'@srsholmes/vitest-react-native': patch
---

Fix mocks being shadowed by sibling modules with a shared name prefix (#31).

Mocks were looked up by substring match, first registered wins, so `Keyboard/Keyboard` also matched `KeyboardAvoidingView.js` and `KeyboardAvoidingView` resolved to the Keyboard API object ("Element type is invalid … got: object"). The same applied to `ImageBackground` (got the `Image` mock), `ViewNativeComponent` (got `View`) and `ReactNativeFeatureFlagsBase` (got `ReactNativeFeatureFlags`). The most specific match now wins, and filenames are normalised so mocks also match Windows paths.

Snapshots containing `ImageBackground` or `KeyboardAvoidingView` will now render those element names instead of `Image` / `View`.
