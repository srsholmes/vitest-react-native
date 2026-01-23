# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a pnpm monorepo that provides Vitest support for React Native. It allows running React Native component tests in Vitest without a native device or emulator.

## Commands

```bash
# Run all tests
pnpm test:run

# Run tests in watch mode
pnpm test

# Run a single test file
pnpm test:run test/__tests__/Button.spec.tsx

# Run tests matching a pattern
pnpm test:run -t "renders correctly"

# Lint
pnpm lint
pnpm lint:fix

# Format
pnpm format
pnpm format:check

# Type check
pnpm typecheck

# Build the plugin
pnpm build
```

## Architecture

### Monorepo Structure

- `packages/vitest-react-native/` - The main plugin package (publishable as `vitest-react-native`)
- `apps/example-app/` - Example React Native components demonstrating usage with react-native-reanimated
- `test/` - Tests for the plugin's React Native component mocks

### How the Plugin Works

The plugin has two main parts:

1. **`plugin.ts`** - Vite plugin that configures module resolution for React Native:
   - Sets up file extension resolution order (`.ios.ts`, `.native.ts`, etc.)
   - Adds `react-native` condition for package.json exports
   - Marks `react-native` as external dependency

2. **`setup.ts`** - Test environment setup that runs before tests:
   - Sets up required globals (`__DEV__`, `__turboModuleProxy`, `requestAnimationFrame`, etc.)
   - Uses `pirates` to intercept `require()` calls and strip Flow types from React Native JS files via `flow-remove-types`
   - Mocks all React Native components (View, Text, Image, etc.) as functional React components
   - Mocks all React Native APIs (Animated, Linking, Alert, etc.) with vi.fn() spies

### Test Setup Files

- `packages/vitest-react-native/src/setup.ts` - Core mocks for react-native module
- `apps/example-app/test-setup.ts` - Mocks for react-native-reanimated (app-specific, not in core plugin)

### Test File Locations

- Plugin mocks tests: `test/__tests__/*.spec.tsx`
- Example app tests: `apps/example-app/__tests__/*.test.tsx`

## Key Implementation Details

- React Native's Flow-typed JS files are transformed at runtime using pirates hooks
- Components render as simple divs/spans with data-testid for testing
- The Animated API is fully mocked with timing/spring/etc. functions that call callbacks immediately
- Platform-specific APIs (BackHandler, ToastAndroid, ActionSheetIOS) are mocked appropriately
