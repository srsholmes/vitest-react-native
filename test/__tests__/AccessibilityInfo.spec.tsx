import { test, expect, describe, vi, beforeEach } from 'vitest';
import { AccessibilityInfo } from 'react-native';

describe('AccessibilityInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('addEventListener is callable', () => {
    const callback = vi.fn();
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', callback);
    expect(subscription).toBeDefined();
    expect(subscription.remove).toBeDefined();
  });

  test('addEventListener returns subscription with remove', () => {
    const callback = vi.fn();
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', callback);
    expect(typeof subscription.remove).toBe('function');
  });

  test('announceForAccessibility is callable', () => {
    AccessibilityInfo.announceForAccessibility('Test announcement');
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Test announcement');
  });

  test('announceForAccessibilityWithOptions is callable', () => {
    AccessibilityInfo.announceForAccessibilityWithOptions('Test', { queue: true });
    expect(AccessibilityInfo.announceForAccessibilityWithOptions).toHaveBeenCalled();
  });

  test('isAccessibilityServiceEnabled returns promise', async () => {
    const result = AccessibilityInfo.isAccessibilityServiceEnabled();
    expect(result).toBeInstanceOf(Promise);
  });

  test('isAccessibilityServiceEnabled resolves to false', async () => {
    const enabled = await AccessibilityInfo.isAccessibilityServiceEnabled();
    expect(enabled).toBe(false);
  });

  test('isBoldTextEnabled returns promise', async () => {
    const result = AccessibilityInfo.isBoldTextEnabled();
    expect(result).toBeInstanceOf(Promise);
  });

  test('isBoldTextEnabled resolves to false', async () => {
    const enabled = await AccessibilityInfo.isBoldTextEnabled();
    expect(enabled).toBe(false);
  });

  test('isGrayscaleEnabled returns promise', async () => {
    const result = AccessibilityInfo.isGrayscaleEnabled();
    expect(result).toBeInstanceOf(Promise);
  });

  test('isGrayscaleEnabled resolves to false', async () => {
    const enabled = await AccessibilityInfo.isGrayscaleEnabled();
    expect(enabled).toBe(false);
  });

  test('isInvertColorsEnabled returns promise', async () => {
    const result = AccessibilityInfo.isInvertColorsEnabled();
    expect(result).toBeInstanceOf(Promise);
  });

  test('isInvertColorsEnabled resolves to false', async () => {
    const enabled = await AccessibilityInfo.isInvertColorsEnabled();
    expect(enabled).toBe(false);
  });

  test('isReduceMotionEnabled returns promise', async () => {
    const result = AccessibilityInfo.isReduceMotionEnabled();
    expect(result).toBeInstanceOf(Promise);
  });

  test('isReduceMotionEnabled resolves to false', async () => {
    const enabled = await AccessibilityInfo.isReduceMotionEnabled();
    expect(enabled).toBe(false);
  });

  test('prefersCrossFadeTransitions returns promise', async () => {
    const result = AccessibilityInfo.prefersCrossFadeTransitions();
    expect(result).toBeInstanceOf(Promise);
  });

  test('prefersCrossFadeTransitions resolves to false', async () => {
    const prefers = await AccessibilityInfo.prefersCrossFadeTransitions();
    expect(prefers).toBe(false);
  });

  test('isReduceTransparencyEnabled returns promise', async () => {
    const result = AccessibilityInfo.isReduceTransparencyEnabled();
    expect(result).toBeInstanceOf(Promise);
  });

  test('isReduceTransparencyEnabled resolves to false', async () => {
    const enabled = await AccessibilityInfo.isReduceTransparencyEnabled();
    expect(enabled).toBe(false);
  });

  test('isScreenReaderEnabled returns promise', async () => {
    const result = AccessibilityInfo.isScreenReaderEnabled();
    expect(result).toBeInstanceOf(Promise);
  });

  test('isScreenReaderEnabled resolves to false', async () => {
    const enabled = await AccessibilityInfo.isScreenReaderEnabled();
    expect(enabled).toBe(false);
  });

  test('setAccessibilityFocus is callable', () => {
    AccessibilityInfo.setAccessibilityFocus(1);
    expect(AccessibilityInfo.setAccessibilityFocus).toHaveBeenCalledWith(1);
  });

  test('sendAccessibilityEvent is callable', () => {
    AccessibilityInfo.sendAccessibilityEvent(1, 'focus');
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalled();
  });

  test('getRecommendedTimeoutMillis returns promise', async () => {
    const result = AccessibilityInfo.getRecommendedTimeoutMillis(5000);
    expect(result).toBeInstanceOf(Promise);
  });

  test('getRecommendedTimeoutMillis resolves to 0', async () => {
    const timeout = await AccessibilityInfo.getRecommendedTimeoutMillis(5000);
    expect(timeout).toBe(0);
  });

  test('all methods are defined', () => {
    expect(AccessibilityInfo.addEventListener).toBeDefined();
    expect(AccessibilityInfo.announceForAccessibility).toBeDefined();
    expect(AccessibilityInfo.isScreenReaderEnabled).toBeDefined();
    expect(AccessibilityInfo.isReduceMotionEnabled).toBeDefined();
    expect(AccessibilityInfo.setAccessibilityFocus).toBeDefined();
  });
});
