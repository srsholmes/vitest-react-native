import { test, expect, describe, vi, beforeEach } from 'vitest';
import { Vibration } from 'react-native';

describe('Vibration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('vibrate is callable', () => {
    Vibration.vibrate();
    expect(Vibration.vibrate).toHaveBeenCalled();
  });

  test('vibrate with duration', () => {
    Vibration.vibrate(500);
    expect(Vibration.vibrate).toHaveBeenCalledWith(500);
  });

  test('vibrate with pattern', () => {
    Vibration.vibrate([100, 200, 300]);
    expect(Vibration.vibrate).toHaveBeenCalledWith([100, 200, 300]);
  });

  test('vibrate with pattern and repeat', () => {
    Vibration.vibrate([100, 200, 300], true);
    expect(Vibration.vibrate).toHaveBeenCalledWith([100, 200, 300], true);
  });

  test('cancel is callable', () => {
    Vibration.cancel();
    expect(Vibration.cancel).toHaveBeenCalled();
  });

  test('vibrate and cancel workflow', () => {
    Vibration.vibrate([100, 200], true);
    expect(Vibration.vibrate).toHaveBeenCalled();

    Vibration.cancel();
    expect(Vibration.cancel).toHaveBeenCalled();
  });

  test('all methods are defined', () => {
    expect(Vibration.vibrate).toBeDefined();
    expect(Vibration.cancel).toBeDefined();
  });
});
