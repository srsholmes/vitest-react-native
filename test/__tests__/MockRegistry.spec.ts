import { describe, it, expect } from 'vitest';

import { findMock } from '../../packages/vitest-react-native/src/mocks.js';

const entry = (path: string) => ({ path, code: `/* ${path} */` });

describe('findMock', () => {
  it('returns undefined when no entry matches', () => {
    const entries = [entry('react-native/Libraries/Text/Text')];
    expect(findMock(entries, '/app/node_modules/react-native/Libraries/Alert/Alert.js')).toBe(
      undefined
    );
  });

  it('matches a module by its path', () => {
    const text = entry('react-native/Libraries/Text/Text');
    expect(findMock([text], '/app/node_modules/react-native/Libraries/Text/Text.js')).toBe(text);
  });

  // https://github.com/srsholmes/vitest-react-native/issues/31
  it.each([
    [
      'react-native/Libraries/Components/Keyboard/Keyboard',
      'react-native/Libraries/Components/Keyboard/KeyboardAvoidingView',
    ],
    ['react-native/Libraries/Image/Image', 'react-native/Libraries/Image/ImageBackground'],
    [
      'react-native/Libraries/Components/View/View',
      'react-native/Libraries/Components/View/ViewNativeComponent',
    ],
    [
      'react-native/src/private/featureflags/ReactNativeFeatureFlags',
      'react-native/src/private/featureflags/ReactNativeFeatureFlagsBase',
    ],
  ])('prefers %s → %s regardless of registration order', (shorter, longer) => {
    const short = entry(shorter);
    const long = entry(longer);
    const file = `/app/node_modules/${longer}.js`;

    expect(findMock([short, long], file)).toBe(long);
    expect(findMock([long, short], file)).toBe(long);
    expect(findMock([short, long], `/app/node_modules/${shorter}.js`)).toBe(short);
  });

  it('matches Windows-style paths', () => {
    const kav = entry('react-native/Libraries/Components/Keyboard/KeyboardAvoidingView');
    const entries = [entry('react-native/Libraries/Components/Keyboard/Keyboard'), kav];
    const file =
      'C:\\app\\node_modules\\react-native\\Libraries\\Components\\Keyboard\\KeyboardAvoidingView.js';
    expect(findMock(entries, file)).toBe(kav);
  });
});
