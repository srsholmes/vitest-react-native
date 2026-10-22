import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Appearance, AppState, DeviceEventEmitter, Dimensions, Keyboard } from 'react-native';

/**
 * Every mock that holds state registers its own reset hook as it initialises, so
 * resetting them all does not depend on a list someone has to remember to extend.
 *
 * The registry is populated lazily, which is the right behaviour: a mock that was never
 * loaded holds no state to reset.
 */

type Registry = Map<string, () => void>;

const registry = (): Registry => (globalThis as Record<string, unknown>).__vrnStateful as Registry;

const sweep = () => {
  for (const reset of registry().values()) reset();
};

beforeAll(() => {
  // React Native exposes its exports as getters on module.exports, so an import that is
  // never read does not load the module behind it — and an unloaded mock has not
  // registered. Touch each one so the registry is populated before asserting on it.
  void [Appearance, AppState, DeviceEventEmitter, Dimensions, Keyboard];
});

describe('stateful mock registry', () => {
  it('holds a reset hook for each stateful mock that has loaded', () => {
    expect(registry()).toBeInstanceOf(Map);

    for (const name of ['Appearance', 'AppState', 'Dimensions', 'DeviceEventEmitter', 'Keyboard']) {
      expect(registry().has(name)).toBe(true);
      expect(typeof registry().get(name)).toBe('function');
    }
  });

  it('sweeping the registry restores every mock at once', () => {
    const keyboard = Keyboard as typeof Keyboard & { _show: (height?: number) => void };
    const appState = AppState as typeof AppState & { _setState: (state: string) => void };

    Appearance.setColorScheme('dark');
    Dimensions.set({ window: { width: 500, height: 900, scale: 3, fontScale: 1 } });
    keyboard._show(336);
    appState._setState('background');

    sweep();

    expect(Appearance.getColorScheme()).toBe('light');
    expect(Dimensions.get('window').width).toBe(750);
    expect(Keyboard.isVisible()).toBe(false);
    expect(AppState.currentState).toBe('active');
  });

  it('sweeping clears listeners registered on every stateful mock', () => {
    const appearance = vi.fn();
    const dimensions = vi.fn();
    const emitter = vi.fn();
    Appearance.addChangeListener(appearance);
    Dimensions.addEventListener('change', dimensions);
    DeviceEventEmitter.addListener('someEvent', emitter);

    sweep();

    Appearance.setColorScheme('dark');
    Dimensions.set({ window: { width: 320 } as never });
    DeviceEventEmitter.emit('someEvent');

    expect(appearance).not.toHaveBeenCalled();
    expect(dimensions).not.toHaveBeenCalled();
    expect(emitter).not.toHaveBeenCalled();
    sweep();
  });
});
