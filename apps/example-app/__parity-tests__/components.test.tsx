/**
 * Parity tests: React Native component mocks
 *
 * These tests verify that mocked React Native components behave identically
 * under both Jest (using react-native/jest-preset) and Vitest (using
 * vitest-react-native). Every test in this file must pass in both runners.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  FlatList,
  SectionList,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  Pressable,
  ActivityIndicator,
  Switch,
  Modal,
  Button,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ImageBackground,
  RefreshControl,
  DrawerLayoutAndroid,
  VirtualizedList,
  ActionSheetIOS,
  ToastAndroid,
} from 'react-native';
import { fn } from './test-utils';

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------
describe('View', () => {
  test('renders children', () => {
    render(
      <View testID="v">
        <Text>child</Text>
      </View>,
    );
    expect(screen.getByTestId('v')).toBeTruthy();
    expect(screen.getByText('child')).toBeTruthy();
  });

  test('forwards style prop', () => {
    render(<View testID="v" style={{ flex: 1, backgroundColor: 'red' }} />);
    const view = screen.getByTestId('v');
    expect(view.props.style).toBeDefined();
  });

  test('supports nested views', () => {
    render(
      <View testID="outer">
        <View testID="inner" />
      </View>,
    );
    expect(screen.getByTestId('outer')).toBeTruthy();
    expect(screen.getByTestId('inner')).toBeTruthy();
  });

  test('handles onLayout', () => {
    const onLayout = fn();
    render(<View testID="v" onLayout={onLayout} />);
    fireEvent(screen.getByTestId('v'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 100, height: 50 } },
    });
    expect(onLayout).toHaveBeenCalledTimes(1);
  });

  test('supports accessibilityRole', () => {
    render(<View testID="v" accessibilityRole="header" accessible />);
    expect(screen.getByRole('header')).toBeTruthy();
  });

  test('supports accessibilityLabel', () => {
    render(<View testID="v" accessibilityLabel="My view" accessible />);
    expect(screen.getByLabelText('My view')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------
describe('Text', () => {
  test('renders string content', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  test('renders with testID', () => {
    render(<Text testID="t">content</Text>);
    expect(screen.getByTestId('t')).toBeTruthy();
  });

  test('handles onPress', () => {
    const onPress = fn();
    render(
      <Text testID="t" onPress={onPress}>
        tap
      </Text>,
    );
    fireEvent.press(screen.getByTestId('t'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('renders nested text', () => {
    render(
      <Text>
        Hello <Text>World</Text>
      </Text>,
    );
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  test('supports numberOfLines', () => {
    render(
      <Text testID="t" numberOfLines={2}>
        truncated
      </Text>,
    );
    expect(screen.getByTestId('t').props.numberOfLines).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// TextInput
// ---------------------------------------------------------------------------
describe('TextInput', () => {
  test('renders with placeholder', () => {
    render(<TextInput testID="ti" placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
  });

  test('fires onChangeText', () => {
    const onChange = fn();
    render(<TextInput testID="ti" onChangeText={onChange} />);
    fireEvent.changeText(screen.getByTestId('ti'), 'hello');
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  test('fires onSubmitEditing', () => {
    const onSubmit = fn();
    render(<TextInput testID="ti" onSubmitEditing={onSubmit} />);
    fireEvent(screen.getByTestId('ti'), 'submitEditing');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test('renders with value', () => {
    render(<TextInput testID="ti" value="pre-filled" />);
    expect(screen.getByDisplayValue('pre-filled')).toBeTruthy();
  });

  test('supports secureTextEntry', () => {
    render(<TextInput testID="ti" secureTextEntry />);
    expect(screen.getByTestId('ti').props.secureTextEntry).toBe(true);
  });

  test('supports multiline', () => {
    render(<TextInput testID="ti" multiline />);
    expect(screen.getByTestId('ti').props.multiline).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------
describe('Image', () => {
  test('renders with source', () => {
    render(<Image testID="img" source={{ uri: 'https://example.com/cat.png' }} />);
    expect(screen.getByTestId('img')).toBeTruthy();
  });

  test('renders with numeric source (require)', () => {
    render(<Image testID="img" source={42} />);
    expect(screen.getByTestId('img')).toBeTruthy();
  });

  test('supports style', () => {
    render(
      <Image testID="img" source={{ uri: 'x' }} style={{ width: 100, height: 100 }} />,
    );
    expect(screen.getByTestId('img').props.style).toBeDefined();
  });

  test('supports resizeMode', () => {
    render(
      <Image testID="img" source={{ uri: 'x' }} resizeMode="cover" />,
    );
    expect(screen.getByTestId('img').props.resizeMode).toBe('cover');
  });
});

// ---------------------------------------------------------------------------
// TouchableOpacity
// ---------------------------------------------------------------------------
describe('TouchableOpacity', () => {
  test('renders children', () => {
    render(
      <TouchableOpacity>
        <Text>Tap me</Text>
      </TouchableOpacity>,
    );
    expect(screen.getByText('Tap me')).toBeTruthy();
  });

  test('handles onPress', () => {
    const onPress = fn();
    render(
      <TouchableOpacity testID="to" onPress={onPress}>
        <Text>Press</Text>
      </TouchableOpacity>,
    );
    fireEvent.press(screen.getByTestId('to'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('supports accessibilityRole for getByRole', () => {
    render(
      <TouchableOpacity accessibilityRole="button">
        <Text>Activate</Text>
      </TouchableOpacity>,
    );
    expect(screen.getByRole('button')).toBeTruthy();
  });

  test('supports disabled prop', () => {
    render(
      <TouchableOpacity testID="to" disabled>
        <Text>Disabled</Text>
      </TouchableOpacity>,
    );
    expect(screen.getByTestId('to').props.disabled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// TouchableHighlight
// ---------------------------------------------------------------------------
describe('TouchableHighlight', () => {
  test('renders children', () => {
    render(
      <TouchableHighlight>
        <Text>Tap me</Text>
      </TouchableHighlight>,
    );
    expect(screen.getByText('Tap me')).toBeTruthy();
  });

  test('handles onPress', () => {
    const onPress = fn();
    render(
      <TouchableHighlight testID="th" onPress={onPress}>
        <Text>Press</Text>
      </TouchableHighlight>,
    );
    fireEvent.press(screen.getByTestId('th'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// TouchableWithoutFeedback
// ---------------------------------------------------------------------------
describe('TouchableWithoutFeedback', () => {
  test('renders children', () => {
    render(
      <TouchableWithoutFeedback>
        <View>
          <Text>content</Text>
        </View>
      </TouchableWithoutFeedback>,
    );
    expect(screen.getByText('content')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Pressable
// ---------------------------------------------------------------------------
describe('Pressable', () => {
  test('renders children', () => {
    render(
      <Pressable>
        <Text>Press me</Text>
      </Pressable>,
    );
    expect(screen.getByText('Press me')).toBeTruthy();
  });

  test('handles onPress', () => {
    const onPress = fn();
    render(
      <Pressable testID="p" onPress={onPress}>
        <Text>Go</Text>
      </Pressable>,
    );
    fireEvent.press(screen.getByTestId('p'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('supports accessibilityRole for getByRole', () => {
    render(
      <Pressable accessibilityRole="button">
        <Text>Action</Text>
      </Pressable>,
    );
    expect(screen.getByRole('button')).toBeTruthy();
  });

  test('respects disabled prop', () => {
    const onPress = fn();
    render(
      <Pressable testID="p" onPress={onPress} disabled>
        <Text>Disabled</Text>
      </Pressable>,
    );
    expect(screen.getByTestId('p').props.disabled).toBe(true);
  });

  test('supports render function for children', () => {
    render(
      <Pressable testID="p">
        {({ pressed }: { pressed: boolean }) => (
          <Text>{pressed ? 'Pressed' : 'Not pressed'}</Text>
        )}
      </Pressable>,
    );
    expect(screen.getByText('Not pressed')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
describe('Button', () => {
  test('renders title', () => {
    render(<Button title="Click me" onPress={fn()} />);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  test('handles onPress', () => {
    const onPress = fn();
    render(<Button title="Go" onPress={onPress} testID="btn" />);
    fireEvent.press(screen.getByText('Go'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// ScrollView
// ---------------------------------------------------------------------------
describe('ScrollView', () => {
  test('renders children', () => {
    render(
      <ScrollView testID="sv">
        <Text>Scroll content</Text>
      </ScrollView>,
    );
    expect(screen.getByText('Scroll content')).toBeTruthy();
  });

  test('fires onScroll', () => {
    const onScroll = fn();
    render(
      <ScrollView testID="sv" onScroll={onScroll}>
        <Text>content</Text>
      </ScrollView>,
    );
    fireEvent.scroll(screen.getByTestId('sv'), {
      nativeEvent: { contentOffset: { y: 200 } },
    });
    expect(onScroll).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// FlatList
// ---------------------------------------------------------------------------
describe('FlatList', () => {
  const data = [
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' },
  ];

  test('renders items', () => {
    render(
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />,
    );
    expect(screen.getByText('Item 1')).toBeTruthy();
    expect(screen.getByText('Item 2')).toBeTruthy();
    expect(screen.getByText('Item 3')).toBeTruthy();
  });

  test('renders empty list component', () => {
    render(
      <FlatList
        data={[]}
        renderItem={() => null}
        ListEmptyComponent={<Text>No items</Text>}
      />,
    );
    expect(screen.getByText('No items')).toBeTruthy();
  });

  test('renders header and footer', () => {
    render(
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        ListHeaderComponent={<Text>Header</Text>}
        ListFooterComponent={<Text>Footer</Text>}
      />,
    );
    expect(screen.getByText('Header')).toBeTruthy();
    expect(screen.getByText('Footer')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// SectionList
// ---------------------------------------------------------------------------
describe('SectionList', () => {
  const sections = [
    { title: 'Fruits', data: ['Apple', 'Banana'] },
    { title: 'Veggies', data: ['Carrot'] },
  ];

  test('renders items', () => {
    render(
      <SectionList
        sections={sections}
        keyExtractor={(item, idx) => item + idx}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
      />,
    );
    expect(screen.getByText('Apple')).toBeTruthy();
    expect(screen.getByText('Banana')).toBeTruthy();
    expect(screen.getByText('Carrot')).toBeTruthy();
  });

  test('renders section headers', () => {
    render(
      <SectionList
        sections={sections}
        keyExtractor={(item, idx) => item + idx}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
      />,
    );
    expect(screen.getByText('Fruits')).toBeTruthy();
    expect(screen.getByText('Veggies')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// ActivityIndicator
// ---------------------------------------------------------------------------
describe('ActivityIndicator', () => {
  test('renders', () => {
    render(<ActivityIndicator testID="ai" />);
    expect(screen.getByTestId('ai')).toBeTruthy();
  });

  test('supports color and size props', () => {
    render(<ActivityIndicator testID="ai" color="blue" size="large" />);
    const el = screen.getByTestId('ai');
    expect(el.props.color).toBe('blue');
    expect(el.props.size).toBe('large');
  });
});

// ---------------------------------------------------------------------------
// Switch
// ---------------------------------------------------------------------------
describe('Switch', () => {
  test('renders', () => {
    render(<Switch testID="sw" />);
    expect(screen.getByTestId('sw')).toBeTruthy();
  });

  test('supports value prop', () => {
    render(<Switch testID="sw" value={true} />);
    expect(screen.getByTestId('sw').props.value).toBe(true);
  });

  test('fires onValueChange', () => {
    const onChange = fn();
    render(<Switch testID="sw" value={false} onValueChange={onChange} />);
    fireEvent(screen.getByTestId('sw'), 'valueChange', true);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
describe('Modal', () => {
  test('renders children when visible', () => {
    render(
      <Modal visible>
        <Text>Modal content</Text>
      </Modal>,
    );
    expect(screen.getByText('Modal content')).toBeTruthy();
  });

  test('hides children when not visible', () => {
    render(
      <Modal visible={false}>
        <Text>Hidden</Text>
      </Modal>,
    );
    expect(screen.queryByText('Hidden')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SafeAreaView
// ---------------------------------------------------------------------------
describe('SafeAreaView', () => {
  test('renders children', () => {
    render(
      <SafeAreaView testID="sa">
        <Text>Safe content</Text>
      </SafeAreaView>,
    );
    expect(screen.getByTestId('sa')).toBeTruthy();
    expect(screen.getByText('Safe content')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// KeyboardAvoidingView
// ---------------------------------------------------------------------------
describe('KeyboardAvoidingView', () => {
  test('is exported from react-native', () => {
    // KeyboardAvoidingView is exported; it may be a component or
    // an __esModule wrapper depending on the test runner
    expect(KeyboardAvoidingView).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// ImageBackground
// ---------------------------------------------------------------------------
describe('ImageBackground', () => {
  test('renders children over image', () => {
    render(
      <ImageBackground testID="ib" source={{ uri: 'https://example.com/bg.png' }}>
        <Text>Overlay</Text>
      </ImageBackground>,
    );
    expect(screen.getByTestId('ib')).toBeTruthy();
    expect(screen.getByText('Overlay')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// RefreshControl
// ---------------------------------------------------------------------------
describe('RefreshControl', () => {
  test('renders within ScrollView', () => {
    render(
      <ScrollView
        testID="sv"
        refreshControl={<RefreshControl refreshing={false} onRefresh={fn()} />}
      >
        <Text>Pull to refresh</Text>
      </ScrollView>,
    );
    expect(screen.getByText('Pull to refresh')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// StatusBar
// ---------------------------------------------------------------------------
describe('StatusBar', () => {
  test('static methods are callable', () => {
    expect(() => StatusBar.setBarStyle('dark-content')).not.toThrow();
    expect(() => StatusBar.setHidden(false)).not.toThrow();
    expect(() => StatusBar.setBackgroundColor('#fff')).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// VirtualizedList
// ---------------------------------------------------------------------------
describe('VirtualizedList', () => {
  test('renders items via getItem/getItemCount', () => {
    const data = ['Alpha', 'Beta', 'Gamma'];
    render(
      <VirtualizedList
        data={data}
        getItem={(d: string[], i: number) => d[i]}
        getItemCount={(d: string[]) => d.length}
        keyExtractor={(_: string, i: number) => String(i)}
        renderItem={({ item }: { item: string }) => <Text>{item}</Text>}
      />,
    );
    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.getByText('Beta')).toBeTruthy();
    expect(screen.getByText('Gamma')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// DrawerLayoutAndroid
// ---------------------------------------------------------------------------
describe('DrawerLayoutAndroid', () => {
  test('is exported from react-native', () => {
    expect(DrawerLayoutAndroid).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// TouchableNativeFeedback
// ---------------------------------------------------------------------------
describe('TouchableNativeFeedback', () => {
  test('renders children', () => {
    render(
      <TouchableNativeFeedback>
        <View>
          <Text>Native feedback</Text>
        </View>
      </TouchableNativeFeedback>,
    );
    expect(screen.getByText('Native feedback')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// ToastAndroid
// ---------------------------------------------------------------------------
describe('ToastAndroid', () => {
  test('show is callable', () => {
    expect(() => ToastAndroid.show('Hello', ToastAndroid.SHORT)).not.toThrow();
  });

  test('constants are defined', () => {
    expect(ToastAndroid.SHORT).toBeDefined();
    expect(ToastAndroid.LONG).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// ActionSheetIOS
// ---------------------------------------------------------------------------
describe('ActionSheetIOS', () => {
  test('showActionSheetWithOptions is callable', () => {
    expect(() =>
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Delete'], cancelButtonIndex: 0 },
        fn(),
      ),
    ).not.toThrow();
  });
});
