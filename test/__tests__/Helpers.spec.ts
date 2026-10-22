import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AppState,
  Appearance,
  Dimensions,
  Keyboard,
  NativeModules,
  PixelRatio,
  Platform,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { createRequire } from 'module';

import {
  mockNativeModule,
  resetAllMocks,
  setColorScheme,
  setDimensions,
  setPlatform,
} from '../../packages/vitest-react-native/src/helpers.js';

const require_ = createRequire(import.meta.url);

afterEach(() => {
  resetAllMocks();
});

describe('setPlatform', () => {
  it('switches Platform.OS and the value select resolves', () => {
    setPlatform('android');

    expect(Platform.OS).toBe('android');
    expect(Platform.select({ ios: 'I', android: 'A', default: 'D' })).toBe('A');
  });

  it('switches Version alongside OS', () => {
    setPlatform('android');
    expect(Platform.Version).toBe(34);

    setPlatform('ios');
    expect(Platform.Version).toBe('17.0');
  });
});

describe('setDimensions', () => {
  it('changes what Dimensions and the hook report', () => {
    setDimensions({ width: 500, height: 900 });

    expect(Dimensions.get('window')).toMatchObject({ width: 500, height: 900 });
    expect(useWindowDimensions()).toMatchObject({ width: 500, height: 900 });
  });

  it('notifies Dimensions change listeners', () => {
    const handler = vi.fn();
    Dimensions.addEventListener('change', handler);

    setDimensions({ width: 500, height: 900 });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('leaves scale and fontScale alone when they are not given', () => {
    setDimensions({ width: 500, height: 900 });

    expect(Dimensions.get('window')).toMatchObject({ scale: 2, fontScale: 1 });
  });
});

describe('setColorScheme', () => {
  it('changes Appearance and the hook together', () => {
    setColorScheme('dark');

    expect(Appearance.getColorScheme()).toBe('dark');
    expect(useColorScheme()).toBe('dark');
  });

  it('notifies change listeners', () => {
    const handler = vi.fn();
    Appearance.addChangeListener(handler);

    setColorScheme('dark');

    expect(handler).toHaveBeenCalledWith({ colorScheme: 'dark' });
  });
});

describe('mockNativeModule', () => {
  it('is visible through NativeModules', () => {
    mockNativeModule('MyModule', { getValue: () => 42 });

    expect((NativeModules as Record<string, any>).MyModule.getValue()).toBe(42);
  });

  // Modern React Native libraries read TurboModuleRegistry, not NativeModules, so a
  // helper that covered only the legacy path would miss most of them.
  it('is visible through TurboModuleRegistry', () => {
    mockNativeModule('MyModule', { getValue: () => 42 });

    const registry = require_('react-native/Libraries/TurboModule/TurboModuleRegistry') as {
      get: (name: string) => Record<string, any> | null;
      getEnforcing: (name: string) => Record<string, any>;
    };

    expect(registry.get('MyModule')?.getValue()).toBe(42);
    expect(registry.getEnforcing('MyModule').getValue()).toBe(42);
  });

  it('leaves React Native’s own native modules in place', () => {
    mockNativeModule('MyModule', { getValue: () => 42 });

    expect((NativeModules as Record<string, any>).KeyboardObserver).toBeDefined();
  });

  it('does not shadow the feature-flags module', () => {
    mockNativeModule('MyModule', { getValue: () => 42 });
    const proxy = (globalThis as Record<string, any>).__turboModuleProxy;

    expect(typeof proxy('NativeReactNativeFeatureFlagsCxx').anyFlag).toBe('function');
  });

  it('leaves an unregistered name resolving to null', () => {
    mockNativeModule('MyModule', { getValue: () => 42 });
    const proxy = (globalThis as Record<string, any>).__turboModuleProxy;

    expect(proxy('SomeOtherModule')).toBeNull();
  });
});

describe('resetAllMocks', () => {
  it('restores every stateful mock in one call', () => {
    const keyboard = Keyboard as typeof Keyboard & { _show: (height?: number) => void };
    const appState = AppState as typeof AppState & { _setState: (state: string) => void };
    setPlatform('android');
    setDimensions({ width: 500, height: 900 });
    setColorScheme('dark');
    keyboard._show(336);
    appState._setState('background');
    mockNativeModule('MyModule', { getValue: () => 42 });

    resetAllMocks();

    expect(Platform.OS).toBe('ios');
    expect(Dimensions.get('window').width).toBe(750);
    expect(PixelRatio.getFontScale()).toBe(1);
    expect(Appearance.getColorScheme()).toBe('light');
    expect(Keyboard.isVisible()).toBe(false);
    expect(AppState.currentState).toBe('active');
    expect((NativeModules as Record<string, any>).MyModule).toBeUndefined();
  });

  it('leaves spy call history to Vitest', () => {
    Dimensions.get('window');

    resetAllMocks();

    // Deliberately not cleared: Vitest owns spy lifecycle through its clearMocks and
    // mockReset config, and resetting implementations here would drop the mocks' own.
    expect(vi.isMockFunction(Dimensions.get)).toBe(true);
    expect((Dimensions.get as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
  });
});
