import React from 'react';
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react-native';
import { VirtualizedList, Text, View } from 'react-native';

interface Item {
  id: string;
  title: string;
}

const DATA: Item[] = [
  { id: '1', title: 'Item 1' },
  { id: '2', title: 'Item 2' },
  { id: '3', title: 'Item 3' },
];

const getItem = (data: Item[], index: number) => data[index];
const getItemCount = (data: Item[]) => data.length;

describe('VirtualizedList', () => {
  test('renders items correctly', () => {
    const { getByText } = render(
      <VirtualizedList
        data={DATA}
        getItem={getItem}
        getItemCount={getItemCount}
        renderItem={({ item }: { item: Item }) => <Text>{item.title}</Text>}
        keyExtractor={(item: Item) => item.id}
      />
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
    expect(getByText('Item 3')).toBeTruthy();
  });

  test('renders empty list component when data is empty', () => {
    const { getByText } = render(
      <VirtualizedList
        data={[]}
        getItem={getItem}
        getItemCount={() => 0}
        renderItem={({ item }: { item: Item }) => <Text>{item.title}</Text>}
        keyExtractor={(item: Item) => item.id}
        ListEmptyComponent={<Text>No items</Text>}
      />
    );

    expect(getByText('No items')).toBeTruthy();
  });

  test('renders header component', () => {
    const { getByText } = render(
      <VirtualizedList
        data={DATA}
        getItem={getItem}
        getItemCount={getItemCount}
        renderItem={({ item }: { item: Item }) => <Text>{item.title}</Text>}
        keyExtractor={(item: Item) => item.id}
        ListHeaderComponent={<Text>Header</Text>}
      />
    );

    expect(getByText('Header')).toBeTruthy();
  });

  test('renders footer component', () => {
    const { getByText } = render(
      <VirtualizedList
        data={DATA}
        getItem={getItem}
        getItemCount={getItemCount}
        renderItem={({ item }: { item: Item }) => <Text>{item.title}</Text>}
        keyExtractor={(item: Item) => item.id}
        ListFooterComponent={<Text>Footer</Text>}
      />
    );

    expect(getByText('Footer')).toBeTruthy();
  });

  test('has scroll methods', () => {
    let listRef: VirtualizedList<Item> | null = null;

    render(
      <VirtualizedList
        ref={(ref) => {
          listRef = ref;
        }}
        data={DATA}
        getItem={getItem}
        getItemCount={getItemCount}
        renderItem={({ item }: { item: Item }) => <Text>{item.title}</Text>}
        keyExtractor={(item: Item) => item.id}
      />
    );

    expect(listRef).toBeTruthy();
    expect(listRef!.scrollToEnd).toBeDefined();
    expect(listRef!.scrollToIndex).toBeDefined();
    expect(listRef!.scrollToItem).toBeDefined();
    expect(listRef!.scrollToOffset).toBeDefined();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <VirtualizedList
        data={DATA}
        getItem={getItem}
        getItemCount={getItemCount}
        renderItem={({ item }: { item: Item }) => (
          <View>
            <Text>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item: Item) => item.id}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
