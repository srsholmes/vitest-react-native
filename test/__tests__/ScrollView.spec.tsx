import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { ScrollView, View, Text } from 'react-native';

describe('ScrollView Component', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <ScrollView>
        <Text>Scroll content</Text>
      </ScrollView>
    );
    expect(getByText('Scroll content')).toBeTruthy();
  });

  test('renders with testID', () => {
    const { getByTestId } = render(
      <ScrollView testID="scroll-view">
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders multiple children', () => {
    const { getByText } = render(
      <ScrollView>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </ScrollView>
    );
    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
    expect(getByText('Item 3')).toBeTruthy();
  });

  test('renders horizontal scroll view', () => {
    const { getByTestId } = render(
      <ScrollView testID="horizontal-scroll" horizontal>
        <View style={{ width: 100, height: 100 }} />
        <View style={{ width: 100, height: 100 }} />
      </ScrollView>
    );
    expect(getByTestId('horizontal-scroll')).toBeTruthy();
  });

  test('handles onScroll event', () => {
    const onScroll = vi.fn();
    const { getByTestId } = render(
      <ScrollView testID="scroll-view" onScroll={onScroll}>
        <Text>Content</Text>
      </ScrollView>
    );
    fireEvent.scroll(getByTestId('scroll-view'), {
      nativeEvent: {
        contentOffset: { x: 0, y: 100 },
        contentSize: { height: 1000, width: 375 },
        layoutMeasurement: { height: 500, width: 375 },
      },
    });
    expect(onScroll).toHaveBeenCalled();
  });

  test('handles onScrollBeginDrag event', () => {
    const onScrollBeginDrag = vi.fn();
    const { getByTestId } = render(
      <ScrollView testID="scroll-view" onScrollBeginDrag={onScrollBeginDrag}>
        <Text>Content</Text>
      </ScrollView>
    );
    fireEvent(getByTestId('scroll-view'), 'scrollBeginDrag');
    expect(onScrollBeginDrag).toHaveBeenCalled();
  });

  test('handles onScrollEndDrag event', () => {
    const onScrollEndDrag = vi.fn();
    const { getByTestId } = render(
      <ScrollView testID="scroll-view" onScrollEndDrag={onScrollEndDrag}>
        <Text>Content</Text>
      </ScrollView>
    );
    fireEvent(getByTestId('scroll-view'), 'scrollEndDrag');
    expect(onScrollEndDrag).toHaveBeenCalled();
  });

  test('handles onMomentumScrollBegin event', () => {
    const onMomentumScrollBegin = vi.fn();
    const { getByTestId } = render(
      <ScrollView testID="scroll-view" onMomentumScrollBegin={onMomentumScrollBegin}>
        <Text>Content</Text>
      </ScrollView>
    );
    fireEvent(getByTestId('scroll-view'), 'momentumScrollBegin');
    expect(onMomentumScrollBegin).toHaveBeenCalled();
  });

  test('handles onMomentumScrollEnd event', () => {
    const onMomentumScrollEnd = vi.fn();
    const { getByTestId } = render(
      <ScrollView testID="scroll-view" onMomentumScrollEnd={onMomentumScrollEnd}>
        <Text>Content</Text>
      </ScrollView>
    );
    fireEvent(getByTestId('scroll-view'), 'momentumScrollEnd');
    expect(onMomentumScrollEnd).toHaveBeenCalled();
  });

  test('renders with contentContainerStyle', () => {
    const { getByTestId } = render(
      <ScrollView testID="styled-scroll" contentContainerStyle={{ padding: 20 }}>
        <Text>Styled content</Text>
      </ScrollView>
    );
    expect(getByTestId('styled-scroll')).toBeTruthy();
  });

  test('renders with showsVerticalScrollIndicator', () => {
    const { getByTestId } = render(
      <ScrollView testID="scroll-view" showsVerticalScrollIndicator={false}>
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with showsHorizontalScrollIndicator', () => {
    const { getByTestId } = render(
      <ScrollView testID="scroll-view" horizontal showsHorizontalScrollIndicator={false}>
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with bounces disabled', () => {
    const { getByTestId } = render(
      <ScrollView testID="scroll-view" bounces={false}>
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with pagingEnabled', () => {
    const { getByTestId } = render(
      <ScrollView testID="scroll-view" pagingEnabled>
        <View style={{ width: 375, height: 500 }}>
          <Text>Page 1</Text>
        </View>
        <View style={{ width: 375, height: 500 }}>
          <Text>Page 2</Text>
        </View>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with scrollEnabled disabled', () => {
    const { getByTestId } = render(
      <ScrollView testID="scroll-view" scrollEnabled={false}>
        <Text>Non-scrollable content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with keyboardDismissMode', () => {
    const { getByTestId } = render(
      <ScrollView testID="scroll-view" keyboardDismissMode="on-drag">
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with nested scroll enabled', () => {
    const { getByTestId } = render(
      <ScrollView testID="outer-scroll">
        <ScrollView testID="inner-scroll" nestedScrollEnabled>
          <Text>Nested scroll content</Text>
        </ScrollView>
      </ScrollView>
    );
    expect(getByTestId('outer-scroll')).toBeTruthy();
    expect(getByTestId('inner-scroll')).toBeTruthy();
  });

  test('handles onContentSizeChange event', () => {
    const onContentSizeChange = vi.fn();
    const { getByTestId } = render(
      <ScrollView testID="scroll-view" onContentSizeChange={onContentSizeChange}>
        <Text>Content</Text>
      </ScrollView>
    );
    fireEvent(getByTestId('scroll-view'), 'contentSizeChange', 375, 1000);
    expect(onContentSizeChange).toHaveBeenCalled();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <ScrollView style={{ flex: 1 }}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </ScrollView>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
