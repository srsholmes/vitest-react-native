import React from 'react';
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react-native';
import { InputAccessoryView, View, Text, Button, TextInput } from 'react-native';

describe('InputAccessoryView', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <InputAccessoryView nativeID="accessory-1">
        <View>
          <Text>Accessory Content</Text>
        </View>
      </InputAccessoryView>
    );
    expect(getByText('Accessory Content')).toBeTruthy();
  });

  test('renders with nativeID', () => {
    const { getByTestId } = render(
      <InputAccessoryView nativeID="unique-accessory" testID="input-accessory">
        <View>
          <Text>Done</Text>
        </View>
      </InputAccessoryView>
    );

    const accessoryView = getByTestId('input-accessory');
    expect(accessoryView.props.nativeID).toBe('unique-accessory');
  });

  test('renders with button', () => {
    const { getByText } = render(
      <InputAccessoryView nativeID="toolbar">
        <View>
          <Button title="Done" onPress={() => {}} />
        </View>
      </InputAccessoryView>
    );
    expect(getByText('Done')).toBeTruthy();
  });

  test('can be used with TextInput', () => {
    const { getByTestId, getByText } = render(
      <View>
        <TextInput
          testID="text-input"
          inputAccessoryViewID="keyboard-accessory"
          placeholder="Enter text"
        />
        <InputAccessoryView nativeID="keyboard-accessory" testID="accessory">
          <View>
            <Text>Toolbar</Text>
          </View>
        </InputAccessoryView>
      </View>
    );

    expect(getByTestId('text-input')).toBeTruthy();
    expect(getByTestId('accessory')).toBeTruthy();
    expect(getByText('Toolbar')).toBeTruthy();
  });

  test('renders with backgroundColor style', () => {
    const { getByTestId } = render(
      <InputAccessoryView
        nativeID="styled-accessory"
        backgroundColor="#f0f0f0"
        testID="styled-accessory-view"
      >
        <View>
          <Text>Styled</Text>
        </View>
      </InputAccessoryView>
    );

    const accessoryView = getByTestId('styled-accessory-view');
    expect(accessoryView.props.backgroundColor).toBe('#f0f0f0');
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <InputAccessoryView nativeID="snapshot-accessory">
        <View>
          <Button title="Cancel" onPress={() => {}} />
          <Button title="Done" onPress={() => {}} />
        </View>
      </InputAccessoryView>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
