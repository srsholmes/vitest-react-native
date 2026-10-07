import { describe, it, expect } from 'vitest';

import { withSetupFirst } from '../../packages/vitest-react-native/src/plugin.js';

const own = '/repo/node_modules/@srsholmes/vitest-react-native/dist/setup.js';

describe('withSetupFirst', () => {
  it('runs the plugin setup before user setup files', () => {
    expect(withSetupFirst(own, ['./test-setup.ts'])).toEqual([own, './test-setup.ts']);
  });

  it('accepts a single string or no user setup files', () => {
    expect(withSetupFirst(own, './a.ts')).toEqual([own, './a.ts']);
    expect(withSetupFirst(own, undefined)).toEqual([own]);
  });

  it.each([
    '@srsholmes/vitest-react-native/setup',
    own,
    'C:\\repo\\node_modules\\@srsholmes\\vitest-react-native\\dist\\setup.cjs',
  ])('drops a manually listed copy of the plugin setup (%s)', (manual) => {
    expect(withSetupFirst(own, ['./a.ts', manual, './b.ts'])).toEqual([own, './a.ts', './b.ts']);
  });

  it('keeps unrelated files with similar names', () => {
    expect(withSetupFirst(own, ['./my-vitest-react-native-setup.ts'])).toEqual([
      own,
      './my-vitest-react-native-setup.ts',
    ]);
  });
});
