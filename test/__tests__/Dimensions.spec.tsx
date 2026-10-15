import { test, expect, describe, vi, afterEach } from 'vitest';
import { Dimensions } from 'react-native';

describe('Dimensions', () => {
  test('get returns window dimensions', () => {
    const windowDimensions = Dimensions.get('window');
    expect(windowDimensions).toBeDefined();
    expect(windowDimensions.width).toBeDefined();
    expect(windowDimensions.height).toBeDefined();
    expect(windowDimensions.scale).toBeDefined();
    expect(windowDimensions.fontScale).toBeDefined();
  });

  test('get returns screen dimensions', () => {
    const screenDimensions = Dimensions.get('screen');
    expect(screenDimensions).toBeDefined();
    expect(screenDimensions.width).toBeDefined();
    expect(screenDimensions.height).toBeDefined();
    expect(screenDimensions.scale).toBeDefined();
    expect(screenDimensions.fontScale).toBeDefined();
  });

  test('window dimensions have expected values', () => {
    const { width, height, scale, fontScale } = Dimensions.get('window');
    expect(width).toBe(750);
    expect(height).toBe(1334);
    expect(scale).toBe(2);
    expect(fontScale).toBe(1);
  });

  test('screen dimensions have expected values', () => {
    const { width, height, scale, fontScale } = Dimensions.get('screen');
    expect(width).toBe(750);
    expect(height).toBe(1334);
    expect(scale).toBe(2);
    expect(fontScale).toBe(1);
  });

  test('addEventListener returns subscription with remove', () => {
    const handler = vi.fn();
    const subscription = Dimensions.addEventListener('change', handler);
    expect(subscription).toBeDefined();
    expect(subscription.remove).toBeDefined();
    expect(typeof subscription.remove).toBe('function');
  });

  test('subscription remove can be called', () => {
    const handler = vi.fn();
    const subscription = Dimensions.addEventListener('change', handler);
    expect(() => subscription.remove()).not.toThrow();
  });

  test('set is defined', () => {
    expect(Dimensions.set).toBeDefined();
    expect(typeof Dimensions.set).toBe('function');
  });

  describe('state', () => {
    // _reset() is the mock's own hook, not part of React Native's API.
    const dimensions = Dimensions as unknown as { _reset?: () => void };

    afterEach(() => {
      dimensions._reset?.();
    });

    test('set updates what get returns', () => {
      Dimensions.set({ window: { width: 500, height: 900, scale: 3, fontScale: 1 } });

      expect(Dimensions.get('window').width).toBe(500);
      expect(Dimensions.get('window').height).toBe(900);
      // screen is untouched by a window-only update
      expect(Dimensions.get('screen').width).toBe(750);
    });

    test('set merges into the existing dimension rather than replacing it', () => {
      Dimensions.set({ window: { width: 500 } as never });

      expect(Dimensions.get('window').width).toBe(500);
      expect(Dimensions.get('window').height).toBe(1334);
    });

    test('set notifies change listeners', () => {
      const handler = vi.fn();
      Dimensions.addEventListener('change', handler);

      Dimensions.set({ window: { width: 500, height: 900, scale: 3, fontScale: 1 } });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].window.width).toBe(500);
    });

    test('a removed listener stops receiving changes while others keep receiving them', () => {
      const removed = vi.fn();
      const kept = vi.fn();
      Dimensions.addEventListener('change', removed).remove();
      Dimensions.addEventListener('change', kept);

      Dimensions.set({ window: { width: 500, height: 900, scale: 3, fontScale: 1 } });

      expect(removed).not.toHaveBeenCalled();
      expect(kept).toHaveBeenCalledTimes(1);
    });

    test('get returns a copy that callers cannot mutate in place', () => {
      Dimensions.get('window').width = 1;

      expect(Dimensions.get('window').width).toBe(750);
    });

    test('_reset restores the defaults and clears listeners', () => {
      expect(typeof dimensions._reset).toBe('function');

      const handler = vi.fn();
      Dimensions.addEventListener('change', handler);
      Dimensions.set({ window: { width: 500, height: 900, scale: 3, fontScale: 1 } });

      dimensions._reset?.();

      expect(Dimensions.get('window')).toEqual({
        width: 750,
        height: 1334,
        scale: 2,
        fontScale: 1,
      });
      handler.mockClear();
      Dimensions.set({ window: { width: 320 } as never });
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
