---
'@srsholmes/vitest-react-native': minor
---

Add a public test-helpers API, and make `Keyboard`, `AppState` and `Appearance` stateful.

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
