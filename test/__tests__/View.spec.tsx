import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';

describe('View Component', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <View>
        <Text>Hello, World!</Text>
      </View>
    );
    expect(getByText('Hello, World!')).toBeTruthy();
  });

  test('renders with testID', () => {
    const { getByTestId } = render(<View testID="test-view" />);
    expect(getByTestId('test-view')).toBeTruthy();
  });

  test('applies style prop', () => {
    const { getByTestId } = render(
      <View testID="styled-view" style={{ backgroundColor: 'red', padding: 10 }} />
    );
    const view = getByTestId('styled-view');
    expect(view).toBeTruthy();
  });

  test('renders nested views', () => {
    const { getByTestId } = render(
      <View testID="outer">
        <View testID="inner">
          <Text>Nested content</Text>
        </View>
      </View>
    );
    expect(getByTestId('outer')).toBeTruthy();
    expect(getByTestId('inner')).toBeTruthy();
  });

  test('handles accessibility props', () => {
    const { getByTestId } = render(
      <View
        testID="accessible-view"
        accessible
        accessibilityLabel="Test accessibility label"
        accessibilityRole="button"
      />
    );
    expect(getByTestId('accessible-view')).toBeTruthy();
  });

  test('handles onLayout event', () => {
    const onLayout = vi.fn();
    const { getByTestId } = render(<View testID="layout-view" onLayout={onLayout} />);
    const view = getByTestId('layout-view');
    fireEvent(view, 'layout', {
      nativeEvent: { layout: { width: 100, height: 100, x: 0, y: 0 } },
    });
    expect(onLayout).toHaveBeenCalled();
  });

  test('renders with array of styles', () => {
    const style1 = { backgroundColor: 'blue' };
    const style2 = { padding: 20 };
    const { getByTestId } = render(<View testID="multi-style-view" style={[style1, style2]} />);
    expect(getByTestId('multi-style-view')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <View style={{ flex: 1 }}>
        <Text>Snapshot test</Text>
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
