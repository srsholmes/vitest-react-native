import React from 'react';
import { test, expect, describe } from 'vitest';
import { render } from '@testing-library/react-native';
import { SafeAreaView, Text, View } from 'react-native';

describe('SafeAreaView Component', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <SafeAreaView>
        <Text>Safe content</Text>
      </SafeAreaView>
    );
    expect(getByText('Safe content')).toBeTruthy();
  });

  test('renders with testID', () => {
    const { getByTestId } = render(
      <SafeAreaView testID="safe-area">
        <Text>Content</Text>
      </SafeAreaView>
    );
    expect(getByTestId('safe-area')).toBeTruthy();
  });

  test('applies style prop', () => {
    const { getByTestId } = render(
      <SafeAreaView testID="styled-safe-area" style={{ flex: 1, backgroundColor: 'white' }}>
        <Text>Styled content</Text>
      </SafeAreaView>
    );
    expect(getByTestId('styled-safe-area')).toBeTruthy();
  });

  test('renders nested views', () => {
    const { getByTestId } = render(
      <SafeAreaView testID="outer-safe-area">
        <View testID="inner-view">
          <Text>Nested content</Text>
        </View>
      </SafeAreaView>
    );
    expect(getByTestId('outer-safe-area')).toBeTruthy();
    expect(getByTestId('inner-view')).toBeTruthy();
  });

  test('handles array of styles', () => {
    const style1 = { flex: 1 };
    const style2 = { backgroundColor: 'white' };
    const { getByTestId } = render(
      <SafeAreaView testID="multi-style-safe-area" style={[style1, style2]}>
        <Text>Multi styled</Text>
      </SafeAreaView>
    );
    expect(getByTestId('multi-style-safe-area')).toBeTruthy();
  });

  test('handles accessibility props', () => {
    const { getByTestId } = render(
      <SafeAreaView
        testID="accessible-safe-area"
        accessible
        accessibilityLabel="Safe area container"
      >
        <Text>Accessible content</Text>
      </SafeAreaView>
    );
    expect(getByTestId('accessible-safe-area')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <SafeAreaView style={{ flex: 1 }}>
        <Text>Safe Area Content</Text>
      </SafeAreaView>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
