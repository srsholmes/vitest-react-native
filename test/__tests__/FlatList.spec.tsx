import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { FlatList, View, Text } from 'react-native';

interface Item {
  id: string;
  title: string;
}

const mockData: Item[] = [
  { id: '1', title: 'Item 1' },
  { id: '2', title: 'Item 2' },
  { id: '3', title: 'Item 3' },
  { id: '4', title: 'Item 4' },
  { id: '5', title: 'Item 5' },
];

describe('FlatList Component', () => {
  test('renders items correctly', () => {
    const { getByText } = render(
      <FlatList
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
      />
    );
    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  test('renders with testID', () => {
    const { getByTestId } = render(
      <FlatList
        testID="test-list"
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
      />
    );
    expect(getByTestId('test-list')).toBeTruthy();
  });

  test('renders empty list with ListEmptyComponent', () => {
    const { getByText } = render(
      <FlatList
        data={[]}
        renderItem={({ item }) => <Text>{item}</Text>}
        keyExtractor={(item) => item}
        ListEmptyComponent={<Text>No items found</Text>}
      />
    );
    expect(getByText('No items found')).toBeTruthy();
  });

  test('renders ListHeaderComponent', () => {
    const { getByText } = render(
      <FlatList
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text>Header</Text>}
      />
    );
    expect(getByText('Header')).toBeTruthy();
  });

  test('renders ListFooterComponent', () => {
    const { getByText } = render(
      <FlatList
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
        ListFooterComponent={<Text>Footer</Text>}
      />
    );
    expect(getByText('Footer')).toBeTruthy();
  });

  test('renders ItemSeparatorComponent', () => {
    const { getAllByTestId } = render(
      <FlatList
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View testID="separator" />}
      />
    );
    const separators = getAllByTestId('separator');
    expect(separators.length).toBe(mockData.length - 1);
  });

  test('renders horizontal list', () => {
    const { getByTestId } = render(
      <FlatList
        testID="horizontal-list"
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
        horizontal
      />
    );
    expect(getByTestId('horizontal-list')).toBeTruthy();
  });

  test('handles onEndReached callback', () => {
    const onEndReached = vi.fn();
    const { getByTestId } = render(
      <FlatList
        testID="list"
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
      />
    );
    fireEvent(getByTestId('list'), 'endReached');
    expect(onEndReached).toHaveBeenCalled();
  });

  test('handles onRefresh callback', () => {
    const onRefresh = vi.fn();
    const { getByTestId } = render(
      <FlatList
        testID="list"
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
        refreshing={false}
        onRefresh={onRefresh}
      />
    );
    fireEvent(getByTestId('list'), 'refresh');
    expect(onRefresh).toHaveBeenCalled();
  });

  test('renders with numColumns', () => {
    const { getByTestId } = render(
      <FlatList
        testID="grid-list"
        data={mockData}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <Text>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
      />
    );
    expect(getByTestId('grid-list')).toBeTruthy();
  });

  test('handles onScroll callback', () => {
    const onScroll = vi.fn();
    const { getByTestId } = render(
      <FlatList
        testID="scroll-list"
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
      />
    );
    fireEvent.scroll(getByTestId('scroll-list'), {
      nativeEvent: {
        contentOffset: { x: 0, y: 100 },
        contentSize: { height: 1000, width: 375 },
        layoutMeasurement: { height: 500, width: 375 },
      },
    });
    expect(onScroll).toHaveBeenCalled();
  });

  test('renders with initialScrollIndex', () => {
    const { getByTestId } = render(
      <FlatList
        testID="initial-scroll-list"
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
        initialScrollIndex={2}
        getItemLayout={(data, index) => ({
          length: 50,
          offset: 50 * index,
          index,
        })}
      />
    );
    expect(getByTestId('initial-scroll-list')).toBeTruthy();
  });

  test('renders with inverted', () => {
    const { getByTestId } = render(
      <FlatList
        testID="inverted-list"
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
        inverted
      />
    );
    expect(getByTestId('inverted-list')).toBeTruthy();
  });

  test('handles onViewableItemsChanged callback', () => {
    const onViewableItemsChanged = vi.fn();
    const { getByTestId } = render(
      <FlatList
        testID="viewable-list"
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
    );
    fireEvent(getByTestId('viewable-list'), 'viewableItemsChanged', {
      viewableItems: [{ item: mockData[0], index: 0, isViewable: true }],
      changed: [{ item: mockData[0], index: 0, isViewable: true }],
    });
    expect(onViewableItemsChanged).toHaveBeenCalled();
  });

  test('renders with contentContainerStyle', () => {
    const { getByTestId } = render(
      <FlatList
        testID="styled-list"
        data={mockData}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
      />
    );
    expect(getByTestId('styled-list')).toBeTruthy();
  });

  test('renders with extraData', () => {
    const extraData = { selected: '1' };
    const { getByText } = render(
      <FlatList
        data={mockData}
        renderItem={({ item }) => (
          <Text>
            {item.title} {extraData.selected === item.id ? '(selected)' : ''}
          </Text>
        )}
        keyExtractor={(item) => item.id}
        extraData={extraData}
      />
    );
    expect(getByText('Item 1 (selected)')).toBeTruthy();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <FlatList
        data={mockData.slice(0, 3)}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Text>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text>Header</Text>}
        ListFooterComponent={<Text>Footer</Text>}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
