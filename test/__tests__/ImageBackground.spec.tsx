import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { ImageBackground, Text, View } from 'react-native';

describe('ImageBackground Component', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <ImageBackground source={{ uri: 'https://example.com/image.png' }}>
        <Text>Overlay text</Text>
      </ImageBackground>
    );
    expect(getByText('Overlay text')).toBeTruthy();
  });

  test('renders with testID', () => {
    const { getByTestId } = render(
      <ImageBackground testID="image-background" source={{ uri: 'https://example.com/image.png' }}>
        <Text>Content</Text>
      </ImageBackground>
    );
    expect(getByTestId('image-background')).toBeTruthy();
  });

  test('applies style prop', () => {
    const { getByTestId } = render(
      <ImageBackground
        testID="styled-image-bg"
        source={{ uri: 'https://example.com/image.png' }}
        style={{ width: 200, height: 200 }}
      >
        <Text>Styled content</Text>
      </ImageBackground>
    );
    expect(getByTestId('styled-image-bg')).toBeTruthy();
  });

  test('applies imageStyle prop', () => {
    const { getByTestId } = render(
      <ImageBackground
        testID="image-styled-bg"
        source={{ uri: 'https://example.com/image.png' }}
        imageStyle={{ borderRadius: 10 }}
      >
        <Text>Image styled</Text>
      </ImageBackground>
    );
    expect(getByTestId('image-styled-bg')).toBeTruthy();
  });

  test('renders with resizeMode', () => {
    const { getByTestId } = render(
      <ImageBackground
        testID="resize-mode-bg"
        source={{ uri: 'https://example.com/image.png' }}
        resizeMode="cover"
      >
        <Text>Cover mode</Text>
      </ImageBackground>
    );
    expect(getByTestId('resize-mode-bg')).toBeTruthy();
  });

  test('handles onLoad event', () => {
    const onLoad = vi.fn();
    const { getByTestId } = render(
      <ImageBackground
        testID="load-event-bg"
        source={{ uri: 'https://example.com/image.png' }}
        onLoad={onLoad}
      >
        <Text>Load event</Text>
      </ImageBackground>
    );
    fireEvent(getByTestId('load-event-bg'), 'load');
    expect(onLoad).toHaveBeenCalled();
  });

  test('handles onError event', () => {
    const onError = vi.fn();
    const { getByTestId } = render(
      <ImageBackground
        testID="error-event-bg"
        source={{ uri: 'https://example.com/image.png' }}
        onError={onError}
      >
        <Text>Error event</Text>
      </ImageBackground>
    );
    fireEvent(getByTestId('error-event-bg'), 'error');
    expect(onError).toHaveBeenCalled();
  });

  test('renders multiple children', () => {
    const { getByText } = render(
      <ImageBackground source={{ uri: 'https://example.com/image.png' }}>
        <Text>First child</Text>
        <Text>Second child</Text>
      </ImageBackground>
    );
    expect(getByText('First child')).toBeTruthy();
    expect(getByText('Second child')).toBeTruthy();
  });

  test('renders with nested views', () => {
    const { getByTestId, getByText } = render(
      <ImageBackground testID="nested-bg" source={{ uri: 'https://example.com/image.png' }}>
        <View testID="inner-view">
          <Text>Nested text</Text>
        </View>
      </ImageBackground>
    );
    expect(getByTestId('nested-bg')).toBeTruthy();
    expect(getByTestId('inner-view')).toBeTruthy();
    expect(getByText('Nested text')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <ImageBackground
        source={{ uri: 'https://example.com/image.png' }}
        style={{ width: 200, height: 200 }}
      >
        <Text style={{ color: 'white' }}>Background Image</Text>
      </ImageBackground>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
