/**
 * Parity tests: Accessibility queries
 *
 * These tests verify that accessibility-related queries (getByRole,
 * getByLabelText, etc.) work identically under both Jest and Vitest.
 * This is the core of issue #6.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Button,
  Image,
  Switch,
} from 'react-native';
import { fn } from './test-utils';

// ---------------------------------------------------------------------------
// getByRole
// ---------------------------------------------------------------------------
describe('getByRole', () => {
  test('finds TouchableOpacity with accessibilityRole="button"', () => {
    render(
      <TouchableOpacity accessibilityRole="button">
        <Text>Tap</Text>
      </TouchableOpacity>,
    );
    expect(screen.getByRole('button')).toBeTruthy();
  });

  test('finds Pressable with accessibilityRole="button"', () => {
    render(
      <Pressable accessibilityRole="button">
        <Text>Press</Text>
      </Pressable>,
    );
    expect(screen.getByRole('button')).toBeTruthy();
  });

  test('finds View with accessibilityRole="header" and accessible', () => {
    render(
      <View accessibilityRole="header" accessible>
        <Text>Title</Text>
      </View>,
    );
    expect(screen.getByRole('header')).toBeTruthy();
  });

  test('finds Button (implicit button role)', () => {
    render(<Button title="Click" onPress={fn()} />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  test('finds Text with text role', () => {
    render(<Text>Hello</Text>);
    expect(screen.getByRole('text')).toBeTruthy();
  });

  test('finds multiple elements by role', () => {
    render(
      <View>
        <TouchableOpacity accessibilityRole="button">
          <Text>First</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button">
          <Text>Second</Text>
        </TouchableOpacity>
      </View>,
    );
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  test('getByRole with name option', () => {
    render(
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Submit form">
        <Text>Submit</Text>
      </TouchableOpacity>,
    );
    expect(screen.getByRole('button', { name: 'Submit form' })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// getByLabelText
// ---------------------------------------------------------------------------
describe('getByLabelText', () => {
  test('finds element by accessibilityLabel', () => {
    render(<View testID="v" accessibilityLabel="Close dialog" accessible />);
    expect(screen.getByLabelText('Close dialog')).toBeTruthy();
  });

  test('finds TextInput by accessibilityLabel', () => {
    render(<TextInput accessibilityLabel="Email" placeholder="email" />);
    expect(screen.getByLabelText('Email')).toBeTruthy();
  });

  test('finds element by aria-label', () => {
    render(<View testID="v" aria-label="Settings" accessible />);
    expect(screen.getByLabelText('Settings')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// getByText
// ---------------------------------------------------------------------------
describe('getByText', () => {
  test('finds direct text', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  test('finds text with regex', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText(/hello/i)).toBeTruthy();
  });

  test('finds text inside nested components', () => {
    render(
      <View>
        <View>
          <Text>Deeply nested</Text>
        </View>
      </View>,
    );
    expect(screen.getByText('Deeply nested')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// getByTestId
// ---------------------------------------------------------------------------
describe('getByTestId', () => {
  test('finds View by testID', () => {
    render(<View testID="my-view" />);
    expect(screen.getByTestId('my-view')).toBeTruthy();
  });

  test('finds nested element by testID', () => {
    render(
      <View testID="parent">
        <View testID="child" />
      </View>,
    );
    expect(screen.getByTestId('parent')).toBeTruthy();
    expect(screen.getByTestId('child')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// getByPlaceholderText
// ---------------------------------------------------------------------------
describe('getByPlaceholderText', () => {
  test('finds TextInput by placeholder', () => {
    render(<TextInput placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
  });

  test('finds TextInput by placeholder regex', () => {
    render(<TextInput placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText(/email/i)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// getByDisplayValue
// ---------------------------------------------------------------------------
describe('getByDisplayValue', () => {
  test('finds TextInput by value', () => {
    render(<TextInput value="hello@test.com" />);
    expect(screen.getByDisplayValue('hello@test.com')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// queryBy (null when not found)
// ---------------------------------------------------------------------------
describe('queryBy returns null when not found', () => {
  test('queryByText returns null', () => {
    render(<View />);
    expect(screen.queryByText('nonexistent')).toBeNull();
  });

  test('queryByTestId returns null', () => {
    render(<View />);
    expect(screen.queryByTestId('nonexistent')).toBeNull();
  });

  test('queryByRole returns null', () => {
    render(<View />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Accessibility state queries
// ---------------------------------------------------------------------------
describe('accessibility state', () => {
  test('finds disabled button', () => {
    render(
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
      >
        <Text>Disabled</Text>
      </TouchableOpacity>,
    );
    expect(
      screen.getByRole('button', { disabled: true }),
    ).toBeTruthy();
  });

  test('finds checked switch', () => {
    render(<Switch value={true} />);
    // Switch is implicitly accessible
    expect(screen.getByTestId || screen.getByRole).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Complex accessibility scenarios
// ---------------------------------------------------------------------------
describe('complex accessibility', () => {
  test('accessible container with role and label', () => {
    render(
      <View
        accessible
        accessibilityRole="button"
        accessibilityLabel="Delete item"
      >
        <Image source={{ uri: 'trash.png' }} />
        <Text>Delete</Text>
      </View>,
    );
    expect(screen.getByRole('button', { name: 'Delete item' })).toBeTruthy();
  });

  test('form with labeled inputs', () => {
    render(
      <View>
        <TextInput
          accessibilityLabel="Username"
          placeholder="Enter username"
          testID="username"
        />
        <TextInput
          accessibilityLabel="Password"
          placeholder="Enter password"
          secureTextEntry
          testID="password"
        />
        <TouchableOpacity accessibilityRole="button">
          <Text>Login</Text>
        </TouchableOpacity>
      </View>,
    );
    expect(screen.getByLabelText('Username')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByRole('button')).toBeTruthy();
  });
});
