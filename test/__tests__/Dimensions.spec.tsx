import { test, expect, describe, vi } from 'vitest';
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
    expect(fontScale).toBe(2);
  });

  test('screen dimensions have expected values', () => {
    const { width, height, scale, fontScale } = Dimensions.get('screen');
    expect(width).toBe(750);
    expect(height).toBe(1334);
    expect(scale).toBe(2);
    expect(fontScale).toBe(2);
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
});
