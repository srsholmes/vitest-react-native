import { describe, expect, test } from 'vitest';
import {
  shouldTransformReactNativeDependency,
  transformReactNativeDependency,
} from '../../packages/vitest-react-native/src/reactNativeDependencyTransform';

const dependencySource = `
  import React from 'react';
  import { View } from 'react-native';

  type Props = {
    title?: string,
  };

  export default function DateTimePickerModal(props: Props) {
    return <View>{props.title}</View>;
  }
`;

describe('reactNativeDependencyTransform', () => {
  test('transforms third-party React Native dependencies with JSX in .js files', () => {
    const result = transformReactNativeDependency(
      dependencySource,
      '/project/node_modules/react-native-modal-datetime-picker/src/DateTimePickerModal.ios.js'
    );

    expect(result).toBeDefined();
    expect(result?.code).not.toContain('type Props');
    expect(result?.code).not.toContain('<View>');
    expect(result?.code).toContain('React.createElement');
  });

  test('leaves unrelated JavaScript dependencies untouched', () => {
    expect(shouldTransformReactNativeDependency('/project/node_modules/lodash/index.js')).toBe(
      false
    );
  });
});
