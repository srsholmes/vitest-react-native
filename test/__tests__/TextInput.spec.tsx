import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput, View } from 'react-native';

describe('TextInput Component', () => {
  test('renders with testID', () => {
    const { getByTestId } = render(<TextInput testID="test-input" />);
    expect(getByTestId('test-input')).toBeTruthy();
  });

  test('renders with placeholder', () => {
    const { getByPlaceholderText } = render(<TextInput placeholder="Enter your name" />);
    expect(getByPlaceholderText('Enter your name')).toBeTruthy();
  });

  test('renders with default value', () => {
    const { getByDisplayValue } = render(<TextInput defaultValue="Initial value" />);
    expect(getByDisplayValue('Initial value')).toBeTruthy();
  });

  test('handles onChangeText event', () => {
    const onChangeText = vi.fn();
    const { getByTestId } = render(<TextInput testID="input" onChangeText={onChangeText} />);
    fireEvent.changeText(getByTestId('input'), 'new value');
    expect(onChangeText).toHaveBeenCalledWith('new value');
  });

  test('handles onChange event', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(<TextInput testID="input" onChange={onChange} />);
    fireEvent(getByTestId('input'), 'change', {
      nativeEvent: { text: 'new value' },
    });
    expect(onChange).toHaveBeenCalled();
  });

  test('handles onFocus event', () => {
    const onFocus = vi.fn();
    const { getByTestId } = render(<TextInput testID="input" onFocus={onFocus} />);
    fireEvent(getByTestId('input'), 'focus');
    expect(onFocus).toHaveBeenCalled();
  });

  test('handles onBlur event', () => {
    const onBlur = vi.fn();
    const { getByTestId } = render(<TextInput testID="input" onBlur={onBlur} />);
    fireEvent(getByTestId('input'), 'blur');
    expect(onBlur).toHaveBeenCalled();
  });

  test('handles onSubmitEditing event', () => {
    const onSubmitEditing = vi.fn();
    const { getByTestId } = render(<TextInput testID="input" onSubmitEditing={onSubmitEditing} />);
    fireEvent(getByTestId('input'), 'submitEditing');
    expect(onSubmitEditing).toHaveBeenCalled();
  });

  test('renders with secureTextEntry', () => {
    const { getByTestId } = render(<TextInput testID="password-input" secureTextEntry />);
    expect(getByTestId('password-input')).toBeTruthy();
  });

  test('renders with multiline', () => {
    const { getByTestId } = render(
      <TextInput testID="multiline-input" multiline numberOfLines={4} />
    );
    expect(getByTestId('multiline-input')).toBeTruthy();
  });

  test('renders with keyboard type', () => {
    const { getByTestId } = render(<TextInput testID="numeric-input" keyboardType="numeric" />);
    expect(getByTestId('numeric-input')).toBeTruthy();
  });

  test('renders with autoCapitalize', () => {
    const { getByTestId } = render(<TextInput testID="auto-cap-input" autoCapitalize="words" />);
    expect(getByTestId('auto-cap-input')).toBeTruthy();
  });

  test('renders when editable is false', () => {
    const { getByTestId } = render(
      <TextInput testID="readonly-input" editable={false} value="Read only" />
    );
    expect(getByTestId('readonly-input')).toBeTruthy();
  });

  test('renders with maxLength', () => {
    const { getByTestId } = render(<TextInput testID="max-length-input" maxLength={10} />);
    expect(getByTestId('max-length-input')).toBeTruthy();
  });

  test('applies style prop', () => {
    const { getByTestId } = render(
      <TextInput testID="styled-input" style={{ borderWidth: 1, padding: 10, fontSize: 16 }} />
    );
    expect(getByTestId('styled-input')).toBeTruthy();
  });

  test('handles controlled input', () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('');
      return <TextInput testID="controlled-input" value={value} onChangeText={setValue} />;
    };

    const { getByTestId } = render(<TestComponent />);
    const input = getByTestId('controlled-input');
    fireEvent.changeText(input, 'test value');
    expect(input.props.value).toBe('test value');
  });

  test('matches snapshot', () => {
    const { toJSON } = render(
      <View>
        <TextInput placeholder="Enter text" style={{ borderWidth: 1, padding: 10 }} />
      </View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
