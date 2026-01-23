import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableWithoutFeedback, View, Text } from 'react-native';

describe('TouchableWithoutFeedback', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <TouchableWithoutFeedback>
        <View>
          <Text>Press me</Text>
        </View>
      </TouchableWithoutFeedback>
    );
    expect(getByText('Press me')).toBeTruthy();
  });

  test('handles onPress event', () => {
    const onPress = vi.fn();
    const { getByText } = render(
      <TouchableWithoutFeedback onPress={onPress}>
        <View>
          <Text>Press me</Text>
        </View>
      </TouchableWithoutFeedback>
    );

    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalled();
  });

  test('handles onLongPress event', () => {
    const onLongPress = vi.fn();
    const { getByText } = render(
      <TouchableWithoutFeedback onLongPress={onLongPress}>
        <View>
          <Text>Long press me</Text>
        </View>
      </TouchableWithoutFeedback>
    );

    fireEvent(getByText('Long press me'), 'longPress');
    expect(onLongPress).toHaveBeenCalled();
  });

  test('handles disabled state', () => {
    const onPress = vi.fn();
    const { getByTestId } = render(
      <TouchableWithoutFeedback onPress={onPress} disabled testID="touchable">
        <View>
          <Text>Disabled</Text>
        </View>
      </TouchableWithoutFeedback>
    );

    const touchable = getByTestId('touchable');
    expect(touchable.props.disabled).toBe(true);
  });
});
