import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { Switch, View } from 'react-native';

describe('Switch Component', () => {
  test('renders correctly', () => {
    const { getByTestId } = render(<Switch testID="switch" />);
    expect(getByTestId('switch')).toBeTruthy();
  });

  test('renders with value prop', () => {
    const { getByTestId } = render(<Switch testID="switch" value={true} />);
    expect(getByTestId('switch')).toBeTruthy();
  });

  test('handles onValueChange event', () => {
    const onValueChange = vi.fn();
    const { getByTestId } = render(
      <Switch testID="switch" value={false} onValueChange={onValueChange} />
    );
    fireEvent(getByTestId('switch'), 'valueChange', true);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  test('renders with disabled prop', () => {
    const { getByTestId } = render(<Switch testID="switch" disabled />);
    expect(getByTestId('switch')).toBeTruthy();
  });

  test('renders with trackColor prop', () => {
    const { getByTestId } = render(
      <Switch testID="switch" trackColor={{ false: '#767577', true: '#81b0ff' }} />
    );
    expect(getByTestId('switch')).toBeTruthy();
  });

  test('renders with thumbColor prop', () => {
    const { getByTestId } = render(<Switch testID="switch" thumbColor="#f5dd4b" />);
    expect(getByTestId('switch')).toBeTruthy();
  });

  test('renders with ios_backgroundColor prop', () => {
    const { getByTestId } = render(<Switch testID="switch" ios_backgroundColor="#3e3e3e" />);
    expect(getByTestId('switch')).toBeTruthy();
  });

  test('handles accessibility props', () => {
    const { getByTestId } = render(
      <Switch
        testID="accessible-switch"
        accessible
        accessibilityLabel="Toggle setting"
        accessibilityRole="switch"
      />
    );
    expect(getByTestId('accessible-switch')).toBeTruthy();
  });

  test('renders in a container', () => {
    const { getByTestId } = render(
      <View testID="container">
        <Switch testID="switch" value={true} />
      </View>
    );
    expect(getByTestId('container')).toBeTruthy();
    expect(getByTestId('switch')).toBeTruthy();
  });

  test('matches snapshot with value false', () => {
    const { toJSON } = render(
      <View>
        <Switch value={false} />
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  test('matches snapshot with value true', () => {
    const { toJSON } = render(
      <View>
        <Switch value={true} />
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
