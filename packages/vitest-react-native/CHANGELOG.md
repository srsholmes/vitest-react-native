# @srsholmes/vitest-react-native

## 0.3.0

### Minor Changes

- e49e70c: Fix four mock-fidelity defects and add an export smoke test.
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

- 8155167: Fix ref forwarding: a `ref` to a component now resolves instead of staying `null`.

  The component mocks passed `ref` **inside the props object** of the host element they
  render — `React.createElement('View', { ...props, ref })` — where React does not consume
  it as a ref. It stayed a plain prop, so `ref.current` was always `null`,
  `TextInput.focus()` was unreachable, and `ref={null}` appeared in every snapshot. Only the
  class-based mocks (`ScrollView`, `Modal`, `FlatList`, …) worked, by accident of being
  classes, which is why this went unnoticed: no test in the repo exercised a ref.

  Affected, and now fixed: `View`, `Text`, `TextInput`, `Image`, `ImageBackground`,
  `ActivityIndicator`, `KeyboardAvoidingView`, `RefreshControl`, `SafeAreaView`,
  `Pressable`, `Switch` and the `Touchable*` family.

  Each now hands `useImperativeHandle` an object carrying React Native's `NativeMethods`:

  ```tsx
  const input = useRef<TextInput>(null);
  input.current?.focus();
  input.current?.isFocused(); // true
  ```

  - `measure`, `measureInWindow` and `measureLayout` call back with zeros — nothing in a
    Node test environment has a real layout, the same choice React Native's own Jest mock
    made. All are `vi.fn()` spies, so calls can be asserted.
  - `setNativeProps`, `focus` and `blur` are spies.
  - `TextInput` adds `isFocused()`, `clear()` and `setSelection(start, end)`, and tracks
    focus state across `focus()` and `blur()`.

  **Snapshots change.** Removing `ref` from props drops `ref={null}` from every rendered
  element, which collapses tags that had no other props — `<Text ref={null}>` becomes
  `<Text>`. 30 snapshot files in this repo were regenerated; yours will need the same
  (`vitest -u`). No other content changed.

  Mirrored into the Jest parity baseline, where `mockForwardRef` had the identical defect
  and the `mockNativeMethods` helper it should have been using was defined but never wired
  up.

- 73b17e0: Mount the `refreshControl` prop, so pull-to-refresh can be tested.

  `refreshControl` takes an element, which React Native mounts as part of the scrollable.
  The mocks passed it straight through as a prop instead, so it was never mounted: it did
  not render, nothing inside it was queryable, and it serialised into snapshots as an
  unmounted element sitting in props.

  Fixed on `ScrollView`, `FlatList`, `SectionList` and `VirtualizedList`. The lists had the
  same defect because `refreshControl` fell into the props they spread onto their host
  element.

  The payoff is that the control is now in the tree, so there is something to fire an event
  on:

  ```tsx
  const onRefresh = vi.fn();
  const { getByTestId } = render(
    <FlatList
      data={items}
      renderItem={renderItem}
      refreshControl={<RefreshControl testID="refresh" refreshing={false} onRefresh={onRefresh} />}
    />
  );

  fireEvent(getByTestId('refresh'), 'refresh');
  expect(onRefresh).toHaveBeenCalledTimes(1);
  ```

  **Snapshots change only where a `refreshControl` is passed.** The control moves out of the
  props and in as the scrollable's first child. Scrollables without one are untouched —
  mounting is branched on the prop being present specifically so their children keep the
  shape they had. One snapshot changed in this repo.

  The existing tests for this never caught it because they only ever asserted that the
  _scrollable_ rendered, never the control.

- 2f1959f: Add a public test-helpers API, and make `Keyboard`, `AppState` and `Appearance` stateful.

  ```ts
  import {
    setPlatform,
    setDimensions,
    setColorScheme,
    mockNativeModule,
    resetAllMocks,
  } from '@srsholmes/vitest-react-native/helpers';
  ```

  - `setPlatform('android')` switches `Platform.OS` and `Version`; `select()` already reads
    `OS` at call time, so it follows.
  - `setDimensions({ width, height })` merges into the current size and notifies change
    listeners; `useWindowDimensions()` reports it.
  - `setColorScheme('dark')` drives `Appearance.getColorScheme()`, `useColorScheme()` and
    change listeners together. `'auto'` returns to `'light'` — there is no system appearance
    to follow in a test.
  - `mockNativeModule(name, impl)` stands in for a native module, reaching **both**
    `NativeModules[name]` and `TurboModuleRegistry.get`/`getEnforcing`. Modern React Native
    libraries read the latter, so covering only `NativeModules` would miss most of them.
  - `resetAllMocks()` restores every stateful mock at once. It deliberately leaves spy call
    history alone — Vitest owns that through its `clearMocks` / `mockReset` options, and
    resetting implementations here would drop the ones the mocks were built with.

  **Mocks that now hold state.** `Appearance.setColorScheme()` was a no-op that never
  changed `getColorScheme()`, and `Keyboard`/`AppState` discarded every listener handed to
  them, so none of these could be exercised in a test:
  - `Appearance` — the scheme is real, listeners fire, and `useColorScheme()` plus
    `NativeAppearance` both read through it rather than keeping their own copies. The three
    previously disagreed the moment any of them changed.
  - `Keyboard` — listeners fire, `isVisible()`/`metrics()` track state, and `dismiss()`
    hides the keyboard as it does on a device. `_show(height)` and `_hide()` simulate
    events; `metrics()` still returns `null` when hidden.
  - `AppState` — `currentState` is now a getter backed by state, listeners fire, and
    `_setState(state)` simulates a transition. It fires `'change'` handlers only, since
    `'focus'`/`'blur'` are Android window-focus events rather than app-state transitions.
  - `Platform` joined the reset registry, so `resetAllMocks()` restores `OS` and `Version`.

  Every stateful mock registers its own reset hook as it loads, so resetting them does not
  depend on a hand-maintained list that falls behind when a mock is added.

  **One behaviour correction:** `Appearance.setColorScheme('auto')` (and its deprecated
  spelling `'unspecified'`) now resolves to `'light'` instead of being stored and handed
  back from `getColorScheme()`, which only ever returns `'light' | 'dark' | null` in React
  Native. If you asserted the old pass-through, update to expect `'light'`.

### Patch Changes

- b2a34be: Load React Native modules written in Flow's modern `enum` / `component` / `hook` syntax.

  `flow-remove-types` erases type annotations but passes those _declarations_ through
  untouched, after which esbuild fails to parse them — so the modules could not be loaded at
  all. The transform now falls back to React Native's own Babel preset, which lowers them,
  on the original source rather than the stripped output.

  The fallback is lazy and optional: it runs only for a file esbuild rejects, and it needs
  `@babel/core` plus `@react-native/babel-preset` to resolve from your project — they ship
  with every React Native app. Without them you get an error naming both, and only for the
  affected modules; everything else keeps using the Babel-free path. Projects that never
  touch these modules are unaffected.

  In React Native 0.87 this fixes `experimental_LayoutConformance`, `VirtualViewMode` and
  the four `unstable_Virtual*` exports, which previously threw on access.

  The enum plugin is applied ahead of the preset deliberately: the preset merges
  strip-types before its own enum handling, which deletes `export enum Foo {}` and leaves a
  `ReferenceError` at runtime instead of a parse failure.

  Also fixes `NativeComponentRegistry.get()` and `getWithFallback_DEPRECATED()`, which
  called the `requireNativeComponent` mock's module namespace instead of its `.default` and
  threw "requireNativeComponent is not a function". Nothing loaded that path until these
  modules started compiling.

  The transform cache directory is now keyed by the resolved `@babel/core` and preset
  versions, so a toolchain upgrade cannot serve output built by the previous one. Existing
  caches are invalidated once.

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
