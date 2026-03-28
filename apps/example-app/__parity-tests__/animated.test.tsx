/**
 * Parity tests: Animated API
 *
 * These tests verify the Animated API mock works identically under
 * both Jest and Vitest.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Animated, Text, View } from 'react-native';
import { fn } from './test-utils';

// ---------------------------------------------------------------------------
// Animated.Value
// ---------------------------------------------------------------------------
describe('Animated.Value', () => {
  test('creates with initial value', () => {
    const val = new Animated.Value(42);
    expect(val).toBeDefined();
  });

  test('setValue updates value', () => {
    const val = new Animated.Value(0);
    val.setValue(10);
    // verify it doesn't throw
    expect(true).toBe(true);
  });

  test('stopAnimation calls callback', () => {
    const val = new Animated.Value(5);
    const cb = fn();
    val.stopAnimation(cb);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test('addListener returns id', () => {
    const val = new Animated.Value(0);
    const id = val.addListener(fn());
    expect(typeof id).toBe('string');
  });

  test('interpolate returns animated node', () => {
    const val = new Animated.Value(0);
    const interp = val.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100],
    });
    expect(interp).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Animated.ValueXY
// ---------------------------------------------------------------------------
describe('Animated.ValueXY', () => {
  test('creates with initial values', () => {
    const val = new Animated.ValueXY({ x: 10, y: 20 });
    expect(val).toBeDefined();
    expect(val.x).toBeDefined();
    expect(val.y).toBeDefined();
  });

  test('getLayout returns layout object', () => {
    const val = new Animated.ValueXY({ x: 0, y: 0 });
    const layout = val.getLayout();
    expect(layout).toBeDefined();
    expect(layout.left).toBeDefined();
    expect(layout.top).toBeDefined();
  });

  test('getTranslateTransform returns transform array', () => {
    const val = new Animated.ValueXY({ x: 0, y: 0 });
    const transform = val.getTranslateTransform();
    expect(Array.isArray(transform)).toBe(true);
    expect(transform.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Animation functions
// ---------------------------------------------------------------------------
describe('Animated.timing', () => {
  test('start calls callback with finished: true', () => {
    const val = new Animated.Value(0);
    const cb = fn();
    Animated.timing(val, { toValue: 1, useNativeDriver: false }).start(cb);
    expect(cb).toHaveBeenCalledWith({ finished: true });
  });

  test('stop does not throw', () => {
    const val = new Animated.Value(0);
    const anim = Animated.timing(val, { toValue: 1, useNativeDriver: false });
    expect(() => anim.stop()).not.toThrow();
  });
});

describe('Animated.spring', () => {
  test('start calls callback with finished: true', () => {
    const val = new Animated.Value(0);
    const cb = fn();
    Animated.spring(val, { toValue: 1, useNativeDriver: false }).start(cb);
    expect(cb).toHaveBeenCalledWith({ finished: true });
  });
});

describe('Animated.decay', () => {
  test('start calls callback with finished: true', () => {
    const val = new Animated.Value(0);
    const cb = fn();
    Animated.decay(val, { velocity: 0.5, useNativeDriver: false }).start(cb);
    expect(cb).toHaveBeenCalledWith({ finished: true });
  });
});

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
describe('Animated.parallel', () => {
  test('start calls callback with finished: true', () => {
    const v1 = new Animated.Value(0);
    const v2 = new Animated.Value(0);
    const cb = fn();
    Animated.parallel([
      Animated.timing(v1, { toValue: 1, useNativeDriver: false }),
      Animated.timing(v2, { toValue: 1, useNativeDriver: false }),
    ]).start(cb);
    expect(cb).toHaveBeenCalledWith({ finished: true });
  });
});

describe('Animated.sequence', () => {
  test('start calls callback with finished: true', () => {
    const val = new Animated.Value(0);
    const cb = fn();
    Animated.sequence([
      Animated.timing(val, { toValue: 1, useNativeDriver: false }),
      Animated.timing(val, { toValue: 0, useNativeDriver: false }),
    ]).start(cb);
    expect(cb).toHaveBeenCalledWith({ finished: true });
  });
});

describe('Animated.stagger', () => {
  test('start calls callback with finished: true', () => {
    const val = new Animated.Value(0);
    const cb = fn();
    Animated.stagger(100, [
      Animated.timing(val, { toValue: 1, useNativeDriver: false }),
    ]).start(cb);
    expect(cb).toHaveBeenCalledWith({ finished: true });
  });
});

describe('Animated.loop', () => {
  test('start calls callback with finished: true', () => {
    const val = new Animated.Value(0);
    const cb = fn();
    Animated.loop(
      Animated.timing(val, { toValue: 1, useNativeDriver: false }),
    ).start(cb);
    expect(cb).toHaveBeenCalledWith({ finished: true });
  });
});

describe('Animated.delay', () => {
  test('start calls callback with finished: true', () => {
    const cb = fn();
    Animated.delay(100).start(cb);
    expect(cb).toHaveBeenCalledWith({ finished: true });
  });
});

// ---------------------------------------------------------------------------
// Animated components
// ---------------------------------------------------------------------------
describe('Animated components', () => {
  test('Animated.View renders', () => {
    render(
      <Animated.View testID="av" style={{ opacity: 0.5 }}>
        <Text>content</Text>
      </Animated.View>,
    );
    expect(screen.getByTestId('av')).toBeTruthy();
    expect(screen.getByText('content')).toBeTruthy();
  });

  test('Animated.Text renders', () => {
    render(<Animated.Text testID="at">animated text</Animated.Text>);
    expect(screen.getByText('animated text')).toBeTruthy();
  });

  test('Animated.Image renders', () => {
    render(
      <Animated.Image
        testID="ai"
        source={{ uri: 'https://example.com/img.png' }}
      />,
    );
    expect(screen.getByTestId('ai')).toBeTruthy();
  });

  test('createAnimatedComponent wraps component', () => {
    const AnimatedView = Animated.createAnimatedComponent(View);
    render(
      <AnimatedView testID="custom">
        <Text>wrapped</Text>
      </AnimatedView>,
    );
    expect(screen.getByTestId('custom')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------
describe('Animated utilities', () => {
  test('event returns a function', () => {
    const handler = Animated.event([{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }]);
    expect(typeof handler).toBe('function');
  });
});
