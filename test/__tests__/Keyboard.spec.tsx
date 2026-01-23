import { test, expect, describe, vi, beforeEach } from 'vitest';
import { Keyboard } from 'react-native';

describe('Keyboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('addListener is callable', () => {
    const callback = vi.fn();
    const subscription = Keyboard.addListener('keyboardDidShow', callback);
    expect(subscription).toBeDefined();
    expect(subscription.remove).toBeDefined();
  });

  test('addListener returns subscription with remove', () => {
    const callback = vi.fn();
    const subscription = Keyboard.addListener('keyboardDidHide', callback);
    expect(typeof subscription.remove).toBe('function');
  });

  test('addListener with different event types', () => {
    const callback = vi.fn();

    const showSub = Keyboard.addListener('keyboardDidShow', callback);
    const hideSub = Keyboard.addListener('keyboardDidHide', callback);
    const willShowSub = Keyboard.addListener('keyboardWillShow', callback);
    const willHideSub = Keyboard.addListener('keyboardWillHide', callback);

    expect(showSub).toBeDefined();
    expect(hideSub).toBeDefined();
    expect(willShowSub).toBeDefined();
    expect(willHideSub).toBeDefined();
  });

  test('removeListener is callable', () => {
    const callback = vi.fn();
    Keyboard.removeListener('keyboardDidShow', callback);
    expect(Keyboard.removeListener).toHaveBeenCalled();
  });

  test('removeAllListeners is callable', () => {
    Keyboard.removeAllListeners('keyboardDidShow');
    expect(Keyboard.removeAllListeners).toHaveBeenCalled();
  });

  test('dismiss is callable', () => {
    Keyboard.dismiss();
    expect(Keyboard.dismiss).toHaveBeenCalled();
  });

  test('scheduleLayoutAnimation is callable', () => {
    const event = { duration: 250, easing: 'keyboard' };
    Keyboard.scheduleLayoutAnimation(event);
    expect(Keyboard.scheduleLayoutAnimation).toHaveBeenCalledWith(event);
  });

  test('isVisible is callable', () => {
    const result = Keyboard.isVisible();
    expect(Keyboard.isVisible).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  test('metrics is callable', () => {
    const result = Keyboard.metrics();
    expect(Keyboard.metrics).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('subscription remove is callable', () => {
    const callback = vi.fn();
    const subscription = Keyboard.addListener('keyboardDidShow', callback);
    expect(() => subscription.remove()).not.toThrow();
  });

  test('all methods are defined', () => {
    expect(Keyboard.addListener).toBeDefined();
    expect(Keyboard.removeListener).toBeDefined();
    expect(Keyboard.removeAllListeners).toBeDefined();
    expect(Keyboard.dismiss).toBeDefined();
    expect(Keyboard.scheduleLayoutAnimation).toBeDefined();
    expect(Keyboard.isVisible).toBeDefined();
    expect(Keyboard.metrics).toBeDefined();
  });
});
