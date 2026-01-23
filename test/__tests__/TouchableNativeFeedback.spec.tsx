import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableNativeFeedback, View, Text } from 'react-native';

describe('TouchableNativeFeedback', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <TouchableNativeFeedback>
        <View>
          <Text>Press me</Text>
        </View>
      </TouchableNativeFeedback>
    );
    expect(getByText('Press me')).toBeTruthy();
  });

  test('handles onPress event', () => {
    const onPress = vi.fn();
    const { getByText } = render(
      <TouchableNativeFeedback onPress={onPress}>
        <View>
          <Text>Press me</Text>
        </View>
      </TouchableNativeFeedback>
    );

    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalled();
  });

  test('has SelectableBackground static method', () => {
    expect(typeof TouchableNativeFeedback.SelectableBackground).toBe('function');
    const result = TouchableNativeFeedback.SelectableBackground();
    expect(result).toBeDefined();
  });

  test('has SelectableBackgroundBorderless static method', () => {
    expect(typeof TouchableNativeFeedback.SelectableBackgroundBorderless).toBe('function');
    const result = TouchableNativeFeedback.SelectableBackgroundBorderless();
    expect(result).toBeDefined();
  });

  test('has Ripple static method', () => {
    expect(typeof TouchableNativeFeedback.Ripple).toBe('function');
    const result = TouchableNativeFeedback.Ripple('#ffffff', true);
    expect(result).toBeDefined();
  });

  test('has canUseNativeForeground static method', () => {
    expect(typeof TouchableNativeFeedback.canUseNativeForeground).toBe('function');
    const result = TouchableNativeFeedback.canUseNativeForeground();
    expect(result).toBe(false);
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <TouchableNativeFeedback>
        <View>
          <Text>Native Feedback</Text>
        </View>
      </TouchableNativeFeedback>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
