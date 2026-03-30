import { test, expect, describe } from 'vitest';

/**
 * Issue #14: NativeUIManager.getConstants is not a function
 *
 * PaperUIManager.js calls NativeUIManager.getConstants() which is loaded
 * via TurboModuleRegistry.getEnforcing(). The mock must return an object
 * with callable getConstants().
 */
describe('NativeUIManager (issue #14)', () => {
  test('TurboModuleRegistry.get returns null for unknown modules (preserves JS fallbacks)', () => {
    const proxy = (globalThis as Record<string, unknown>).__turboModuleProxy as (
      name: string,
    ) => Record<string, unknown> | null;
    // get() returns null so RN code can fall back to JS implementations
    expect(proxy('UIManager')).toBeNull();
    expect(proxy('SomeUnknownModule')).toBeNull();
  });

  test('TurboModuleRegistry.getEnforcing returns a safe mock with getConstants', () => {
    const registry = require('react-native/Libraries/TurboModule/TurboModuleRegistry');
    const uiManager = registry.getEnforcing('UIManager');
    expect(uiManager).toBeDefined();
    expect(typeof uiManager.getConstants).toBe('function');
    expect(uiManager.getConstants()).toEqual({});
  });

  test('PaperUIManager loads without crashing', () => {
    expect(() =>
      require('react-native/Libraries/ReactNative/PaperUIManager'),
    ).not.toThrow();
  });

  test('UIManager from react-native is usable', () => {
    const { UIManager } = require('react-native');
    expect(UIManager).toBeDefined();
  });
});
