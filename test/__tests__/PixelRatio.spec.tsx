import { test, expect, describe } from 'vitest';
import { PixelRatio } from 'react-native';

describe('PixelRatio', () => {
  test('get returns a number', () => {
    const ratio = PixelRatio.get();
    expect(typeof ratio).toBe('number');
    expect(ratio).toBeGreaterThan(0);
  });

  test('get returns expected value', () => {
    expect(PixelRatio.get()).toBe(2);
  });

  test('getFontScale returns a number', () => {
    const fontScale = PixelRatio.getFontScale();
    expect(typeof fontScale).toBe('number');
    expect(fontScale).toBeGreaterThan(0);
  });

  test('getFontScale returns expected value', () => {
    expect(PixelRatio.getFontScale()).toBe(2);
  });

  test('getPixelSizeForLayoutSize calculates correctly', () => {
    const layoutSize = 100;
    const pixelSize = PixelRatio.getPixelSizeForLayoutSize(layoutSize);
    expect(pixelSize).toBe(200); // 100 * 2 (pixel ratio)
  });

  test('getPixelSizeForLayoutSize with different values', () => {
    expect(PixelRatio.getPixelSizeForLayoutSize(50)).toBe(100);
    expect(PixelRatio.getPixelSizeForLayoutSize(10)).toBe(20);
    expect(PixelRatio.getPixelSizeForLayoutSize(0)).toBe(0);
  });

  test('roundToNearestPixel rounds correctly', () => {
    const rounded = PixelRatio.roundToNearestPixel(100.3);
    expect(typeof rounded).toBe('number');
  });

  test('roundToNearestPixel with various inputs', () => {
    // With pixel ratio of 2, it rounds to nearest 0.5
    expect(PixelRatio.roundToNearestPixel(1)).toBe(1);
    expect(PixelRatio.roundToNearestPixel(1.25)).toBe(1.5);
    expect(PixelRatio.roundToNearestPixel(1.75)).toBe(2);
  });

  test('roundToNearestPixel with zero', () => {
    expect(PixelRatio.roundToNearestPixel(0)).toBe(0);
  });

  test('all methods are defined', () => {
    expect(PixelRatio.get).toBeDefined();
    expect(PixelRatio.getFontScale).toBeDefined();
    expect(PixelRatio.getPixelSizeForLayoutSize).toBeDefined();
    expect(PixelRatio.roundToNearestPixel).toBeDefined();
  });
});
