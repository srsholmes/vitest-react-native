import { describe, expect, it } from 'vitest';

/**
 * Globals React Native's own runtime installs on device, which library code reads at
 * module scope. A missing one fails at import time, before any test body runs, so it
 * surfaces as an unrelated-looking crash rather than a failed assertion.
 */

const g = globalThis as Record<string, unknown>;

describe('React Native globals', () => {
  it('installs ErrorUtils', () => {
    // Expo's Expo.fx calls ErrorUtils.getGlobalHandler() while loading, so without this
    // any Expo import dies with "ErrorUtils is not defined".
    const errorUtils = g.ErrorUtils as Record<string, unknown> | undefined;

    expect(errorUtils).toBeDefined();
    expect(typeof errorUtils?.setGlobalHandler).toBe('function');
    expect(typeof errorUtils?.getGlobalHandler).toBe('function');
    expect(typeof errorUtils?.reportError).toBe('function');
  });

  it('installs __fbBatchedBridgeConfig', () => {
    const config = g.__fbBatchedBridgeConfig as Record<string, unknown> | undefined;

    expect(config).toBeDefined();
    expect(Array.isArray(config?.remoteModuleConfig)).toBe(true);
    expect(Array.isArray(config?.localModulesConfig)).toBe(true);
  });

  it('marks the environment as a React Native test environment', () => {
    expect(g.__DEV__).toBe(true);
    expect(g.IS_REACT_NATIVE_TEST_ENVIRONMENT).toBe(true);
  });
});
