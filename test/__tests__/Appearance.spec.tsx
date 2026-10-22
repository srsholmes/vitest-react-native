import { describe, test, expect, vi, afterEach } from 'vitest';
import { Appearance, useColorScheme } from 'react-native';

// _reset() is the mock's own hook, not part of React Native's API.
const appearance = Appearance as typeof Appearance & { _reset: () => void };

afterEach(() => {
  appearance._reset();
});

describe('Appearance', () => {
  test('getColorScheme returns light by default', () => {
    const colorScheme = Appearance.getColorScheme();
    expect(colorScheme).toBe('light');
  });

  test('setColorScheme is a function', () => {
    expect(typeof Appearance.setColorScheme).toBe('function');
  });

  test('setColorScheme can be called', () => {
    Appearance.setColorScheme('dark');
    expect(Appearance.setColorScheme).toHaveBeenCalledWith('dark');
  });

  test('setColorScheme changes what getColorScheme returns', () => {
    Appearance.setColorScheme('dark');

    expect(Appearance.getColorScheme()).toBe('dark');
  });

  test('addChangeListener returns subscription', () => {
    const listener = vi.fn();
    const subscription = Appearance.addChangeListener(listener);

    expect(subscription).toBeDefined();
    expect(subscription.remove).toBeDefined();
    expect(typeof subscription.remove).toBe('function');
  });

  test('addChangeListener subscription can be removed', () => {
    const listener = vi.fn();
    const subscription = Appearance.addChangeListener(listener);

    expect(() => subscription.remove()).not.toThrow();
  });

  test('change listeners receive the new scheme', () => {
    const listener = vi.fn();
    Appearance.addChangeListener(listener);

    Appearance.setColorScheme('dark');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toEqual({ colorScheme: 'dark' });
  });

  test('a removed listener stops receiving while others keep receiving', () => {
    const removed = vi.fn();
    const kept = vi.fn();
    Appearance.addChangeListener(removed).remove();
    Appearance.addChangeListener(kept);

    Appearance.setColorScheme('dark');

    expect(removed).not.toHaveBeenCalled();
    expect(kept).toHaveBeenCalledTimes(1);
  });

  // getColorScheme() returns 'light' | 'dark' | null, never the override keyword. With
  // no system appearance to follow, 'auto' resolves to the resting scheme.
  test.each(['auto', 'unspecified'] as const)('setColorScheme(%s) resolves to light', (value) => {
    Appearance.setColorScheme('dark');

    Appearance.setColorScheme(value as 'auto');

    expect(Appearance.getColorScheme()).toBe('light');
  });

  test('_reset restores light and clears listeners', () => {
    expect(typeof appearance._reset).toBe('function');
    const listener = vi.fn();
    Appearance.addChangeListener(listener);
    Appearance.setColorScheme('dark');

    appearance._reset();

    expect(Appearance.getColorScheme()).toBe('light');
    listener.mockClear();
    Appearance.setColorScheme('dark');
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('useColorScheme', () => {
  test('returns light by default', () => {
    const result = useColorScheme();
    expect(result).toBe('light');
  });

  test('is a function', () => {
    expect(typeof useColorScheme).toBe('function');
  });

  // The hook and Appearance must not disagree: the hook returned its own frozen 'light'
  // regardless of what Appearance had been set to.
  test('reflects a scheme set through Appearance', () => {
    Appearance.setColorScheme('dark');

    expect(useColorScheme()).toBe('dark');
  });
});

describe('NativeAppearance', () => {
  // A second, independent colour-scheme mock. It has to share Appearance's state or the
  // two silently disagree.
  test('agrees with Appearance', () => {
    const NativeAppearance = require('react-native/Libraries/Utilities/NativeAppearance')
      .default as { getColorScheme: () => string | null };

    Appearance.setColorScheme('dark');

    expect(NativeAppearance.getColorScheme()).toBe('dark');
  });
});
