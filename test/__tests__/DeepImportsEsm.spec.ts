import { test, expect } from 'vitest';
// RN 0.87's "exports" map no longer lists src/private/*. Metro still resolves
// such deep imports, so the plugin's resolveId falls back to the file.
// @ts-expect-error -- src/private is outside RN's exported types
import * as ReactNativeFeatureFlags from 'react-native/src/private/featureflags/ReactNativeFeatureFlags';

test('ESM deep import of a path missing from react-native "exports" resolves', () => {
  expect(ReactNativeFeatureFlags.enableNativeCSSParsing()).toBe(false);
});
