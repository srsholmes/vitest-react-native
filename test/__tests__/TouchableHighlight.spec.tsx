import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableHighlight, Text, View } from 'react-native';

describe('TouchableHighlight Component', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <TouchableHighlight>
        <Text>Press me</Text>
      </TouchableHighlight>
    );
    expect(getByText('Press me')).toBeTruthy();
  });

  test('renders with testID', () => {
    const { getByTestId } = render(
      <TouchableHighlight testID="highlight-button">
        <Text>Press me</Text>
      </TouchableHighlight>
    );
    expect(getByTestId('highlight-button')).toBeTruthy();
  });

  test('handles onPress event', () => {
    const onPress = vi.fn();
    const { getByTestId } = render(
      <TouchableHighlight testID="press-button" onPress={onPress}>
        <Text>Press me</Text>
      </TouchableHighlight>
    );
    fireEvent.press(getByTestId('press-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('handles onPressIn event', () => {
    const onPressIn = vi.fn();
    const { getByTestId } = render(
      <TouchableHighlight testID="press-button" onPressIn={onPressIn}>
        <Text>Press me</Text>
      </TouchableHighlight>
    );
    fireEvent(getByTestId('press-button'), 'pressIn');
    expect(onPressIn).toHaveBeenCalledTimes(1);
  });

  test('handles onPressOut event', () => {
    const onPressOut = vi.fn();
    const { getByTestId } = render(
      <TouchableHighlight testID="press-button" onPressOut={onPressOut}>
        <Text>Press me</Text>
      </TouchableHighlight>
    );
    fireEvent(getByTestId('press-button'), 'pressOut');
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  test('handles onLongPress event', () => {
    const onLongPress = vi.fn();
    const { getByTestId } = render(
      <TouchableHighlight testID="press-button" onLongPress={onLongPress}>
        <Text>Long press me</Text>
      </TouchableHighlight>
    );
    fireEvent(getByTestId('press-button'), 'longPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  test('applies style prop', () => {
    const { getByTestId } = render(
      <TouchableHighlight
        testID="styled-highlight"
        style={{ backgroundColor: 'blue', padding: 10 }}
      >
        <Text>Styled</Text>
      </TouchableHighlight>
    );
    expect(getByTestId('styled-highlight')).toBeTruthy();
  });

  test('renders with underlayColor', () => {
    const { getByTestId } = render(
      <TouchableHighlight testID="underlay-button" underlayColor="darkblue">
        <Text>Underlay</Text>
      </TouchableHighlight>
    );
    expect(getByTestId('underlay-button')).toBeTruthy();
  });

  test('handles accessibility props', () => {
    const { getByTestId } = render(
      <TouchableHighlight
        testID="accessible-highlight"
        accessible
        accessibilityLabel="Press this button"
        accessibilityRole="button"
      >
        <Text>Accessible</Text>
      </TouchableHighlight>
    );
    expect(getByTestId('accessible-highlight')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <View>
        <TouchableHighlight
          style={{ padding: 10, backgroundColor: 'blue' }}
          underlayColor="darkblue"
        >
          <Text style={{ color: 'white' }}>Press Me</Text>
        </TouchableHighlight>
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
