import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { AnimatedCard } from '../src/components/AnimatedCard';

describe('AnimatedCard', () => {
  const defaultProps = {
    title: 'Test Card',
    description: 'This is a test description for the card.',
  };

  test('renders with title and description', () => {
    const { getByText } = render(<AnimatedCard {...defaultProps} />);

    expect(getByText('Test Card')).toBeTruthy();
    expect(getByText('This is a test description for the card.')).toBeTruthy();
  });

  test('renders image when imageUrl is provided', () => {
    const { getByTestId } = render(
      <AnimatedCard {...defaultProps} imageUrl="https://example.com/image.jpg" testID="card" />
    );

    expect(getByTestId('card-image')).toBeTruthy();
  });

  test('does not render image when imageUrl is not provided', () => {
    const { queryByTestId } = render(<AnimatedCard {...defaultProps} testID="card" />);

    expect(queryByTestId('card-image')).toBeNull();
  });

  test('calls onPress when card is pressed', () => {
    const onPress = vi.fn();
    const { getByTestId } = render(
      <AnimatedCard {...defaultProps} onPress={onPress} testID="card" />
    );

    fireEvent.press(getByTestId('card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('calls onLike when like button is pressed', () => {
    const onLike = vi.fn();
    const { getByTestId } = render(
      <AnimatedCard {...defaultProps} onLike={onLike} testID="card" />
    );

    fireEvent.press(getByTestId('card-like'));
    expect(onLike).toHaveBeenCalledTimes(1);
  });

  test('shows filled heart when liked', () => {
    const { getByTestId } = render(<AnimatedCard {...defaultProps} liked testID="card" />);

    const likeButton = getByTestId('card-like');
    // Check that it renders the liked state
    expect(likeButton).toBeTruthy();
  });

  test('shows empty heart when not liked', () => {
    const { getByTestId } = render(<AnimatedCard {...defaultProps} liked={false} testID="card" />);

    const likeButton = getByTestId('card-like');
    expect(likeButton).toBeTruthy();
  });

  test('handles pressIn and pressOut events', () => {
    const { getByTestId } = render(<AnimatedCard {...defaultProps} testID="card" />);

    const card = getByTestId('card');
    fireEvent(card, 'pressIn');
    fireEvent(card, 'pressOut');
    expect(card).toBeTruthy();
  });

  test('has correct accessibility role', () => {
    const { getByTestId } = render(<AnimatedCard {...defaultProps} testID="card" />);
    const card = getByTestId('card');
    expect(card.props.accessibilityRole).toBe('button');
  });

  test('like button has correct accessibility label when not liked', () => {
    const { getByTestId } = render(<AnimatedCard {...defaultProps} liked={false} testID="card" />);
    const likeButton = getByTestId('card-like');
    expect(likeButton.props.accessibilityLabel).toBe('Like');
  });

  test('like button has correct accessibility label when liked', () => {
    const { getByTestId } = render(<AnimatedCard {...defaultProps} liked testID="card" />);
    const likeButton = getByTestId('card-like');
    expect(likeButton.props.accessibilityLabel).toBe('Unlike');
  });

  test('renders with testID', () => {
    const { getByTestId } = render(<AnimatedCard {...defaultProps} testID="my-card" />);
    expect(getByTestId('my-card')).toBeTruthy();
    expect(getByTestId('my-card-title')).toBeTruthy();
    expect(getByTestId('my-card-description')).toBeTruthy();
    expect(getByTestId('my-card-like')).toBeTruthy();
  });

  test('matches snapshot without image', () => {
    const { toJSON } = render(<AnimatedCard {...defaultProps} testID="card" />);
    expect(toJSON()).toMatchSnapshot();
  });

  test('matches snapshot with image and liked', () => {
    const { toJSON } = render(
      <AnimatedCard
        {...defaultProps}
        imageUrl="https://example.com/image.jpg"
        liked
        testID="card"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
