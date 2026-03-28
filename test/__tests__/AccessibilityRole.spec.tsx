import React from 'react';
import { test, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react-native';
import { TouchableOpacity, Text, View, Pressable } from 'react-native';

/**
 * Issue #6: Unable to get elements by role under certain conditions
 *
 * getByRole('button') should find components with accessibilityRole="button"
 */
describe('Accessibility role queries (issue #6)', () => {
  test('getByRole finds TouchableOpacity with accessibilityRole', () => {
    render(
      <TouchableOpacity accessibilityRole="button">
        <Text>Activate</Text>
      </TouchableOpacity>
    );

    expect(screen.getByRole('button')).toBeTruthy();
  });

  test('getByRole finds View with accessibilityRole', () => {
    render(
      <View accessibilityRole="header">
        <Text>Title</Text>
      </View>
    );

    expect(screen.getByRole('header')).toBeTruthy();
  });

  test('getByRole finds Pressable with accessibilityRole', () => {
    render(
      <Pressable accessibilityRole="button">
        <Text>Press me</Text>
      </Pressable>
    );

    expect(screen.getByRole('button')).toBeTruthy();
  });

  test('getByRole finds element with role prop', () => {
    render(
      <View role="banner">
        <Text>Banner</Text>
      </View>
    );

    expect(screen.getByRole('banner')).toBeTruthy();
  });
});
