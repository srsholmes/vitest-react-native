# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

Tests for the core vitest-react-native plugin mocks. These tests verify that all mocked React Native components and APIs work correctly.

## Structure

- `__tests__/` - Test files for each React Native component/API (one file per component)
- `src/` - Shared test utilities

## Test Coverage

Tests cover all major React Native exports:

- **Components**: View, Text, Image, TextInput, ScrollView, FlatList, SectionList, Modal, etc.
- **APIs**: Animated, Linking, Alert, Share, Keyboard, Platform, Dimensions, etc.
- **Hooks**: useWindowDimensions, useColorScheme
- **Platform-specific**: BackHandler (Android), ActionSheetIOS, ToastAndroid, etc.

## Adding Tests for New Mocks

When adding a mock to `packages/vitest-react-native/src/setup.ts`, add a corresponding test file here:

1. Create `__tests__/NewComponent.spec.tsx`
2. Test that the component renders without errors
3. Test that key props work (testID, style, onPress, etc.)
4. Test that API methods are callable and return expected mock values

## Running Tests

```bash
pnpm test:run test/__tests__/
```
