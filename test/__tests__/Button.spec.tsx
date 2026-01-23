import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { Button, View } from 'react-native';

describe('Button Component', () => {
  test('renders with title', () => {
    const { getByTestId } = render(
      <Button testID="test-button" title="Press Me" onPress={() => {}} />
    );
    expect(getByTestId('test-button')).toBeTruthy();
  });

  test('renders with testID', () => {
    const { getByTestId } = render(
      <Button testID="test-button" title="Press Me" onPress={() => {}} />
    );
    expect(getByTestId('test-button')).toBeTruthy();
  });

  test('handles onPress event', () => {
    const onPress = vi.fn();
    const { getByTestId } = render(
      <Button testID="press-button" title="Press Me" onPress={onPress} />
    );
    fireEvent.press(getByTestId('press-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('renders with disabled prop', () => {
    const onPress = vi.fn();
    const { getByTestId } = render(
      <Button testID="disabled-button" title="Disabled Button" onPress={onPress} disabled />
    );
    expect(getByTestId('disabled-button')).toBeTruthy();
  });

  test('renders with color prop', () => {
    const { getByTestId } = render(
      <Button testID="colored-button" title="Colored Button" onPress={() => {}} color="#841584" />
    );
    expect(getByTestId('colored-button')).toBeTruthy();
  });

  test('renders with accessibilityLabel', () => {
    const { getByTestId } = render(
      <Button
        testID="accessible-button"
        title="Accessible Button"
        onPress={() => {}}
        accessibilityLabel="This is an accessible button"
      />
    );
    expect(getByTestId('accessible-button')).toBeTruthy();
  });

  test('renders multiple buttons', () => {
    const onPress1 = vi.fn();
    const onPress2 = vi.fn();
    const { getByTestId } = render(
      <View>
        <Button testID="button-1" title="Button 1" onPress={onPress1} />
        <Button testID="button-2" title="Button 2" onPress={onPress2} />
      </View>
    );
    fireEvent.press(getByTestId('button-1'));
    fireEvent.press(getByTestId('button-2'));
    expect(onPress1).toHaveBeenCalledTimes(1);
    expect(onPress2).toHaveBeenCalledTimes(1);
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <View>
        <Button testID="snapshot-button" title="Snapshot Button" onPress={() => {}} />
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  test('matches snapshot with disabled', () => {
    const { toJSON } = render(
      <View>
        <Button testID="disabled-button" title="Disabled Button" onPress={() => {}} disabled />
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
