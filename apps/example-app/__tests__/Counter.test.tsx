import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { Counter } from '../src/components/Counter';

describe('Counter', () => {
  test('renders with initial value', () => {
    const { getByTestId } = render(<Counter initialValue={5} testID="counter" />);
    expect(getByTestId('counter-value').props.children).toBe(5);
  });

  test('renders with default initial value of 0', () => {
    const { getByTestId } = render(<Counter testID="counter" />);
    expect(getByTestId('counter-value').props.children).toBe(0);
  });

  test('increments value when increment button is pressed', () => {
    const { getByTestId } = render(<Counter testID="counter" />);

    fireEvent.press(getByTestId('counter-increment'));
    expect(getByTestId('counter-value').props.children).toBe(1);
  });

  test('decrements value when decrement button is pressed', () => {
    const { getByTestId } = render(<Counter initialValue={5} testID="counter" />);

    fireEvent.press(getByTestId('counter-decrement'));
    expect(getByTestId('counter-value').props.children).toBe(4);
  });

  test('calls onChange with new value on increment', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Counter initialValue={0} onChange={onChange} testID="counter" />
    );

    fireEvent.press(getByTestId('counter-increment'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  test('calls onChange with new value on decrement', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Counter initialValue={5} onChange={onChange} testID="counter" />
    );

    fireEvent.press(getByTestId('counter-decrement'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  test('respects max limit', () => {
    const { getByTestId } = render(<Counter initialValue={10} max={10} testID="counter" />);

    fireEvent.press(getByTestId('counter-increment'));
    expect(getByTestId('counter-value').props.children).toBe(10);
  });

  test('respects min limit', () => {
    const { getByTestId } = render(<Counter initialValue={0} min={0} testID="counter" />);

    fireEvent.press(getByTestId('counter-decrement'));
    expect(getByTestId('counter-value').props.children).toBe(0);
  });

  test('increments by custom step', () => {
    const { getByTestId } = render(<Counter initialValue={0} step={5} testID="counter" />);

    fireEvent.press(getByTestId('counter-increment'));
    expect(getByTestId('counter-value').props.children).toBe(5);
  });

  test('decrements by custom step', () => {
    const { getByTestId } = render(<Counter initialValue={10} step={3} testID="counter" />);

    fireEvent.press(getByTestId('counter-decrement'));
    expect(getByTestId('counter-value').props.children).toBe(7);
  });

  test('resets to initial value', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <Counter initialValue={5} onChange={onChange} testID="counter" />
    );

    fireEvent.press(getByTestId('counter-increment'));
    fireEvent.press(getByTestId('counter-increment'));
    expect(getByTestId('counter-value').props.children).toBe(7);

    fireEvent.press(getByTestId('counter-reset'));
    expect(getByTestId('counter-value').props.children).toBe(5);
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  test('disables decrement button at min', () => {
    const { getByTestId } = render(<Counter initialValue={0} min={0} testID="counter" />);

    const decrementButton = getByTestId('counter-decrement');
    expect(decrementButton.props.disabled).toBe(true);
  });

  test('disables increment button at max', () => {
    const { getByTestId } = render(<Counter initialValue={10} max={10} testID="counter" />);

    const incrementButton = getByTestId('counter-increment');
    expect(incrementButton.props.disabled).toBe(true);
  });

  test('has correct accessibility labels', () => {
    const { getByLabelText } = render(<Counter testID="counter" />);

    expect(getByLabelText('Increment')).toBeTruthy();
    expect(getByLabelText('Decrement')).toBeTruthy();
    expect(getByLabelText('Reset')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(<Counter initialValue={42} testID="counter" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
