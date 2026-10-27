# @srsholmes/vitest-react-native

[![CI](https://github.com/srsholmes/vitest-react-native/actions/workflows/ci.yml/badge.svg)](https://github.com/srsholmes/vitest-react-native/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@srsholmes/vitest-react-native.svg)](https://www.npmjs.com/package/@srsholmes/vitest-react-native)

Run your React Native component tests in [Vitest](https://vitest.dev/) — no emulator or device required.

> **Attribution**: This project is based on the original work by [Vladimir Sheremet](https://github.com/sheremet-va) at [sheremet-va/vitest-react-native](https://github.com/sheremet-va/vitest-react-native). Thank you for creating the foundation that made this possible!

## Features

- **Fast** — Run tests in Node.js without building native code
- **Full React Native API support** — Mocks for all core components and APIs
- **Tracks React Native's supported releases** — see [Supported React Native versions](#supported-react-native-versions)
- **Works with @testing-library/react-native** — Use familiar testing patterns
- **TypeScript support** — Full type definitions included

## Installation

```bash
npm install -D @srsholmes/vitest-react-native vitest @testing-library/react-native
# or
yarn add -D @srsholmes/vitest-react-native vitest @testing-library/react-native
# or
pnpm add -D @srsholmes/vitest-react-native vitest @testing-library/react-native
```

## Quick Start

### 1. Configure Vitest

Create or update your `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { reactNative } from '@srsholmes/vitest-react-native';

export default defineConfig({
  plugins: [react(), reactNative()],
  test: {
    globals: true,
    environment: 'node',
  },
});
```

### 2. Write Your First Test

```tsx
// Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';

const Button = ({ onPress, title }: { onPress: () => void; title: string }) => (
  <Pressable onPress={onPress} testID="button">
    <Text>{title}</Text>
  </Pressable>
);

describe('Button', () => {
  it('calls onPress when pressed', () => {
    const onPress = vi.fn();
    const { getByTestId } = render(<Button onPress={onPress} title="Click me" />);

    fireEvent.press(getByTestId('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Run Tests

```bash
npx vitest
```

## Configuration

### Plugin Options

```typescript
import { reactNative } from '@srsholmes/vitest-react-native';

reactNative({
  // Add custom file extensions to resolve
  additionalExtensions: ['.custom.ts'],
});
```

### Manual Setup (Alternative)

If you prefer not to use the plugin, you can configure manually:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: [
      '.ios.ts',
      '.ios.tsx',
      '.native.ts',
      '.native.tsx',
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.json',
    ],
    conditions: ['react-native'],
  },
  test: {
    setupFiles: ['@srsholmes/vitest-react-native/setup'],
    globals: true,
    environment: 'node',
    server: {
      deps: {
        external: ['react-native'],
      },
    },
  },
});
```

## Supported React Native APIs

### Components

All core React Native components are mocked and render as testable elements:

| Component                | Status |
| ------------------------ | ------ |
| View                     | ✅     |
| Text                     | ✅     |
| Image                    | ✅     |
| TextInput                | ✅     |
| ScrollView               | ✅     |
| FlatList                 | ✅     |
| SectionList              | ✅     |
| VirtualizedList          | ✅     |
| Pressable                | ✅     |
| TouchableOpacity         | ✅     |
| TouchableHighlight       | ✅     |
| TouchableWithoutFeedback | ✅     |
| TouchableNativeFeedback  | ✅     |
| Modal                    | ✅     |
| ActivityIndicator        | ✅     |
| Button                   | ✅     |
| Switch                   | ✅     |
| RefreshControl           | ✅     |
| StatusBar                | ✅     |
| KeyboardAvoidingView     | ✅     |
| SafeAreaView             | ✅     |
| ImageBackground          | ✅     |
| InputAccessoryView       | ✅     |
| DrawerLayoutAndroid      | ✅     |

### Component instance methods

A `ref` to any of these components resolves to an object carrying React Native's
`NativeMethods`, so code that reaches for an instance works:

```tsx
const input = useRef<TextInput>(null);
const view = useRef<View>(null);

input.current?.focus();
input.current?.isFocused(); // true
view.current?.measure((x, y, width, height, pageX, pageY) => {
  /* ... */
});
```

| Method                                    | Notes                                                           |
| ----------------------------------------- | --------------------------------------------------------------- |
| `measure(cb)`                             | Calls back with `(x, y, width, height, pageX, pageY)`, all zero |
| `measureInWindow(cb)`                     | Calls back with `(x, y, width, height)`, all zero               |
| `measureLayout(node, onSuccess, onFail?)` | Calls `onSuccess(0, 0, 0, 0)`                                   |
| `setNativeProps(props)`                   | A spy; records the call                                         |
| `focus()` / `blur()`                      | Spies. On `TextInput` they also drive `isFocused()`             |

Measurements report zeros because nothing in a Node test environment has a real layout —
the same choice React Native's own Jest mock made. They are `vi.fn()` spies, so you can
assert they were called.

`TextInput` adds `isFocused()`, `clear()` and `setSelection(start, end)` on top, and
tracks focus state across `focus()` and `blur()`.

### APIs

| API                | Status | Notes                                            |
| ------------------ | ------ | ------------------------------------------------ |
| Animated           | ✅     | Full animation API with timing, spring, etc.     |
| StyleSheet         | ✅     | create, flatten, compose, etc.                   |
| Platform           | ✅     | OS detection, select, etc.                       |
| Dimensions         | ✅     | get, set, addEventListener (stateful)            |
| PixelRatio         | ✅     | get, getFontScale, etc.                          |
| Linking            | ✅     | openURL, canOpenURL, etc.                        |
| Alert              | ✅     | alert, prompt                                    |
| Share              | ✅     | share                                            |
| Keyboard           | ✅     | dismiss, addListener, isVisible (stateful)       |
| AppState           | ✅     | currentState, addEventListener (stateful)        |
| Clipboard          | ✅     | getString, setString                             |
| Vibration          | ✅     | vibrate, cancel                                  |
| BackHandler        | ✅     | addEventListener, exitApp                        |
| PermissionsAndroid | ✅     | request, check, requestMultiple                  |
| ToastAndroid       | ✅     | show, showWithGravity                            |
| ActionSheetIOS     | ✅     | showActionSheetWithOptions                       |
| AccessibilityInfo  | ✅     | Full accessibility API                           |
| Appearance         | ✅     | get/setColorScheme, addChangeListener (stateful) |
| LayoutAnimation    | ✅     | configureNext, create, Presets                   |
| InteractionManager | ✅     | runAfterInteractions (removed in RN 0.87)        |
| PanResponder       | ✅     | create                                           |
| NativeEventEmitter | ✅     | addListener, removeAllListeners                  |

### Hooks

| Hook                | Status |
| ------------------- | ------ |
| useWindowDimensions | ✅     |
| useColorScheme      | ✅     |

## Test helpers

Import from `@srsholmes/vitest-react-native/helpers` to drive the mocks from a test.

```tsx
import { afterEach } from 'vitest';
import {
  setPlatform,
  setDimensions,
  setColorScheme,
  mockNativeModule,
  resetAllMocks,
} from '@srsholmes/vitest-react-native/helpers';

afterEach(() => {
  resetAllMocks();
});

test('renders the Android layout', () => {
  setPlatform('android');
  // Platform.OS is 'android', and Platform.select() follows
});

test('adapts to a narrow screen', () => {
  setDimensions({ width: 320, height: 568 });
  // Dimensions.get('window') and useWindowDimensions() both report it,
  // and Dimensions change listeners fire
});

test('renders in dark mode', () => {
  setColorScheme('dark');
  // Appearance.getColorScheme() and useColorScheme() both report 'dark'
});

test('reads from a native module', () => {
  mockNativeModule('MyModule', { getValue: () => 42 });
  // Visible through NativeModules.MyModule and TurboModuleRegistry.getEnforcing('MyModule')
});
```

| Helper                                                 | What it does                                                                                                                                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setPlatform('ios' \| 'android')`                      | Sets `Platform.OS` and `Version`. `Platform.select()` reads `OS` when called, so it follows.                                                                                                      |
| `setDimensions({ width, height, scale?, fontScale? })` | Merges into the current size, so passing only `width` keeps the height. Notifies `Dimensions` change listeners, and `useWindowDimensions()` reports it.                                           |
| `setColorScheme('light' \| 'dark' \| 'auto')`          | Sets the scheme and notifies `Appearance` change listeners. `useColorScheme()` reads through `Appearance`, so it follows. `'auto'` returns to `'light'`: there is no system appearance to follow. |
| `mockNativeModule(name, impl)`                         | Stands in for a native module, reaching both `NativeModules[name]` and `TurboModuleRegistry.get`/`getEnforcing`.                                                                                  |
| `resetAllMocks()`                                      | Restores every stateful mock to its resting values and drops registered listeners and native-module stand-ins.                                                                                    |

Helpers must be imported from a test file, where the plugin's require hook is active —
importing them from a config file or plain Node will fail on React Native's Flow syntax.

### Simulating events

The stateful mocks expose their own hooks for events a device would raise. These are not
part of React Native's API, so they are prefixed with `_`:

```tsx
import { Keyboard, AppState, Dimensions } from 'react-native';

(Keyboard as any)._show(336); // fires keyboardDidShow listeners
(Keyboard as any)._hide(); // fires keyboardDidHide listeners
(AppState as any)._setState('background'); // fires 'change' listeners
Dimensions.set({ window: { width: 500, height: 900 } }); // fires change listeners
```

Every one of them is undone by `resetAllMocks()`, and each stateful mock also exposes
`_reset()` individually.

### What `resetAllMocks()` does not do

It does not clear spy call history. Vitest already owns that through its own `clearMocks`
and `mockReset` options, and resetting implementations here would drop the ones the mocks
were built with:

```ts
export default defineConfig({
  test: { clearMocks: true }, // for call history
});
```

## Example Test Patterns

### Testing Async Operations

```tsx
import { render, waitFor } from '@testing-library/react-native';

it('loads data asynchronously', async () => {
  const { getByText } = render(<DataComponent />);

  await waitFor(() => {
    expect(getByText('Loaded')).toBeTruthy();
  });
});
```

### Testing with fireEvent

```tsx
import { render, fireEvent } from '@testing-library/react-native';

it('updates text on input change', () => {
  const { getByTestId } = render(<Form />);
  const input = getByTestId('name-input');

  fireEvent.changeText(input, 'John Doe');

  expect(input.props.value).toBe('John Doe');
});
```

### Snapshot Testing

```tsx
it('matches snapshot', () => {
  const { toJSON } = render(<MyComponent />);
  expect(toJSON()).toMatchSnapshot();
});
```

## Supported React Native versions

This package follows React Native's own [support policy](https://github.com/reactwg/react-native-releases/blob/main/docs/support.md): it supports the releases React Native marks as **Active** or **End of Cycle**. When React Native moves a release to Unsupported, a later minor release of this package may drop it.

| `@srsholmes/vitest-react-native` | React Native |
| -------------------------------- | ------------ |
| 0.2.x                            | 0.85 – 0.87  |
| 0.1.x                            | 0.79 – 0.84  |

On an older React Native, stay on the matching version of this package (for example `npm install -D @srsholmes/vitest-react-native@0.1`).

While this package is below 1.0, a minor bump (0.1 → 0.2) signals breaking changes, such as dropping React Native versions; patch releases are always compatible. `^0.1.x` will never install 0.2.

Mocks follow the installed React Native version: APIs React Native has removed (for example `InteractionManager` and the `StatusBar.setBackgroundColor` / `setTranslucent` / `setNetworkActivityIndicatorVisible` setters in 0.87) are not mocked on versions where they no longer exist, so tests fail the same way the app would.

## Requirements

- Node.js 20.19.4+ (React Native 0.87 itself requires Node.js 22.13+)
- React 19.2.3+
- React Native — see [Supported React Native versions](#supported-react-native-versions)
- Vitest 4+
- Vite 6+
- `@babel/core` and `@react-native/babel-preset` — optional, and already present in any
  React Native project. Needed only to load React Native modules written in Flow's
  modern `enum` / `component` / `hook` syntax; see
  [Flow syntax errors](#flow-syntax-errors).

## Troubleshooting

### "Cannot find module 'react-native'"

Ensure `react-native` is in your `devDependencies` and the plugin is properly configured.

### Flow syntax errors

The setup file automatically strips Flow types from React Native source files. If you encounter issues, ensure the setup file is loaded first in your `setupFiles` array.

Type stripping handles annotations, but not Flow's `enum`, `component` and `hook`
_declarations_ — React Native's own Babel preset is the only thing that lowers those. When
a React Native module uses them, the transform falls back to that preset automatically,
provided `@babel/core` and `@react-native/babel-preset` resolve from your project (they
ship with every React Native app). Without them you get an error naming both, and only for
the modules that need them — everything else keeps using the faster Babel-free path.

In React Native 0.87 this affects `experimental_LayoutConformance`, `VirtualViewMode` and
the `unstable_Virtual*` exports. The syntax is spreading through React Native's source, so
expect it to cover more over time.

### Component not rendering

Make sure you're using `@testing-library/react-native` for rendering, not `@testing-library/react`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

```bash
# Clone the repo
git clone https://github.com/srsholmes/vitest-react-native.git

# Install dependencies
pnpm install

# Run tests
pnpm test

# Run linting
pnpm lint

# Format code
pnpm format
```

## License

MIT

## Credits

- Original implementation by [Vladimir Sheremet](https://github.com/sheremet-va) — [sheremet-va/vitest-react-native](https://github.com/sheremet-va/vitest-react-native)
- Vitest team for the amazing test framework
- React Native team for the mobile framework
