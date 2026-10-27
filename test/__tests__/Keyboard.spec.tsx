import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest';
import { Keyboard } from 'react-native';

// _show/_hide/_reset are the mock's own hooks, not part of React Native's API.
const keyboard = Keyboard as typeof Keyboard & {
  _show: (height?: number) => void;
  _hide: () => void;
  _reset: () => void;
};

describe('Keyboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    keyboard._reset();
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
    (Keyboard as any).removeListener('keyboardDidShow', callback);
    expect((Keyboard as any).removeListener).toHaveBeenCalled();
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
    // @ts-expect-error testing mock behavior
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

  test('_show makes the keyboard visible and reports metrics', () => {
    keyboard._show(336);

    expect(Keyboard.isVisible()).toBe(true);
    expect(Keyboard.metrics()).toMatchObject({ height: 336 });
  });

  test('_show notifies keyboardDidShow listeners with the end coordinates', () => {
    const callback = vi.fn();
    Keyboard.addListener('keyboardDidShow', callback);

    keyboard._show(336);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].endCoordinates.height).toBe(336);
  });

  test('_hide makes the keyboard hidden and notifies keyboardDidHide', () => {
    const callback = vi.fn();
    Keyboard.addListener('keyboardDidHide', callback);
    keyboard._show(336);

    keyboard._hide();

    expect(Keyboard.isVisible()).toBe(false);
    expect(Keyboard.metrics()).toBeNull();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('dismiss hides the keyboard, as it does on a device', () => {
    const callback = vi.fn();
    Keyboard.addListener('keyboardDidHide', callback);
    keyboard._show(336);

    Keyboard.dismiss();

    expect(Keyboard.isVisible()).toBe(false);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('a removed listener stops receiving while others keep receiving', () => {
    const removed = vi.fn();
    const kept = vi.fn();
    Keyboard.addListener('keyboardDidShow', removed).remove();
    Keyboard.addListener('keyboardDidShow', kept);

    keyboard._show(336);

    expect(removed).not.toHaveBeenCalled();
    expect(kept).toHaveBeenCalledTimes(1);
  });

  test('_reset hides the keyboard and clears listeners', () => {
    expect(typeof keyboard._reset).toBe('function');
    const callback = vi.fn();
    Keyboard.addListener('keyboardDidShow', callback);
    keyboard._show(336);

    keyboard._reset();

    expect(Keyboard.isVisible()).toBe(false);
    expect(Keyboard.metrics()).toBeNull();
    callback.mockClear();
    keyboard._show(336);
    expect(callback).not.toHaveBeenCalled();
  });

  test('all methods are defined', () => {
    expect(Keyboard.addListener).toBeDefined();
    expect((Keyboard as any).removeListener).toBeDefined();
    expect(Keyboard.removeAllListeners).toBeDefined();
    expect(Keyboard.dismiss).toBeDefined();
    expect(Keyboard.scheduleLayoutAnimation).toBeDefined();
    expect(Keyboard.isVisible).toBeDefined();
    expect(Keyboard.metrics).toBeDefined();
  });
});
