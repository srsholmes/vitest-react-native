import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { SectionList, Text, View } from 'react-native';

const DATA = [
  {
    title: 'Main dishes',
    data: ['Pizza', 'Burger', 'Risotto'],
  },
  {
    title: 'Sides',
    data: ['French Fries', 'Onion Rings', 'Fried Shrimps'],
  },
  {
    title: 'Drinks',
    data: ['Water', 'Coke', 'Beer'],
  },
];

describe('SectionList Component', () => {
  test('renders correctly', () => {
    const { getByTestId } = render(
      <SectionList
        testID="section-list"
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
      />
    );
    expect(getByTestId('section-list')).toBeTruthy();
  });

  test('renders section headers', () => {
    const { getByText } = render(
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section: { title } }) => (
          <Text testID={`header-${title}`}>{title}</Text>
        )}
      />
    );
    expect(getByText('Main dishes')).toBeTruthy();
    expect(getByText('Sides')).toBeTruthy();
    expect(getByText('Drinks')).toBeTruthy();
  });

  test('renders items correctly', () => {
    const { getByText } = render(
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
      />
    );
    expect(getByText('Pizza')).toBeTruthy();
    expect(getByText('Burger')).toBeTruthy();
    expect(getByText('Water')).toBeTruthy();
  });

  test('renders with ListHeaderComponent', () => {
    const { getByText } = render(
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
        ListHeaderComponent={() => <Text>List Header</Text>}
      />
    );
    expect(getByText('List Header')).toBeTruthy();
  });

  test('renders with ListFooterComponent', () => {
    const { getByText } = render(
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
        ListFooterComponent={() => <Text>List Footer</Text>}
      />
    );
    expect(getByText('List Footer')).toBeTruthy();
  });

  test('renders empty list with ListEmptyComponent', () => {
    const { getByText } = render(
      <SectionList
        sections={[]}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
        ListEmptyComponent={() => <Text>No data available</Text>}
      />
    );
    expect(getByText('No data available')).toBeTruthy();
  });

  test('handles onScroll event', () => {
    const onScroll = vi.fn();
    const { getByTestId } = render(
      <SectionList
        testID="section-list"
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
        onScroll={onScroll}
      />
    );
    fireEvent.scroll(getByTestId('section-list'), {
      nativeEvent: { contentOffset: { y: 100, x: 0 } },
    });
    expect(onScroll).toHaveBeenCalled();
  });

  test('handles onRefresh event', () => {
    const onRefresh = vi.fn();
    const { getByTestId } = render(
      <SectionList
        testID="section-list"
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
        refreshing={false}
        onRefresh={onRefresh}
      />
    );
    fireEvent(getByTestId('section-list'), 'refresh');
    expect(onRefresh).toHaveBeenCalled();
  });

  test('renders with stickySectionHeadersEnabled', () => {
    const { getByTestId } = render(
      <SectionList
        testID="section-list"
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
        stickySectionHeadersEnabled
      />
    );
    expect(getByTestId('section-list')).toBeTruthy();
  });

  test('has scrollToLocation method', () => {
    let listRef: SectionList | null = null;
    render(
      <SectionList
        ref={(ref) => {
          listRef = ref;
        }}
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
      />
    );
    expect(listRef).toBeTruthy();
    expect(listRef?.scrollToLocation).toBeDefined();
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <View>
        <SectionList
          sections={DATA}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => <Text>{item}</Text>}
          renderSectionHeader={({ section: { title } }) => <Text>{title}</Text>}
        />
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
