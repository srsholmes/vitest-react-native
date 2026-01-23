import { describe, test, expect, vi } from 'vitest';
import { BackHandler } from 'react-native';

describe('BackHandler', () => {
  test('exitApp is a function', () => {
    expect(typeof BackHandler.exitApp).toBe('function');
  });

  test('exitApp can be called', () => {
    BackHandler.exitApp();
    expect(BackHandler.exitApp).toHaveBeenCalled();
  });

  test('addEventListener returns subscription with remove', () => {
    const handler = vi.fn(() => true);
    const subscription = BackHandler.addEventListener('hardwareBackPress', handler);

    expect(subscription).toBeDefined();
    expect(subscription.remove).toBeDefined();
    expect(typeof subscription.remove).toBe('function');
  });

  test('addEventListener can be called multiple times', () => {
    const handler1 = vi.fn(() => true);
    const handler2 = vi.fn(() => false);

    const sub1 = BackHandler.addEventListener('hardwareBackPress', handler1);
    const sub2 = BackHandler.addEventListener('hardwareBackPress', handler2);

    expect(sub1).toBeDefined();
    expect(sub2).toBeDefined();
  });

  test('subscription remove can be called', () => {
    const handler = vi.fn(() => true);
    const subscription = BackHandler.addEventListener('hardwareBackPress', handler);

    subscription.remove();
    expect(subscription.remove).toHaveBeenCalled();
  });
});
