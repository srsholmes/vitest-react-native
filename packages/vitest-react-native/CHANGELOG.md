# @srsholmes/vitest-react-native

## 0.1.4

### Patch Changes

- 7d0b1c2: Fix `ReactNativeFeatureFlags` mock missing own-properties (#24).

  The Proxy-only mock left every flag except `isLayoutAnimationEnabled` absent as an own-property, so named imports, `Object.keys`, and object spreads could miss `enableNativeCSSParsing` and the other ~100 flags. Now enumerates every flag from RN 0.83 with its real default (booleans, the numeric `preparedTextCacheSize`/`viewCullingOutsetRatio`/`virtualViewHysteresisRatio`/`virtualViewPrerenderRatio`, the string `virtualViewActivityBehavior`, and `override`). The Proxy fallback remains so flags added in future RN releases still degrade to `() => false`.

## 0.1.3

### Patch Changes

- c428ae9: Fix toBeDisabled()/toBeEnabled() matchers by mapping disabled prop to accessibilityState.disabled on all interactive components. Add resolveId hook for extensionless TypeScript imports from node_modules.
