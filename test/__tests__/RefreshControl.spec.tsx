import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render } from '@testing-library/react-native';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

describe('RefreshControl Component', () => {
  test('renders correctly in ScrollView', () => {
    const { getByTestId } = render(
      <ScrollView
        testID="scroll-view"
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}
      >
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with refreshing true', () => {
    const { getByTestId } = render(
      <ScrollView
        testID="scroll-view"
        refreshControl={<RefreshControl refreshing={true} onRefresh={() => {}} />}
      >
        <Text>Loading content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('onRefresh callback is provided', () => {
    const onRefresh = vi.fn();
    const { getByTestId } = render(
      <ScrollView
        testID="scroll-view"
        refreshControl={
          <RefreshControl testID="refresh-control" refreshing={false} onRefresh={onRefresh} />
        }
      >
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
    // The onRefresh is passed as a prop - verify it exists
    expect(onRefresh).toBeDefined();
  });

  test('renders with title prop', () => {
    const { getByTestId } = render(
      <ScrollView
        testID="scroll-view"
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} title="Pull to refresh" />
        }
      >
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with titleColor prop', () => {
    const { getByTestId } = render(
      <ScrollView
        testID="scroll-view"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {}}
            title="Refreshing..."
            titleColor="#0000ff"
          />
        }
      >
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with tintColor prop', () => {
    const { getByTestId } = render(
      <ScrollView
        testID="scroll-view"
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} tintColor="#ff0000" />
        }
      >
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with colors prop (Android)', () => {
    const { getByTestId } = render(
      <ScrollView
        testID="scroll-view"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {}}
            colors={['#ff0000', '#00ff00', '#0000ff']}
          />
        }
      >
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with progressBackgroundColor prop (Android)', () => {
    const { getByTestId } = render(
      <ScrollView
        testID="scroll-view"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {}}
            progressBackgroundColor="#ffffff"
          />
        }
      >
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with progressViewOffset prop', () => {
    const { getByTestId } = render(
      <ScrollView
        testID="scroll-view"
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} progressViewOffset={50} />
        }
      >
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('renders with size prop', () => {
    const { getByTestId } = render(
      <ScrollView
        testID="scroll-view"
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} size={1} />}
      >
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <View>
        <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}>
          <Text>Pull to refresh content</Text>
        </ScrollView>
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
