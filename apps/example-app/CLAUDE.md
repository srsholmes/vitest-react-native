# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

Example React Native app demonstrating how to use vitest-react-native with real-world components. This is NOT a runnable React Native app - it's source code used for testing the vitest-react-native plugin.

## Structure

- `src/components/` - React Native components using react-native-reanimated
- `src/hooks/` - Custom hooks for animations
- `__tests__/` - Tests for the example components

## Test Setup

`test-setup.ts` contains mocks for `react-native-reanimated`. This is separate from the main plugin because:

- The core plugin only mocks `react-native`, not third-party animation libraries
- Apps using reanimated should create their own mock (this serves as a reference)

## Components

Components here demonstrate testing patterns for:

- Animated buttons with press feedback
- Todo list with FlatList and state management
- Progress indicators (linear and circular)
- Fade-in animations
- Cards with like button interactions

## Running Tests

From monorepo root:

```bash
pnpm test:run apps/example-app/__tests__/
```
