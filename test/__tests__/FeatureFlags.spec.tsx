import { test, expect, describe } from 'vitest';

/**
 * Issues #13 and #24: ReactNativeFeatureFlags missing functions
 *
 * Every flag from the current RN release is an explicit own-property so named
 * imports, Object.keys, and spreads work. The Proxy fallback keeps unknown /
 * future flags returning () => false without a setup.ts update.
 */
describe('ReactNativeFeatureFlags', () => {
  test('known boolean flags are callable with correct defaults', () => {
    const flags = require('react-native/src/private/featureflags/ReactNativeFeatureFlags');
    expect(flags.enableNativeCSSParsing()).toBe(false);
    expect(flags.isLayoutAnimationEnabled()).toBe(true);
    expect(flags.enableLayoutAnimationsOnIOS()).toBe(true);
    expect(flags.enableFabricRenderer()).toBe(false);
    expect(flags.useTurboModules()).toBe(false);
  });

  test('non-boolean flags return correct default types', () => {
    const flags = require('react-native/src/private/featureflags/ReactNativeFeatureFlags');
    expect(flags.preparedTextCacheSize()).toBe(200);
    expect(flags.virtualViewPrerenderRatio()).toBe(5);
    expect(flags.virtualViewActivityBehavior()).toBe('no-activity');
  });

  test('flags are own properties (Object.keys / spread / for...in)', () => {
    const flags = require('react-native/src/private/featureflags/ReactNativeFeatureFlags');
    const keys = Object.keys(flags);
    expect(keys).toContain('enableNativeCSSParsing');
    expect(keys).toContain('isLayoutAnimationEnabled');
    expect(keys.length).toBeGreaterThan(50);
    const spread = { ...flags };
    expect(typeof spread.enableNativeCSSParsing).toBe('function');
  });

  test('unknown/future flags return () => false automatically', () => {
    const flags = require('react-native/src/private/featureflags/ReactNativeFeatureFlags');
    expect(flags.someFutureFlag()).toBe(false);
    expect(flags.anotherNewFeature()).toBe(false);
  });

  test('turbo module proxy handles any flag name', () => {
    const proxy = (globalThis as Record<string, unknown>).__turboModuleProxy as (
      name: string,
    ) => Record<string, unknown> | null;
    const flagModule = proxy('NativeReactNativeFeatureFlagsCxx');
    expect(flagModule).toBeDefined();
    expect(typeof (flagModule as Record<string, unknown>).enableNativeCSSParsing).toBe('function');
    expect(typeof (flagModule as Record<string, unknown>).anyFutureFlag).toBe('function');
  });
});
