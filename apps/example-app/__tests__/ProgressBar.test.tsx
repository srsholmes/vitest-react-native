import React from 'react';
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react-native';
import { ProgressBar, CircularProgress } from '../src/components/ProgressBar';

describe('ProgressBar', () => {
  test('renders with progress value', () => {
    const { getByTestId } = render(<ProgressBar progress={50} testID="progress" />);
    expect(getByTestId('progress')).toBeTruthy();
  });

  test('shows label by default', () => {
    const { getByTestId } = render(<ProgressBar progress={75} testID="progress" />);
    const label = getByTestId('progress-label');
    // Children is an array: [number, '%']
    expect(label.props.children).toEqual([75, '%']);
  });

  test('hides label when showLabel is false', () => {
    const { queryByTestId } = render(
      <ProgressBar progress={50} showLabel={false} testID="progress" />
    );
    expect(queryByTestId('progress-label')).toBeNull();
  });

  test('clamps progress to 0-100', () => {
    const { getByTestId, rerender } = render(<ProgressBar progress={-10} testID="progress" />);
    expect(getByTestId('progress-label').props.children).toEqual([0, '%']);

    rerender(<ProgressBar progress={150} testID="progress" />);
    expect(getByTestId('progress-label').props.children).toEqual([100, '%']);
  });

  test('renders with custom height', () => {
    const { getByTestId } = render(<ProgressBar progress={50} height={16} testID="progress" />);
    expect(getByTestId('progress')).toBeTruthy();
  });

  test('renders with animated prop set to true', () => {
    const { getByTestId } = render(<ProgressBar progress={50} animated testID="progress" />);
    expect(getByTestId('progress')).toBeTruthy();
  });

  test('renders with animated prop set to false', () => {
    const { getByTestId } = render(
      <ProgressBar progress={50} animated={false} testID="progress" />
    );
    expect(getByTestId('progress')).toBeTruthy();
  });

  test('renders with custom colors', () => {
    const { getByTestId } = render(
      <ProgressBar progress={50} color="#FF0000" backgroundColor="#CCCCCC" testID="progress" />
    );
    expect(getByTestId('progress')).toBeTruthy();
  });

  test('rounds progress to nearest integer for display', () => {
    const { getByTestId } = render(<ProgressBar progress={33.7} testID="progress" />);
    expect(getByTestId('progress-label').props.children).toEqual([34, '%']);
  });

  test('handles 0 progress', () => {
    const { getByTestId } = render(<ProgressBar progress={0} testID="progress" />);
    expect(getByTestId('progress-label').props.children).toEqual([0, '%']);
  });

  test('handles 100 progress', () => {
    const { getByTestId } = render(<ProgressBar progress={100} testID="progress" />);
    expect(getByTestId('progress-label').props.children).toEqual([100, '%']);
  });

  test('matches snapshot at 0%', () => {
    const { toJSON } = render(<ProgressBar progress={0} testID="progress" />);
    expect(toJSON()).toMatchSnapshot();
  });

  test('matches snapshot at 50%', () => {
    const { toJSON } = render(<ProgressBar progress={50} testID="progress" />);
    expect(toJSON()).toMatchSnapshot();
  });

  test('matches snapshot at 100%', () => {
    const { toJSON } = render(<ProgressBar progress={100} testID="progress" />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('CircularProgress', () => {
  test('renders with progress value', () => {
    const { getByTestId } = render(<CircularProgress progress={50} testID="circular" />);
    expect(getByTestId('circular')).toBeTruthy();
  });

  test('shows label by default', () => {
    const { getByTestId } = render(<CircularProgress progress={75} testID="circular" />);
    expect(getByTestId('circular-label').props.children).toEqual([75, '%']);
  });

  test('hides label when showLabel is false', () => {
    const { queryByTestId } = render(
      <CircularProgress progress={50} showLabel={false} testID="circular" />
    );
    expect(queryByTestId('circular-label')).toBeNull();
  });

  test('renders with custom size', () => {
    const { getByTestId } = render(<CircularProgress progress={50} size={150} testID="circular" />);
    expect(getByTestId('circular')).toBeTruthy();
  });

  test('renders with custom strokeWidth', () => {
    const { getByTestId } = render(
      <CircularProgress progress={50} strokeWidth={15} testID="circular" />
    );
    expect(getByTestId('circular')).toBeTruthy();
  });

  test('clamps progress to 0-100', () => {
    const { getByTestId, rerender } = render(<CircularProgress progress={-20} testID="circular" />);
    expect(getByTestId('circular-label').props.children).toEqual([0, '%']);

    rerender(<CircularProgress progress={200} testID="circular" />);
    expect(getByTestId('circular-label').props.children).toEqual([100, '%']);
  });

  test('matches snapshot', () => {
    const { toJSON } = render(<CircularProgress progress={65} testID="circular" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
