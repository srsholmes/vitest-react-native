import { describe, test, expect, afterEach } from 'vitest';
import { Dimensions, useWindowDimensions } from 'react-native';

describe('useWindowDimensions', () => {
  afterEach(() => {
    (Dimensions as unknown as { _reset: () => void })._reset();
  });

  test('returns dimensions object', () => {
    const dimensions = useWindowDimensions();

    expect(dimensions).toBeDefined();
    expect(dimensions.width).toBe(750);
    expect(dimensions.height).toBe(1334);
    expect(dimensions.scale).toBe(2);
    expect(dimensions.fontScale).toBe(1);
  });

  test('is a function', () => {
    expect(typeof useWindowDimensions).toBe('function');
  });

  test('returns numeric values', () => {
    const { width, height, scale, fontScale } = useWindowDimensions();

    expect(typeof width).toBe('number');
    expect(typeof height).toBe('number');
    expect(typeof scale).toBe('number');
    expect(typeof fontScale).toBe('number');
  });

  // The hook and Dimensions must not disagree: before this, the hook returned its own
  // frozen literal, so Dimensions.get('window') could report 500 while the hook still
  // reported 750.
  test('reflects a change made through Dimensions.set', () => {
    Dimensions.set({ window: { width: 500, height: 900, scale: 3, fontScale: 1 } });

    expect(useWindowDimensions()).toEqual({
      width: 500,
      height: 900,
      scale: 3,
      fontScale: 1,
    });
  });
});
