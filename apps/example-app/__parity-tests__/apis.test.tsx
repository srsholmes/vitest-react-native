/**
 * Parity tests: React Native API mocks
 *
 * These tests verify that mocked React Native APIs behave identically
 * under both Jest and Vitest. Every test must pass in both runners.
 */

import {
  Platform,
  Dimensions,
  PixelRatio,
  AppState,
  Linking,
  Alert,
  Share,
  Keyboard,
  LayoutAnimation,
  InteractionManager,
  PanResponder,
  Vibration,
  BackHandler,
  PermissionsAndroid,
  AccessibilityInfo,
  Appearance,
  StyleSheet,
  useWindowDimensions,
  useColorScheme,
  Clipboard,
  Settings,
} from 'react-native';
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { fn } from './test-utils';

// ---------------------------------------------------------------------------
// Platform
// ---------------------------------------------------------------------------
describe('Platform', () => {
  test('OS is a string', () => {
    expect(typeof Platform.OS).toBe('string');
  });

  test('Version is defined', () => {
    expect(Platform.Version).toBeDefined();
  });

  test('select picks ios or default', () => {
    const result = Platform.select({ ios: 'ios', android: 'android', default: 'def' });
    expect(typeof result).toBe('string');
  });

  test('select returns default when no match', () => {
    const result = Platform.select({ android: 'A', default: 'D' });
    // Under jest-preset, OS is ios so 'android' won't match → default 'D'
    // Under vitest, same behaviour
    expect(result).toBe('D');
  });

  test('constants.reactNativeVersion exists', () => {
    expect(Platform.constants.reactNativeVersion).toBeDefined();
    expect(Platform.constants.reactNativeVersion.major).toBeDefined();
    expect(Platform.constants.reactNativeVersion.minor).toBeDefined();
  });

  test('isTesting is true', () => {
    expect(Platform.isTesting).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------
describe('Dimensions', () => {
  test('get("window") returns object with width/height', () => {
    const win = Dimensions.get('window');
    expect(win.width).toBeGreaterThan(0);
    expect(win.height).toBeGreaterThan(0);
  });

  test('get("screen") returns object with width/height', () => {
    const scr = Dimensions.get('screen');
    expect(scr.width).toBeGreaterThan(0);
    expect(scr.height).toBeGreaterThan(0);
  });

  test('addEventListener is callable', () => {
    const handler = fn();
    const sub = Dimensions.addEventListener('change', handler);
    expect(sub).toBeDefined();
    expect(typeof sub.remove).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// PixelRatio
// ---------------------------------------------------------------------------
describe('PixelRatio', () => {
  test('get returns a number', () => {
    expect(typeof PixelRatio.get()).toBe('number');
    expect(PixelRatio.get()).toBeGreaterThan(0);
  });

  test('getFontScale returns a number', () => {
    expect(typeof PixelRatio.getFontScale()).toBe('number');
  });

  test('getPixelSizeForLayoutSize returns a number', () => {
    const result = PixelRatio.getPixelSizeForLayoutSize(10);
    expect(typeof result).toBe('number');
  });

  test('roundToNearestPixel returns a number', () => {
    const result = PixelRatio.roundToNearestPixel(10.4);
    expect(typeof result).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// AppState
// ---------------------------------------------------------------------------
describe('AppState', () => {
  test('currentState is a string', () => {
    expect(typeof AppState.currentState).toBe('string');
  });

  test('addEventListener returns subscription', () => {
    const handler = fn();
    const sub = AppState.addEventListener('change', handler);
    expect(sub).toBeDefined();
    expect(typeof sub.remove).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// Linking
// ---------------------------------------------------------------------------
describe('Linking', () => {
  test('openURL returns a promise', async () => {
    await expect(Linking.openURL('https://example.com')).resolves.not.toThrow();
  });

  test('canOpenURL returns a promise', async () => {
    const result = await Linking.canOpenURL('https://example.com');
    expect(typeof result).toBe('boolean');
  });

  test('getInitialURL returns a promise', async () => {
    const url = await Linking.getInitialURL();
    // Initial URL is null in test env
    expect(url === null || typeof url === 'string').toBe(true);
  });

  test('addEventListener returns subscription', () => {
    const sub = Linking.addEventListener('url', fn());
    expect(sub).toBeDefined();
    expect(typeof sub.remove).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------
describe('Alert', () => {
  test('alert is callable', () => {
    expect(() => Alert.alert('Title', 'Message')).not.toThrow();
  });

  test('alert with buttons', () => {
    expect(() =>
      Alert.alert('Title', 'Message', [{ text: 'OK' }, { text: 'Cancel' }]),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Share
// ---------------------------------------------------------------------------
describe('Share', () => {
  test('share returns a promise', async () => {
    const result = await Share.share({ message: 'Hello' });
    expect(result).toBeDefined();
    expect(result.action).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Keyboard
// ---------------------------------------------------------------------------
describe('Keyboard', () => {
  test('dismiss is callable', () => {
    expect(() => Keyboard.dismiss()).not.toThrow();
  });

  test('addListener returns subscription', () => {
    const sub = Keyboard.addListener('keyboardDidShow', fn());
    expect(sub).toBeDefined();
    expect(typeof sub.remove).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// LayoutAnimation
// ---------------------------------------------------------------------------
describe('LayoutAnimation', () => {
  test('configureNext is callable', () => {
    expect(() =>
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut),
    ).not.toThrow();
  });

  test('presets are defined', () => {
    expect(LayoutAnimation.Presets.easeInEaseOut).toBeDefined();
    expect(LayoutAnimation.Presets.linear).toBeDefined();
    expect(LayoutAnimation.Presets.spring).toBeDefined();
  });

  test('Types are defined', () => {
    expect(LayoutAnimation.Types.spring).toBeDefined();
    expect(LayoutAnimation.Types.linear).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// InteractionManager
// ---------------------------------------------------------------------------
describe('InteractionManager', () => {
  test('runAfterInteractions accepts function', () => {
    const task = fn();
    const result = InteractionManager.runAfterInteractions(task);
    expect(task).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });

  test('createInteractionHandle returns a number', () => {
    const handle = InteractionManager.createInteractionHandle();
    expect(typeof handle).toBe('number');
  });

  test('clearInteractionHandle is callable', () => {
    expect(() => InteractionManager.clearInteractionHandle(1)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// PanResponder
// ---------------------------------------------------------------------------
describe('PanResponder', () => {
  test('create returns panHandlers', () => {
    const responder = PanResponder.create({});
    expect(responder.panHandlers).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Vibration
// ---------------------------------------------------------------------------
describe('Vibration', () => {
  test('vibrate is callable', () => {
    expect(() => Vibration.vibrate()).not.toThrow();
  });

  test('cancel is callable', () => {
    expect(() => Vibration.cancel()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// BackHandler
// ---------------------------------------------------------------------------
describe('BackHandler', () => {
  test('addEventListener returns subscription', () => {
    const sub = BackHandler.addEventListener('hardwareBackPress', fn());
    expect(sub).toBeDefined();
    expect(typeof sub.remove).toBe('function');
  });

  test('exitApp is callable', () => {
    expect(() => BackHandler.exitApp()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// PermissionsAndroid
// ---------------------------------------------------------------------------
describe('PermissionsAndroid', () => {
  test('PERMISSIONS contains keys', () => {
    expect(PermissionsAndroid.PERMISSIONS.CAMERA).toBeDefined();
    expect(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).toBeDefined();
  });

  test('RESULTS contains keys', () => {
    expect(PermissionsAndroid.RESULTS.GRANTED).toBe('granted');
    expect(PermissionsAndroid.RESULTS.DENIED).toBe('denied');
  });

  test('check returns a promise', async () => {
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    expect(typeof result).toBe('string');
  });

  test('request returns a promise', async () => {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    expect(typeof result).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// AccessibilityInfo
// ---------------------------------------------------------------------------
describe('AccessibilityInfo', () => {
  test('isScreenReaderEnabled returns a promise', async () => {
    const result = await AccessibilityInfo.isScreenReaderEnabled();
    expect(typeof result).toBe('boolean');
  });

  test('addEventListener returns subscription', () => {
    const sub = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      fn(),
    );
    expect(sub).toBeDefined();
    expect(typeof sub.remove).toBe('function');
  });

  test('announceForAccessibility is callable', () => {
    expect(() =>
      AccessibilityInfo.announceForAccessibility('Hello'),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Appearance
// ---------------------------------------------------------------------------
describe('Appearance', () => {
  test('getColorScheme returns a string or null', () => {
    const scheme = Appearance.getColorScheme();
    expect(scheme === null || typeof scheme === 'string').toBe(true);
  });

  test('addChangeListener returns subscription', () => {
    const sub = Appearance.addChangeListener(fn());
    expect(sub).toBeDefined();
    expect(typeof sub.remove).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// StyleSheet
// ---------------------------------------------------------------------------
describe('StyleSheet', () => {
  test('create returns the styles object', () => {
    const styles = StyleSheet.create({
      container: { flex: 1 },
      text: { fontSize: 16 },
    });
    expect(styles.container).toBeDefined();
    expect(styles.text).toBeDefined();
  });

  test('flatten handles arrays', () => {
    const result = StyleSheet.flatten([{ color: 'red' }, { fontSize: 14 }]);
    expect(result).toEqual({ color: 'red', fontSize: 14 });
  });

  test('hairlineWidth is a number', () => {
    expect(typeof StyleSheet.hairlineWidth).toBe('number');
  });

  test('absoluteFill is defined', () => {
    expect(StyleSheet.absoluteFill).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// useWindowDimensions hook
// ---------------------------------------------------------------------------
describe('useWindowDimensions', () => {
  test('returns width and height', () => {
    function TestComponent() {
      const { width, height } = useWindowDimensions();
      return (
        <React.Fragment>
          <Text testID="w">{String(width)}</Text>
          <Text testID="h">{String(height)}</Text>
        </React.Fragment>
      );
    }

    // Need Text imported for this test
    const { Text } = require('react-native');
    render(<TestComponent />);
    const w = screen.getByTestId('w');
    const h = screen.getByTestId('h');
    expect(Number(w.props.children)).toBeGreaterThan(0);
    expect(Number(h.props.children)).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// useColorScheme hook
// ---------------------------------------------------------------------------
describe('useColorScheme', () => {
  test('returns a string or null', () => {
    function TestComponent() {
      const scheme = useColorScheme();
      const { Text } = require('react-native');
      return <Text testID="cs">{String(scheme)}</Text>;
    }

    render(<TestComponent />);
    const el = screen.getByTestId('cs');
    const value = el.props.children;
    expect(value === 'null' || value === 'light' || value === 'dark').toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Clipboard
// ---------------------------------------------------------------------------
describe('Clipboard', () => {
  test('getString returns a promise', async () => {
    const result = await Clipboard.getString();
    expect(typeof result).toBe('string');
  });

  test('setString is callable', () => {
    expect(() => Clipboard.setString('hello')).not.toThrow();
  });

  test('hasString returns a promise', async () => {
    const result = await Clipboard.hasString();
    expect(typeof result).toBe('boolean');
  });
});

// ---------------------------------------------------------------------------
// Settings (iOS)
// ---------------------------------------------------------------------------
describe('Settings', () => {
  test('get returns a value', () => {
    const result = Settings.get('someKey');
    // Returns null for unknown keys
    expect(result === null || result !== undefined).toBe(true);
  });

  test('set is callable', () => {
    expect(() => Settings.set({ key: 'value' })).not.toThrow();
  });

  test('watchKeys returns a number', () => {
    const watchId = Settings.watchKeys(['key'], fn());
    expect(typeof watchId).toBe('number');
  });

  test('clearWatch is callable', () => {
    expect(() => Settings.clearWatch(0)).not.toThrow();
  });
});
