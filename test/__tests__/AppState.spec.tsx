import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest';
import { AppState } from 'react-native';

// _setState/_reset are the mock's own hooks, not part of React Native's API.
const appState = AppState as typeof AppState & {
  _setState: (state: string) => void;
  _reset: () => void;
};

describe('AppState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    appState._reset();
  });

  test('currentState is defined', () => {
    expect(AppState.currentState).toBeDefined();
  });

  test('currentState is active', () => {
    expect(AppState.currentState).toBe('active');
  });

  test('isAvailable is true', () => {
    expect(AppState.isAvailable).toBe(true);
  });

  test('addEventListener is callable', () => {
    const callback = vi.fn();
    const subscription = AppState.addEventListener('change', callback);
    expect(subscription).toBeDefined();
    expect(subscription.remove).toBeDefined();
  });

  test('addEventListener returns subscription with remove', () => {
    const callback = vi.fn();
    const subscription = AppState.addEventListener('change', callback);
    expect(typeof subscription.remove).toBe('function');
  });

  test('can add multiple event listeners', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const subscription1 = AppState.addEventListener('change', callback1);
    const subscription2 = AppState.addEventListener('change', callback2);
    expect(subscription1).toBeDefined();
    expect(subscription2).toBeDefined();
  });

  test('subscription remove is callable', () => {
    const callback = vi.fn();
    const subscription = AppState.addEventListener('change', callback);
    expect(() => subscription.remove()).not.toThrow();
  });

  test('addEventListener with different event types', () => {
    const changeCallback = vi.fn();
    const focusCallback = vi.fn();
    const blurCallback = vi.fn();

    const changeSub = AppState.addEventListener('change', changeCallback);
    const focusSub = AppState.addEventListener('focus', focusCallback);
    const blurSub = AppState.addEventListener('blur', blurCallback);

    expect(changeSub).toBeDefined();
    expect(focusSub).toBeDefined();
    expect(blurSub).toBeDefined();
  });

  test('_setState changes currentState', () => {
    appState._setState('background');

    expect(AppState.currentState).toBe('background');
  });

  test('_setState notifies change listeners with the new state', () => {
    const handler = vi.fn();
    AppState.addEventListener('change', handler);

    appState._setState('background');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('background');
  });

  test('_setState does not notify focus or blur listeners', () => {
    const focus = vi.fn();
    const blur = vi.fn();
    AppState.addEventListener('focus', focus);
    AppState.addEventListener('blur', blur);

    appState._setState('background');

    expect(focus).not.toHaveBeenCalled();
    expect(blur).not.toHaveBeenCalled();
  });

  test('a removed listener stops receiving while others keep receiving', () => {
    const removed = vi.fn();
    const kept = vi.fn();
    AppState.addEventListener('change', removed).remove();
    AppState.addEventListener('change', kept);

    appState._setState('inactive');

    expect(removed).not.toHaveBeenCalled();
    expect(kept).toHaveBeenCalledTimes(1);
  });

  test('_reset restores active and clears listeners', () => {
    expect(typeof appState._reset).toBe('function');
    const handler = vi.fn();
    AppState.addEventListener('change', handler);
    appState._setState('background');

    appState._reset();

    expect(AppState.currentState).toBe('active');
    handler.mockClear();
    appState._setState('background');
    expect(handler).not.toHaveBeenCalled();
  });
});
