import { describe, test, expect } from 'vitest';
import { useWindowDimensions } from 'react-native';

describe('useWindowDimensions', () => {
  test('returns dimensions object', () => {
    const dimensions = useWindowDimensions();

    expect(dimensions).toBeDefined();
    expect(dimensions.width).toBe(750);
    expect(dimensions.height).toBe(1334);
    expect(dimensions.scale).toBe(2);
    expect(dimensions.fontScale).toBe(2);
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
});
