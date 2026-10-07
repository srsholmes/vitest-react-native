import React from 'react';
import { test, expect, describe } from 'vitest';
import { StyleSheet, View, Text } from 'react-native';
import { rnMinor } from '../src/rnVersion';
import { render } from '@testing-library/react-native';

describe('StyleSheet', () => {
  test('creates styles object', () => {
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: 'white',
      },
      text: {
        fontSize: 16,
        color: 'black',
      },
    });

    expect(styles.container).toBeTruthy();
    expect(styles.text).toBeTruthy();
  });

  test('flattens single style', () => {
    const style = { backgroundColor: 'red', padding: 10 };
    const flattened = StyleSheet.flatten(style);
    expect(flattened).toEqual({ backgroundColor: 'red', padding: 10 });
  });

  test('flattens array of styles', () => {
    const style1 = { backgroundColor: 'red' };
    const style2 = { padding: 10 };
    const flattened = StyleSheet.flatten([style1, style2]);
    expect(flattened).toEqual({ backgroundColor: 'red', padding: 10 });
  });

  test('flattens array with null values', () => {
    const style1 = { backgroundColor: 'red' };
    const flattened = StyleSheet.flatten([style1, null, undefined]);
    expect(flattened).toEqual({ backgroundColor: 'red' });
  });

  test('later styles override earlier ones', () => {
    const style1 = { backgroundColor: 'red', padding: 10 };
    const style2 = { backgroundColor: 'blue' };
    const flattened = StyleSheet.flatten([style1, style2]) as {
      backgroundColor: string;
      padding: number;
    };
    expect(flattened.backgroundColor).toBe('blue');
    expect(flattened.padding).toBe(10);
  });

  test('composes two styles', () => {
    const style1 = { backgroundColor: 'red' };
    const style2 = { padding: 10 };
    const composed = StyleSheet.compose(style1, style2);
    expect(composed).toEqual([style1, style2]);
  });

  test('absoluteFill is defined', () => {
    expect(StyleSheet.absoluteFill).toBeDefined();
    expect(StyleSheet.absoluteFill.position).toBe('absolute');
  });

  // absoluteFillObject was removed in RN 0.85; the mock mirrors that.
  const LegacyStyleSheet = StyleSheet as typeof StyleSheet & Record<string, any>;

  test.runIf(rnMinor >= 85)('absoluteFillObject is removed (RN >= 0.85)', () => {
    expect(LegacyStyleSheet.absoluteFillObject).toBeUndefined();
  });

  test.runIf(rnMinor < 85)('absoluteFillObject is defined', () => {
    expect(LegacyStyleSheet.absoluteFillObject).toEqual({
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    });
  });

  test('hairlineWidth is defined', () => {
    expect(StyleSheet.hairlineWidth).toBeDefined();
    expect(typeof StyleSheet.hairlineWidth).toBe('number');
  });

  test('styles can be used in components', () => {
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      text: {
        fontSize: 20,
        fontWeight: 'bold',
      },
    });

    const { getByTestId, getByText } = render(
      <View testID="container" style={styles.container}>
        <Text style={styles.text}>Hello</Text>
      </View>
    );

    expect(getByTestId('container')).toBeTruthy();
    expect(getByText('Hello')).toBeTruthy();
  });

  test('inline styles work alongside StyleSheet styles', () => {
    const styles = StyleSheet.create({
      base: {
        padding: 10,
      },
    });

    const { getByTestId } = render(
      <View testID="combined" style={[styles.base, { backgroundColor: 'red' }]} />
    );

    expect(getByTestId('combined')).toBeTruthy();
  });

  test('conditional styles work', () => {
    const styles = StyleSheet.create({
      base: { padding: 10 },
      active: { backgroundColor: 'green' },
      inactive: { backgroundColor: 'gray' },
    });

    const isActive = true;
    const { getByTestId } = render(
      <View
        testID="conditional"
        style={[styles.base, isActive ? styles.active : styles.inactive]}
      />
    );

    expect(getByTestId('conditional')).toBeTruthy();
  });
});
