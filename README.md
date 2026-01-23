# @srsholmes/vitest-react-native

[![CI](https://github.com/srsholmes/vitest-react-native/actions/workflows/ci.yml/badge.svg)](https://github.com/srsholmes/vitest-react-native/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@srsholmes/vitest-react-native.svg)](https://www.npmjs.com/package/@srsholmes/vitest-react-native)

Run your React Native component tests in [Vitest](https://vitest.dev/) — no emulator or device required.

> **Attribution**: This project is based on the original work by [Vladimir Sheremet](https://github.com/sheremet-va) at [sheremet-va/vitest-react-native](https://github.com/sheremet-va/vitest-react-native). Thank you for creating the foundation that made this possible!

## Features

- **Fast** — Run tests in Node.js without building native code
- **Full React Native API support** — Mocks for all core components and APIs
- **Compatible with React Native 0.72+** — Supports modern React Native architecture
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

### APIs

| API                | Status | Notes                                        |
| ------------------ | ------ | -------------------------------------------- |
| Animated           | ✅     | Full animation API with timing, spring, etc. |
| StyleSheet         | ✅     | create, flatten, compose, etc.               |
| Platform           | ✅     | OS detection, select, etc.                   |
| Dimensions         | ✅     | get, addEventListener                        |
| PixelRatio         | ✅     | get, getFontScale, etc.                      |
| Linking            | ✅     | openURL, canOpenURL, etc.                    |
| Alert              | ✅     | alert, prompt                                |
| Share              | ✅     | share                                        |
| Keyboard           | ✅     | dismiss, addListener, etc.                   |
| AppState           | ✅     | currentState, addEventListener               |
| Clipboard          | ✅     | getString, setString                         |
| Vibration          | ✅     | vibrate, cancel                              |
| BackHandler        | ✅     | addEventListener, exitApp                    |
| PermissionsAndroid | ✅     | request, check, requestMultiple              |
| ToastAndroid       | ✅     | show, showWithGravity                        |
| ActionSheetIOS     | ✅     | showActionSheetWithOptions                   |
| AccessibilityInfo  | ✅     | Full accessibility API                       |
| Appearance         | ✅     | getColorScheme, addChangeListener            |
| LayoutAnimation    | ✅     | configureNext, create, Presets               |
| InteractionManager | ✅     | runAfterInteractions                         |
| PanResponder       | ✅     | create                                       |
| NativeEventEmitter | ✅     | addListener, removeAllListeners              |

### Hooks

| Hook                | Status |
| ------------------- | ------ |
| useWindowDimensions | ✅     |
| useColorScheme      | ✅     |

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

## Requirements

- Node.js 18+
- React 18+
- React Native 0.72+
- Vitest 1+
- Vite 5+

## Troubleshooting

### "Cannot find module 'react-native'"

Ensure `react-native` is in your `devDependencies` and the plugin is properly configured.

### Flow syntax errors

The setup file automatically strips Flow types from React Native source files. If you encounter issues, ensure the setup file is loaded first in your `setupFiles` array.

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
