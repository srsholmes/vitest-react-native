import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { Image, View } from 'react-native';

describe('Image Component', () => {
  test('renders with source uri', () => {
    const { getByTestId } = render(
      <Image testID="network-image" source={{ uri: 'https://example.com/image.png' }} />
    );
    expect(getByTestId('network-image')).toBeTruthy();
  });

  test('renders with local source', () => {
    const { getByTestId } = render(<Image testID="local-image" source={{ uri: 'local-image' }} />);
    expect(getByTestId('local-image')).toBeTruthy();
  });

  test('renders with dimensions', () => {
    const { getByTestId } = render(
      <Image
        testID="sized-image"
        source={{ uri: 'https://example.com/image.png' }}
        style={{ width: 100, height: 100 }}
      />
    );
    expect(getByTestId('sized-image')).toBeTruthy();
  });

  test('renders with resizeMode cover', () => {
    const { getByTestId } = render(
      <Image
        testID="cover-image"
        source={{ uri: 'https://example.com/image.png' }}
        resizeMode="cover"
        style={{ width: 100, height: 100 }}
      />
    );
    expect(getByTestId('cover-image')).toBeTruthy();
  });

  test('renders with resizeMode contain', () => {
    const { getByTestId } = render(
      <Image
        testID="contain-image"
        source={{ uri: 'https://example.com/image.png' }}
        resizeMode="contain"
        style={{ width: 100, height: 100 }}
      />
    );
    expect(getByTestId('contain-image')).toBeTruthy();
  });

  test('renders with resizeMode stretch', () => {
    const { getByTestId } = render(
      <Image
        testID="stretch-image"
        source={{ uri: 'https://example.com/image.png' }}
        resizeMode="stretch"
        style={{ width: 100, height: 100 }}
      />
    );
    expect(getByTestId('stretch-image')).toBeTruthy();
  });

  test('handles onLoad event', () => {
    const onLoad = vi.fn();
    const { getByTestId } = render(
      <Image
        testID="load-image"
        source={{ uri: 'https://example.com/image.png' }}
        onLoad={onLoad}
      />
    );
    fireEvent(getByTestId('load-image'), 'load');
    expect(onLoad).toHaveBeenCalled();
  });

  test('handles onLoadStart event', () => {
    const onLoadStart = vi.fn();
    const { getByTestId } = render(
      <Image
        testID="load-start-image"
        source={{ uri: 'https://example.com/image.png' }}
        onLoadStart={onLoadStart}
      />
    );
    fireEvent(getByTestId('load-start-image'), 'loadStart');
    expect(onLoadStart).toHaveBeenCalled();
  });

  test('handles onLoadEnd event', () => {
    const onLoadEnd = vi.fn();
    const { getByTestId } = render(
      <Image
        testID="load-end-image"
        source={{ uri: 'https://example.com/image.png' }}
        onLoadEnd={onLoadEnd}
      />
    );
    fireEvent(getByTestId('load-end-image'), 'loadEnd');
    expect(onLoadEnd).toHaveBeenCalled();
  });

  test('handles onError event', () => {
    const onError = vi.fn();
    const { getByTestId } = render(
      <Image
        testID="error-image"
        source={{ uri: 'https://example.com/image.png' }}
        onError={onError}
      />
    );
    fireEvent(getByTestId('error-image'), 'error', {
      nativeEvent: { error: 'Failed to load' },
    });
    expect(onError).toHaveBeenCalled();
  });

  test('handles onProgress event', () => {
    const onProgress = vi.fn();
    const { getByTestId } = render(
      <Image
        testID="progress-image"
        source={{ uri: 'https://example.com/image.png' }}
        onProgress={onProgress}
      />
    );
    fireEvent(getByTestId('progress-image'), 'progress', {
      nativeEvent: { loaded: 50, total: 100 },
    });
    expect(onProgress).toHaveBeenCalled();
  });

  test('renders with defaultSource', () => {
    const { getByTestId } = render(
      <Image
        testID="default-source-image"
        source={{ uri: 'https://example.com/image.png' }}
        defaultSource={{ uri: 'placeholder' }}
        style={{ width: 100, height: 100 }}
      />
    );
    expect(getByTestId('default-source-image')).toBeTruthy();
  });

  test('renders with fadeDuration', () => {
    const { getByTestId } = render(
      <Image
        testID="fade-image"
        source={{ uri: 'https://example.com/image.png' }}
        fadeDuration={300}
        style={{ width: 100, height: 100 }}
      />
    );
    expect(getByTestId('fade-image')).toBeTruthy();
  });

  test('renders with borderRadius', () => {
    const { getByTestId } = render(
      <Image
        testID="rounded-image"
        source={{ uri: 'https://example.com/image.png' }}
        style={{ width: 100, height: 100, borderRadius: 50 }}
      />
    );
    expect(getByTestId('rounded-image')).toBeTruthy();
  });

  test('renders with tintColor', () => {
    const { getByTestId } = render(
      <Image
        testID="tinted-image"
        source={{ uri: 'https://example.com/image.png' }}
        style={{ width: 100, height: 100, tintColor: 'red' }}
      />
    );
    expect(getByTestId('tinted-image')).toBeTruthy();
  });

  test('renders with accessibility props', () => {
    const { getByTestId } = render(
      <Image
        testID="accessible-image"
        source={{ uri: 'https://example.com/image.png' }}
        accessible
        accessibilityLabel="Example image"
        style={{ width: 100, height: 100 }}
      />
    );
    expect(getByTestId('accessible-image')).toBeTruthy();
  });

  test('renders inside a View', () => {
    const { getByTestId } = render(
      <View testID="container">
        <Image
          testID="contained-image"
          source={{ uri: 'https://example.com/image.png' }}
          style={{ width: 100, height: 100 }}
        />
      </View>
    );
    expect(getByTestId('container')).toBeTruthy();
    expect(getByTestId('contained-image')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <View>
        <Image
          source={{ uri: 'https://example.com/image.png' }}
          style={{ width: 200, height: 200 }}
          resizeMode="cover"
        />
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
