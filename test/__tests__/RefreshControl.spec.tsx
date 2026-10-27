import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react-native';
import { FlatList, RefreshControl, ScrollView, SectionList, Text, View } from 'react-native';

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
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} size={1 as any} />}
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

  // The refreshControl prop was passed through but never mounted, so nothing given to it
  // rendered: it serialised into snapshots as an unmounted element sitting in props, and
  // none of the tests above could see it. They only ever assert the ScrollView exists.
  describe('mounted inside its scrollable', () => {
    const control = (
      <RefreshControl
        testID="refresh"
        refreshing={true}
        onRefresh={() => {}}
        progressViewOffset={12}
      />
    );

    test('ScrollView renders it', () => {
      const { getByTestId } = render(
        <ScrollView testID="scroll-view" refreshControl={control}>
          <Text>Content</Text>
        </ScrollView>
      );

      expect(getByTestId('refresh')).toBeTruthy();
    });

    test('its props survive the mount', () => {
      const { getByTestId } = render(
        <ScrollView refreshControl={control}>
          <Text>Content</Text>
        </ScrollView>
      );

      expect(getByTestId('refresh').props.refreshing).toBe(true);
      expect(getByTestId('refresh').props.progressViewOffset).toBe(12);
    });

    test('it does not replace the scrollable children', () => {
      const { getByTestId, getByText } = render(
        <ScrollView testID="scroll-view" refreshControl={control}>
          <Text>Content</Text>
        </ScrollView>
      );

      expect(getByText('Content')).toBeTruthy();
      expect(getByTestId('scroll-view')).toBeTruthy();
    });

    test('FlatList renders it', () => {
      const { getByTestId } = render(
        <FlatList
          testID="flat-list"
          data={['a']}
          renderItem={({ item }) => <Text>{item}</Text>}
          refreshControl={control}
        />
      );

      expect(getByTestId('refresh')).toBeTruthy();
      expect(getByTestId('flat-list')).toBeTruthy();
    });

    test('SectionList renders it', () => {
      const { getByTestId } = render(
        <SectionList
          testID="section-list"
          sections={[{ title: 'one', data: ['a'] }]}
          renderItem={({ item }) => <Text>{item}</Text>}
          refreshControl={control}
        />
      );

      expect(getByTestId('refresh')).toBeTruthy();
      expect(getByTestId('section-list')).toBeTruthy();
    });

    // The payoff: with the control in the tree there is something to fire an event on,
    // so pull-to-refresh can finally be driven from a test.
    test('firing refresh calls onRefresh', () => {
      const onRefresh = vi.fn();
      const { getByTestId } = render(
        <ScrollView
          refreshControl={
            <RefreshControl testID="refresh" refreshing={false} onRefresh={onRefresh} />
          }
        >
          <Text>Content</Text>
        </ScrollView>
      );

      fireEvent(getByTestId('refresh'), 'refresh');

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    test('the element is no longer left in props', () => {
      const { toJSON } = render(
        <ScrollView refreshControl={control}>
          <Text>Content</Text>
        </ScrollView>
      );

      expect(JSON.stringify(toJSON())).not.toContain('"refreshControl"');
    });
  });
});
