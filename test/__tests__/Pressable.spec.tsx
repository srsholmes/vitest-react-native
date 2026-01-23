import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

describe('Pressable Component', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <Pressable>
        <Text>Press me</Text>
      </Pressable>
    );
    expect(getByText('Press me')).toBeTruthy();
  });

  test('renders with testID', () => {
    const { getByTestId } = render(
      <Pressable testID="pressable-button">
        <Text>Press me</Text>
      </Pressable>
    );
    expect(getByTestId('pressable-button')).toBeTruthy();
  });

  test('handles onPress event', () => {
    const onPress = vi.fn();
    const { getByTestId } = render(
      <Pressable testID="press-button" onPress={onPress}>
        <Text>Press me</Text>
      </Pressable>
    );
    fireEvent.press(getByTestId('press-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('handles onPressIn event', () => {
    const onPressIn = vi.fn();
    const { getByTestId } = render(
      <Pressable testID="press-button" onPressIn={onPressIn}>
        <Text>Press me</Text>
      </Pressable>
    );
    fireEvent(getByTestId('press-button'), 'pressIn');
    expect(onPressIn).toHaveBeenCalledTimes(1);
  });

  test('handles onPressOut event', () => {
    const onPressOut = vi.fn();
    const { getByTestId } = render(
      <Pressable testID="press-button" onPressOut={onPressOut}>
        <Text>Press me</Text>
      </Pressable>
    );
    fireEvent(getByTestId('press-button'), 'pressOut');
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  test('handles onLongPress event', () => {
    const onLongPress = vi.fn();
    const { getByTestId } = render(
      <Pressable testID="press-button" onLongPress={onLongPress}>
        <Text>Long press me</Text>
      </Pressable>
    );
    fireEvent(getByTestId('press-button'), 'longPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  test('does not fire onPress when disabled', () => {
    const onPress = vi.fn();
    const { getByTestId } = render(
      <Pressable testID="disabled-button" onPress={onPress} disabled>
        <Text>Disabled</Text>
      </Pressable>
    );
    fireEvent.press(getByTestId('disabled-button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  test('applies style prop', () => {
    const { getByTestId } = render(
      <Pressable testID="styled-pressable" style={{ backgroundColor: 'blue', padding: 10 }}>
        <Text>Styled</Text>
      </Pressable>
    );
    expect(getByTestId('styled-pressable')).toBeTruthy();
  });

  test('supports function style prop', () => {
    const styleFn = vi.fn(({ pressed }) => ({
      backgroundColor: pressed ? 'darkblue' : 'blue',
      padding: 10,
    }));

    const { getByTestId } = render(
      <Pressable testID="fn-styled-pressable" style={styleFn}>
        <Text>Function Style</Text>
      </Pressable>
    );
    expect(getByTestId('fn-styled-pressable')).toBeTruthy();
  });

  test('supports function children prop', () => {
    const { getByText } = render(
      <Pressable testID="fn-children-pressable">
        {({ pressed }) => <Text>{pressed ? 'Pressed!' : 'Not pressed'}</Text>}
      </Pressable>
    );
    expect(getByText('Not pressed')).toBeTruthy();
  });

  test('renders with hitSlop', () => {
    const onPress = vi.fn();
    const { getByTestId } = render(
      <Pressable testID="hitslop-button" onPress={onPress} hitSlop={10}>
        <Text>Hit slop</Text>
      </Pressable>
    );
    fireEvent.press(getByTestId('hitslop-button'));
    expect(onPress).toHaveBeenCalled();
  });

  test('renders with pressRetentionOffset', () => {
    const { getByTestId } = render(
      <Pressable
        testID="retention-button"
        pressRetentionOffset={{ top: 10, left: 10, right: 10, bottom: 10 }}
      >
        <Text>Press retention</Text>
      </Pressable>
    );
    expect(getByTestId('retention-button')).toBeTruthy();
  });

  test('renders with delayLongPress', () => {
    const onLongPress = vi.fn();
    const { getByTestId } = render(
      <Pressable testID="delay-button" onLongPress={onLongPress} delayLongPress={1000}>
        <Text>Long delay</Text>
      </Pressable>
    );
    expect(getByTestId('delay-button')).toBeTruthy();
  });

  test('handles accessibility props', () => {
    const { getByTestId } = render(
      <Pressable
        testID="accessible-pressable"
        accessible
        accessibilityLabel="Press this button"
        accessibilityRole="button"
        accessibilityHint="Performs an action"
      >
        <Text>Accessible</Text>
      </Pressable>
    );
    expect(getByTestId('accessible-pressable')).toBeTruthy();
  });

  test('renders nested pressables', () => {
    const outerPress = vi.fn();
    const innerPress = vi.fn();
    const { getByTestId } = render(
      <Pressable testID="outer" onPress={outerPress}>
        <Pressable testID="inner" onPress={innerPress}>
          <Text>Nested</Text>
        </Pressable>
      </Pressable>
    );
    fireEvent.press(getByTestId('inner'));
    expect(innerPress).toHaveBeenCalled();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <View>
        <Pressable style={{ padding: 10, backgroundColor: 'blue' }}>
          <Text style={{ color: 'white' }}>Press Me</Text>
        </Pressable>
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
