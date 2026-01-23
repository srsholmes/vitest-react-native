# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

This is the main `vitest-react-native` npm package. It provides a Vite plugin and setup file that enables testing React Native components in Vitest.

## Entry Points

- **Main export** (`vitest-react-native`) - The Vite plugin from `plugin.ts`
- **Setup export** (`vitest-react-native/setup`) - The test setup from `setup.ts`

## Files

### `plugin.ts`

Vite plugin that configures:

- File extension resolution order (prioritizes `.ios.ts`, `.native.ts` variants)
- Package.json `react-native` condition for exports field resolution
- Marks `react-native` as external to prevent bundling

### `setup.ts`

Test environment setup that must run before tests:

1. **Globals setup** - Creates `__DEV__`, `__turboModuleProxy`, `requestAnimationFrame`, etc.
2. **Flow stripping** - Uses `pirates` to intercept require() and `flow-remove-types` to strip Flow annotations from RN source
3. **Component mocks** - All RN components (View, Text, etc.) become simple React components
4. **API mocks** - All RN APIs (Animated, Linking, etc.) become vi.fn() spies

## Adding New Mocks

When React Native adds new components or APIs, add mocks to `setup.ts`:

- Components: Add to `modules` object as a React functional component
- APIs: Add to `modules` object with appropriate mock functions using `vi.fn()`

## Build

```bash
pnpm build  # Runs tsc to compile to dist/
```
