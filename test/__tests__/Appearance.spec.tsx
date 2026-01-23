import { describe, test, expect, vi } from 'vitest';
import { Appearance, useColorScheme } from 'react-native';

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

    subscription.remove();
    expect(subscription.remove).toHaveBeenCalled();
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
});
