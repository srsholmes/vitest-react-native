import { describe, test, expect } from 'vitest';
import { ToastAndroid } from 'react-native';

describe('ToastAndroid', () => {
  test('has duration constants', () => {
    expect(ToastAndroid.SHORT).toBe(0);
    expect(ToastAndroid.LONG).toBe(1);
  });

  test('has gravity constants', () => {
    expect(ToastAndroid.TOP).toBe(0);
    expect(ToastAndroid.BOTTOM).toBe(1);
    expect(ToastAndroid.CENTER).toBe(2);
  });

  test('show is a function', () => {
    expect(typeof ToastAndroid.show).toBe('function');
  });

  test('show can be called', () => {
    ToastAndroid.show('Hello World', ToastAndroid.SHORT);
    expect(ToastAndroid.show).toHaveBeenCalledWith('Hello World', 0);
  });

  test('showWithGravity is a function', () => {
    expect(typeof ToastAndroid.showWithGravity).toBe('function');
  });

  test('showWithGravity can be called', () => {
    ToastAndroid.showWithGravity('Hello World', ToastAndroid.LONG, ToastAndroid.CENTER);
    expect(ToastAndroid.showWithGravity).toHaveBeenCalledWith('Hello World', 1, 2);
  });

  test('showWithGravityAndOffset is a function', () => {
    expect(typeof ToastAndroid.showWithGravityAndOffset).toBe('function');
  });

  test('showWithGravityAndOffset can be called', () => {
    ToastAndroid.showWithGravityAndOffset(
      'Hello World',
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      0,
      100
    );
    expect(ToastAndroid.showWithGravityAndOffset).toHaveBeenCalledWith('Hello World', 1, 1, 0, 100);
  });
});
