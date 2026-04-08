import { test, expect, describe } from 'vitest';

/**
 * Issue #4: JSX in .js files for third-party RN packages
 *
 * Verifies that the plugin supports transforming JSX in .js files
 * from user-specified packages via the transformPackages option.
 */
describe('JSX transform for third-party packages (issue #4)', () => {
  test('plugin accepts transformPackages option', async () => {
    // Verify the plugin can be imported and accepts the option
    const { reactNative } = await import('../../packages/vitest-react-native/src/plugin');

    // Should not throw with transformPackages option
    const plugin = reactNative({
      transformPackages: ['react-native-modal-datetime-picker'],
    });

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('vitest-plugin-react-native');
    expect(plugin.transform).toBeDefined();
  });

  test('transform handles JSX in .js files from specified packages', async () => {
    const { reactNative } = await import('../../packages/vitest-react-native/src/plugin');

    const plugin = reactNative({
      transformPackages: ['react-native-modal-datetime-picker'],
    });

    // Initialize rolldown (normally done by Vite via buildStart)
    if (plugin.buildStart) {
      await (plugin.buildStart as (...args: any[]) => any).call({});
    }

    const jsxCode = `
      import React from 'react';
      export default function Picker() {
        return <View><Text>Hello</Text></View>;
      }
    `;

    // Should transform JSX in .js files from the specified package
    const result = (plugin.transform as (...args: any[]) => any).call(
      {},
      jsxCode,
      '/project/node_modules/react-native-modal-datetime-picker/src/DateTimePickerModal.ios.js'
    );

    expect(result).toBeDefined();
    expect(result.code).toBeDefined();
    // Should have transformed JSX to function calls
    expect(result.code).not.toContain('<View>');
    expect(result.code).not.toContain('<Text>');
  });

  test('transform ignores .js files from non-specified packages', async () => {
    const { reactNative } = await import('../../packages/vitest-react-native/src/plugin');

    const plugin = reactNative({
      transformPackages: ['react-native-modal-datetime-picker'],
    });

    const code = `export default function foo() { return 42; }`;

    // Should not transform .js files from other packages
    const result = (plugin.transform as (...args: any[]) => any).call(
      {},
      code,
      '/project/node_modules/lodash/index.js'
    );

    expect(result).toBeUndefined();
  });

  test('transform ignores non-.js files', async () => {
    const { reactNative } = await import('../../packages/vitest-react-native/src/plugin');

    const plugin = reactNative({
      transformPackages: ['react-native-modal-datetime-picker'],
    });

    const code = `export default function foo() { return 42; }`;

    // Should not transform .ts files
    const result = (plugin.transform as (...args: any[]) => any).call(
      {},
      code,
      '/project/node_modules/react-native-modal-datetime-picker/src/index.ts'
    );

    expect(result).toBeUndefined();
  });
});
