import React from 'react';
import { test, expect, describe } from 'vitest';
import { render } from '@testing-library/react-native';
import { KeyboardAvoidingView, Text, TextInput } from 'react-native';

describe('KeyboardAvoidingView Component', () => {
  // https://github.com/srsholmes/vitest-react-native/issues/31
  test('renders the KeyboardAvoidingView mock, not the Keyboard API', () => {
    const { toJSON } = render(<KeyboardAvoidingView />);
    expect(toJSON()).toMatchObject({ type: 'KeyboardAvoidingView' });
  });

  test('renders children', () => {
    const { getByTestId, getByText } = render(
      <KeyboardAvoidingView testID="kav" behavior="padding" style={{ flex: 1 }}>
        <TextInput testID="text-input" placeholder="Enter text" />
        <Text>Submit</Text>
      </KeyboardAvoidingView>
    );
    expect(getByTestId('kav')).toBeTruthy();
    expect(getByTestId('text-input')).toBeTruthy();
    expect(getByText('Submit')).toBeTruthy();
  });

  test('passes props through', () => {
    const { getByTestId } = render(
      <KeyboardAvoidingView testID="kav" behavior="height" keyboardVerticalOffset={64} />
    );
    const kav = getByTestId('kav');
    expect(kav.props.behavior).toBe('height');
    expect(kav.props.keyboardVerticalOffset).toBe(64);
  });

  test('matches snapshot with form layout', () => {
    const { toJSON } = render(
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, padding: 20 }}>
        <TextInput placeholder="Enter text" style={{ marginBottom: 10 }} />
        <Text>Submit Form</Text>
      </KeyboardAvoidingView>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
