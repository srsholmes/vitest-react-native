import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { TouchableOpacity, Text, View } from 'react-native';

describe('TouchableOpacity Component', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <TouchableOpacity>
        <Text>Press me</Text>
      </TouchableOpacity>
    );
    expect(getByText('Press me')).toBeTruthy();
  });

  test('renders with testID', () => {
    const { getByTestId } = render(
      <TouchableOpacity testID="touchable-button">
        <Text>Press me</Text>
      </TouchableOpacity>
    );
    expect(getByTestId('touchable-button')).toBeTruthy();
  });

  test('handles onPress event', () => {
    const onPress = vi.fn();
    const { getByTestId } = render(
      <TouchableOpacity testID="press-button" onPress={onPress}>
        <Text>Press me</Text>
      </TouchableOpacity>
    );
    fireEvent.press(getByTestId('press-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('handles onPressIn event', () => {
    const onPressIn = vi.fn();
    const { getByTestId } = render(
      <TouchableOpacity testID="press-button" onPressIn={onPressIn}>
        <Text>Press me</Text>
      </TouchableOpacity>
    );
    fireEvent(getByTestId('press-button'), 'pressIn');
    expect(onPressIn).toHaveBeenCalledTimes(1);
  });

  test('handles onPressOut event', () => {
    const onPressOut = vi.fn();
    const { getByTestId } = render(
      <TouchableOpacity testID="press-button" onPressOut={onPressOut}>
        <Text>Press me</Text>
      </TouchableOpacity>
    );
    fireEvent(getByTestId('press-button'), 'pressOut');
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  test('handles onLongPress event', () => {
    const onLongPress = vi.fn();
    const { getByTestId } = render(
      <TouchableOpacity testID="press-button" onLongPress={onLongPress}>
        <Text>Long press me</Text>
      </TouchableOpacity>
    );
    fireEvent(getByTestId('press-button'), 'longPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  test('applies style prop', () => {
    const { getByTestId } = render(
      <TouchableOpacity testID="styled-touchable" style={{ backgroundColor: 'blue', padding: 10 }}>
        <Text>Styled</Text>
      </TouchableOpacity>
    );
    expect(getByTestId('styled-touchable')).toBeTruthy();
  });

  test('renders with activeOpacity', () => {
    const { getByTestId } = render(
      <TouchableOpacity testID="opacity-button" activeOpacity={0.5}>
        <Text>Opacity</Text>
      </TouchableOpacity>
    );
    expect(getByTestId('opacity-button')).toBeTruthy();
  });

  test('handles accessibility props', () => {
    const { getByTestId } = render(
      <TouchableOpacity
        testID="accessible-touchable"
        accessible
        accessibilityLabel="Press this button"
        accessibilityRole="button"
      >
        <Text>Accessible</Text>
      </TouchableOpacity>
    );
    expect(getByTestId('accessible-touchable')).toBeTruthy();
  });

  test('supports role queries without explicitly setting accessible', () => {
    render(
      <TouchableOpacity accessibilityRole="button">
        <Text>Activate</Text>
      </TouchableOpacity>
    );

    expect(screen.getByRole('button')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <View>
        <TouchableOpacity style={{ padding: 10, backgroundColor: 'blue' }}>
          <Text style={{ color: 'white' }}>Press Me</Text>
        </TouchableOpacity>
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
