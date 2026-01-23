import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';

describe('Text Component', () => {
  test('renders text content', () => {
    const { getByText } = render(<Text>Hello, World!</Text>);
    expect(getByText('Hello, World!')).toBeTruthy();
  });

  test('renders with testID', () => {
    const { getByTestId } = render(<Text testID="test-text">Content</Text>);
    expect(getByTestId('test-text')).toBeTruthy();
  });

  test('renders nested text', () => {
    const { getByText } = render(
      <Text>
        Hello, <Text style={{ fontWeight: 'bold' }}>World</Text>!
      </Text>
    );
    expect(getByText(/Hello/)).toBeTruthy();
    expect(getByText('World')).toBeTruthy();
  });

  test('applies style prop', () => {
    const { getByTestId } = render(
      <Text testID="styled-text" style={{ fontSize: 16, color: 'red', fontWeight: 'bold' }}>
        Styled text
      </Text>
    );
    expect(getByTestId('styled-text')).toBeTruthy();
  });

  test('handles onPress event', () => {
    const onPress = vi.fn();
    const { getByTestId } = render(
      <Text testID="pressable-text" onPress={onPress}>
        Press me
      </Text>
    );
    fireEvent.press(getByTestId('pressable-text'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('handles onLongPress event', () => {
    const onLongPress = vi.fn();
    const { getByTestId } = render(
      <Text testID="long-press-text" onLongPress={onLongPress}>
        Long press me
      </Text>
    );
    fireEvent(getByTestId('long-press-text'), 'longPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  test('renders with numberOfLines', () => {
    const { getByTestId } = render(
      <Text testID="truncated-text" numberOfLines={2}>
        This is a very long text that should be truncated after two lines of content.
      </Text>
    );
    expect(getByTestId('truncated-text')).toBeTruthy();
  });

  test('renders selectable text', () => {
    const { getByTestId } = render(
      <Text testID="selectable-text" selectable>
        Select this text
      </Text>
    );
    expect(getByTestId('selectable-text')).toBeTruthy();
  });

  test('handles accessibility props', () => {
    const { getByTestId } = render(
      <Text
        testID="accessible-text"
        accessible
        accessibilityLabel="Accessible text label"
        accessibilityRole="text"
      >
        Accessible content
      </Text>
    );
    expect(getByTestId('accessible-text')).toBeTruthy();
  });

  test('renders with ellipsizeMode', () => {
    const { getByTestId } = render(
      <Text testID="ellipsize-text" numberOfLines={1} ellipsizeMode="tail">
        This text will be truncated with ellipsis at the tail
      </Text>
    );
    expect(getByTestId('ellipsize-text')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <View>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Title</Text>
        <Text style={{ color: 'gray' }}>Subtitle</Text>
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
