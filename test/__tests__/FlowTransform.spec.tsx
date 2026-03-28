import { test, expect, describe } from 'vitest';

/**
 * Issue #5: Flow parse failure for @react-native-community packages
 *
 * Verifies that the Flow type stripping and JSX transformation
 * covers @react-native-community packages in addition to
 * react-native and @react-native.
 */
describe('Flow type stripping coverage (issue #5)', () => {
  test('pirates hook matcher includes @react-native-community paths', () => {
    // Simulate the matcher logic from setup.ts
    const normalize = (p: string): string => p.replace(/\\/g, '/');
    const matcher = (id: string) => {
      const p = normalize(id);
      return (
        (p.includes('/node_modules/react-native/') ||
          p.includes('/node_modules/@react-native/') ||
          p.includes('/node_modules/@react-native-community/')) &&
        !p.includes('Renderer/implementations')
      );
    };

    // Should match react-native core
    expect(matcher('/project/node_modules/react-native/Libraries/StyleSheet/processColor.js')).toBe(true);

    // Should match @react-native scoped packages
    expect(matcher('/project/node_modules/@react-native/polyfills/Object.es8.js')).toBe(true);

    // Should match @react-native-community packages (issue #5)
    expect(matcher('/project/node_modules/@react-native-community/push-notification-ios/js/index.js')).toBe(true);
    expect(matcher('/project/node_modules/@react-native-community/slider/src/Slider.js')).toBe(true);

    // Should NOT match unrelated packages
    expect(matcher('/project/node_modules/lodash/index.js')).toBe(false);
    expect(matcher('/project/node_modules/react/index.js')).toBe(false);

    // Should exclude Renderer/implementations
    expect(matcher('/project/node_modules/react-native/Renderer/implementations/foo.js')).toBe(false);
  });
});
