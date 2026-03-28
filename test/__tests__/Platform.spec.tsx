import { test, expect, describe } from 'vitest';
import { Platform, PlatformIOSStatic } from 'react-native';

// Cast to iOS platform type for iOS-specific tests
const iOSPlatform = Platform as PlatformIOSStatic;

describe('Platform', () => {
  test('OS is defined', () => {
    expect(Platform.OS).toBeDefined();
    expect(typeof Platform.OS).toBe('string');
  });

  test('OS is ios in test environment', () => {
    expect(Platform.OS).toBe('ios');
  });

  test('Version is defined', () => {
    expect(Platform.Version).toBeDefined();
  });

  test('isPad is defined', () => {
    expect(iOSPlatform.isPad).toBeDefined();
    expect(typeof iOSPlatform.isPad).toBe('boolean');
  });

  test('isTesting is true', () => {
    expect(Platform.isTesting).toBe(true);
  });

  test('isTV is defined', () => {
    expect(Platform.isTV).toBeDefined();
    expect(typeof Platform.isTV).toBe('boolean');
  });

  test('constants is defined', () => {
    expect(Platform.constants).toBeDefined();
  });

  test('select returns ios value', () => {
    const result = Platform.select({
      ios: 'iOS Value',
      android: 'Android Value',
      default: 'Default Value',
    });
    expect(result).toBe('iOS Value');
  });

  test('select returns default when platform not specified', () => {
    const result = Platform.select({
      android: 'Android Value',
      default: 'Default Value',
    });
    expect(result).toBe('Default Value');
  });

  test('select handles undefined values', () => {
    const result = Platform.select({
      ios: undefined,
      default: 'Default',
    });
    // Should return undefined for ios, not default
    expect(result).toBeUndefined();
  });

  test('select with function values', () => {
    const result = Platform.select({
      ios: () => 'iOS Function Result',
      android: () => 'Android Function Result',
    });
    expect(typeof result).toBe('function');
  });

  test('select with object values', () => {
    const result = Platform.select({
      ios: { backgroundColor: 'blue' },
      android: { backgroundColor: 'green' },
    });
    expect(result).toEqual({ backgroundColor: 'blue' });
  });

  test('select with null values', () => {
    const result = Platform.select({
      ios: null,
      android: 'Android',
    });
    expect(result).toBeNull();
  });

  test('constants contains reactNativeVersion', () => {
    expect(Platform.constants.reactNativeVersion).toBeDefined();
    expect(Platform.constants.reactNativeVersion.major).toBeDefined();
    expect(Platform.constants.reactNativeVersion.minor).toBeDefined();
    expect(Platform.constants.reactNativeVersion.patch).toBeDefined();
  });

  // Issue #2: Platform.OS should be accessible via require().default pattern
  test('Platform.OS is accessible via default export (issue #2)', () => {
    // Simulate the pattern used by processColor.js and other RN internals:
    // const Platform = require('../Utilities/Platform').default;
    // Platform.OS should not be undefined
    const PlatformModule = require('react-native/Libraries/Utilities/Platform');
    expect(PlatformModule.default).toBeDefined();
    expect(PlatformModule.default.OS).toBe('ios');
    expect(PlatformModule.default.select).toBeDefined();
  });

  test('Platform properties are accessible at top level (issue #2)', () => {
    // Also verify direct access works: require('../Utilities/Platform').OS
    const PlatformModule = require('react-native/Libraries/Utilities/Platform');
    expect(PlatformModule.OS).toBe('ios');
    expect(PlatformModule.select).toBeDefined();
  });

  // Tests from PR #8: verify processColor and react-native-svg work
  test('processColor can read Platform.OS through the compatibility shim', () => {
    const { processColor } = require('react-native');
    expect(() => processColor('black')).not.toThrow();
  });

  test('deep processColor import works via default export', () => {
    const processColor = require('react-native/Libraries/StyleSheet/processColor').default;
    expect(() => processColor('black')).not.toThrow();
  });

  test('react-native-svg can import without crashing', () => {
    expect(() => require('react-native-svg')).not.toThrow();
  });
});
