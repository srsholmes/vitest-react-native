import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { AnimatedButton } from '../src/components/AnimatedButton';

describe('AnimatedButton', () => {
  test('renders with title', () => {
    const { getByText } = render(<AnimatedButton title="Press Me" onPress={() => {}} />);
    expect(getByText('Press Me')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const onPress = vi.fn();
    const { getByText } = render(<AnimatedButton title="Press Me" onPress={onPress} />);

    fireEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('does not call onPress when disabled', () => {
    const onPress = vi.fn();
    const { getByText } = render(<AnimatedButton title="Press Me" onPress={onPress} disabled />);

    fireEvent.press(getByText('Press Me'));
    expect(onPress).not.toHaveBeenCalled();
  });

  test('renders with primary variant by default', () => {
    const { getByTestId } = render(
      <AnimatedButton title="Primary" onPress={() => {}} testID="btn" />
    );
    const button = getByTestId('btn');
    expect(button).toBeTruthy();
  });

  test('renders with secondary variant', () => {
    const { getByTestId } = render(
      <AnimatedButton title="Secondary" onPress={() => {}} variant="secondary" testID="btn" />
    );
    expect(getByTestId('btn')).toBeTruthy();
  });

  test('renders with danger variant', () => {
    const { getByTestId } = render(
      <AnimatedButton title="Danger" onPress={() => {}} variant="danger" testID="btn" />
    );
    expect(getByTestId('btn')).toBeTruthy();
  });

  test('renders with different sizes', () => {
    const { rerender, getByTestId } = render(
      <AnimatedButton title="Small" onPress={() => {}} size="small" testID="btn" />
    );
    expect(getByTestId('btn')).toBeTruthy();

    rerender(<AnimatedButton title="Medium" onPress={() => {}} size="medium" testID="btn" />);
    expect(getByTestId('btn')).toBeTruthy();

    rerender(<AnimatedButton title="Large" onPress={() => {}} size="large" testID="btn" />);
    expect(getByTestId('btn')).toBeTruthy();
  });

  test('has correct accessibility role', () => {
    const { getByTestId } = render(
      <AnimatedButton title="Accessible" onPress={() => {}} testID="btn" />
    );
    const button = getByTestId('btn');
    expect(button.props.accessibilityRole).toBe('button');
  });

  test('handles pressIn and pressOut events', () => {
    const { getByTestId } = render(<AnimatedButton title="Test" onPress={() => {}} testID="btn" />);
    const button = getByTestId('btn');

    fireEvent(button, 'pressIn');
    fireEvent(button, 'pressOut');
    // No errors should occur
    expect(button).toBeTruthy();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <AnimatedButton title="Snapshot Test" onPress={() => {}} testID="btn" />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
