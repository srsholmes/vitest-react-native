import React from 'react';
import { test, expect, describe } from 'vitest';
import { render } from '@testing-library/react-native';
import { ActivityIndicator, View } from 'react-native';

describe('ActivityIndicator Component', () => {
  test('renders correctly', () => {
    const { getByTestId } = render(<ActivityIndicator testID="loader" />);
    expect(getByTestId('loader')).toBeTruthy();
  });

  test('renders when animating is true', () => {
    const { getByTestId } = render(<ActivityIndicator testID="animating-loader" animating />);
    expect(getByTestId('animating-loader')).toBeTruthy();
  });

  test('renders when animating is false', () => {
    const { getByTestId } = render(<ActivityIndicator testID="static-loader" animating={false} />);
    expect(getByTestId('static-loader')).toBeTruthy();
  });

  test('renders with small size', () => {
    const { getByTestId } = render(<ActivityIndicator testID="small-loader" size="small" />);
    expect(getByTestId('small-loader')).toBeTruthy();
  });

  test('renders with large size', () => {
    const { getByTestId } = render(<ActivityIndicator testID="large-loader" size="large" />);
    expect(getByTestId('large-loader')).toBeTruthy();
  });

  test('renders with numeric size', () => {
    const { getByTestId } = render(<ActivityIndicator testID="custom-size-loader" size={48} />);
    expect(getByTestId('custom-size-loader')).toBeTruthy();
  });

  test('renders with color', () => {
    const { getByTestId } = render(<ActivityIndicator testID="colored-loader" color="#ff0000" />);
    expect(getByTestId('colored-loader')).toBeTruthy();
  });

  test('renders with named color', () => {
    const { getByTestId } = render(<ActivityIndicator testID="named-color-loader" color="blue" />);
    expect(getByTestId('named-color-loader')).toBeTruthy();
  });

  test('renders with hidesWhenStopped true', () => {
    const { queryByTestId } = render(
      <ActivityIndicator testID="hiding-loader" animating={false} hidesWhenStopped />
    );
    // Should still be queryable even when hidden
    expect(queryByTestId('hiding-loader')).toBeTruthy();
  });

  test('renders with hidesWhenStopped false', () => {
    const { getByTestId } = render(
      <ActivityIndicator testID="visible-loader" animating={false} hidesWhenStopped={false} />
    );
    expect(getByTestId('visible-loader')).toBeTruthy();
  });

  test('renders inside a View', () => {
    const { getByTestId } = render(
      <View testID="container">
        <ActivityIndicator testID="contained-loader" />
      </View>
    );
    expect(getByTestId('container')).toBeTruthy();
    expect(getByTestId('contained-loader')).toBeTruthy();
  });

  test('renders with style prop', () => {
    const { getByTestId } = render(
      <ActivityIndicator testID="styled-loader" style={{ marginTop: 20 }} />
    );
    expect(getByTestId('styled-loader')).toBeTruthy();
  });

  test('renders with accessibility props', () => {
    const { getByTestId } = render(
      <ActivityIndicator
        testID="accessible-loader"
        accessible
        accessibilityLabel="Loading content"
      />
    );
    expect(getByTestId('accessible-loader')).toBeTruthy();
  });

  test('matches snapshot with default props', () => {
    const { toJSON } = render(<ActivityIndicator />);
    expect(toJSON()).toMatchSnapshot();
  });

  test('matches snapshot with all props', () => {
    const { toJSON } = render(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" animating hidesWhenStopped={false} />
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
