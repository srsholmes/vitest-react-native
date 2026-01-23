import React from 'react';
import { test, expect, describe, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react-native';
import { Animated, View, Text } from 'react-native';

describe('Animated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Animated.Value', () => {
    test('can be instantiated', () => {
      const value = new Animated.Value(0);
      expect(value).toBeDefined();
    });

    test('can be instantiated with initial value', () => {
      const value = new Animated.Value(100);
      expect(value).toBeDefined();
    });

    test('setValue is callable', () => {
      const value = new Animated.Value(0);
      value.setValue(50);
      // No error means success
    });

    test('setOffset is callable', () => {
      const value = new Animated.Value(0);
      expect(() => value.setOffset(10)).not.toThrow();
    });

    test('flattenOffset is callable', () => {
      const value = new Animated.Value(0);
      expect(() => value.flattenOffset()).not.toThrow();
    });

    test('extractOffset is callable', () => {
      const value = new Animated.Value(0);
      expect(() => value.extractOffset()).not.toThrow();
    });

    test('addListener returns string id', () => {
      const value = new Animated.Value(0);
      const id = value.addListener(vi.fn());
      expect(typeof id).toBe('string');
    });

    test('removeListener is callable', () => {
      const value = new Animated.Value(0);
      const id = value.addListener(vi.fn());
      expect(() => value.removeListener(id)).not.toThrow();
    });

    test('removeAllListeners is callable', () => {
      const value = new Animated.Value(0);
      expect(() => value.removeAllListeners()).not.toThrow();
    });

    test('stopAnimation is callable', () => {
      const value = new Animated.Value(0);
      const callback = vi.fn();
      value.stopAnimation(callback);
      expect(callback).toHaveBeenCalled();
    });

    test('resetAnimation is callable', () => {
      const value = new Animated.Value(0);
      const callback = vi.fn();
      value.resetAnimation(callback);
      expect(callback).toHaveBeenCalled();
    });

    test('interpolate returns new value', () => {
      const value = new Animated.Value(0);
      const interpolated = value.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 100],
      });
      expect(interpolated).toBeDefined();
    });
  });

  describe('Animated.ValueXY', () => {
    test('can be instantiated', () => {
      const value = new Animated.ValueXY();
      expect(value).toBeDefined();
    });

    test('can be instantiated with initial values', () => {
      const value = new Animated.ValueXY({ x: 100, y: 200 });
      expect(value).toBeDefined();
      expect(value.x).toBeDefined();
      expect(value.y).toBeDefined();
    });

    test('setValue is callable', () => {
      const value = new Animated.ValueXY();
      expect(() => value.setValue({ x: 50, y: 50 })).not.toThrow();
    });

    test('setOffset is callable', () => {
      const value = new Animated.ValueXY();
      expect(() => value.setOffset({ x: 10, y: 10 })).not.toThrow();
    });

    test('flattenOffset is callable', () => {
      const value = new Animated.ValueXY();
      expect(() => value.flattenOffset()).not.toThrow();
    });

    test('extractOffset is callable', () => {
      const value = new Animated.ValueXY();
      expect(() => value.extractOffset()).not.toThrow();
    });

    test('getLayout returns layout object', () => {
      const value = new Animated.ValueXY();
      const layout = value.getLayout();
      expect(layout).toHaveProperty('left');
      expect(layout).toHaveProperty('top');
    });

    test('getTranslateTransform returns transform array', () => {
      const value = new Animated.ValueXY();
      const transform = value.getTranslateTransform();
      expect(Array.isArray(transform)).toBe(true);
      expect(transform).toHaveLength(2);
    });

    test('stopAnimation is callable', () => {
      const value = new Animated.ValueXY();
      const callback = vi.fn();
      value.stopAnimation(callback);
      expect(callback).toHaveBeenCalled();
    });

    test('resetAnimation is callable', () => {
      const value = new Animated.ValueXY();
      const callback = vi.fn();
      value.resetAnimation(callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Animation functions', () => {
    test('timing is callable', () => {
      const value = new Animated.Value(0);
      const animation = Animated.timing(value, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      });
      expect(animation).toBeDefined();
      expect(animation.start).toBeDefined();
      expect(animation.stop).toBeDefined();
    });

    test('timing.start executes callback', () => {
      const value = new Animated.Value(0);
      const callback = vi.fn();
      Animated.timing(value, { toValue: 1, useNativeDriver: true }).start(callback);
      expect(callback).toHaveBeenCalledWith({ finished: true });
    });

    test('spring is callable', () => {
      const value = new Animated.Value(0);
      const animation = Animated.spring(value, {
        toValue: 1,
        useNativeDriver: true,
      });
      expect(animation).toBeDefined();
      expect(animation.start).toBeDefined();
    });

    test('spring.start executes callback', () => {
      const value = new Animated.Value(0);
      const callback = vi.fn();
      Animated.spring(value, { toValue: 1, useNativeDriver: true }).start(callback);
      expect(callback).toHaveBeenCalledWith({ finished: true });
    });

    test('decay is callable', () => {
      const value = new Animated.Value(0);
      const animation = Animated.decay(value, {
        velocity: 1,
        useNativeDriver: true,
      });
      expect(animation).toBeDefined();
    });

    test('parallel is callable', () => {
      const value1 = new Animated.Value(0);
      const value2 = new Animated.Value(0);
      const animation = Animated.parallel([
        Animated.timing(value1, { toValue: 1, useNativeDriver: true }),
        Animated.timing(value2, { toValue: 1, useNativeDriver: true }),
      ]);
      expect(animation).toBeDefined();
      expect(animation.start).toBeDefined();
    });

    test('sequence is callable', () => {
      const value = new Animated.Value(0);
      const animation = Animated.sequence([
        Animated.timing(value, { toValue: 1, useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, useNativeDriver: true }),
      ]);
      expect(animation).toBeDefined();
    });

    test('stagger is callable', () => {
      const values = [new Animated.Value(0), new Animated.Value(0)];
      const animation = Animated.stagger(100, [
        Animated.timing(values[0], { toValue: 1, useNativeDriver: true }),
        Animated.timing(values[1], { toValue: 1, useNativeDriver: true }),
      ]);
      expect(animation).toBeDefined();
    });

    test('loop is callable', () => {
      const value = new Animated.Value(0);
      const animation = Animated.loop(
        Animated.timing(value, { toValue: 1, useNativeDriver: true })
      );
      expect(animation).toBeDefined();
    });

    test('delay is callable', () => {
      const animation = Animated.delay(1000);
      expect(animation).toBeDefined();
      expect(animation.start).toBeDefined();
    });

    test('event is callable', () => {
      const value = new Animated.Value(0);
      const handler = Animated.event([{ nativeEvent: { contentOffset: { y: value } } }], {
        useNativeDriver: true,
      });
      expect(handler).toBeDefined();
    });
  });

  describe('Animated Components', () => {
    test('Animated.View renders', () => {
      const { getByTestId } = render(
        <Animated.View testID="animated-view" style={{ opacity: 1 }}>
          <Text>Content</Text>
        </Animated.View>
      );
      expect(getByTestId('animated-view')).toBeTruthy();
    });

    test('Animated.Text renders', () => {
      const { getByText } = render(<Animated.Text>Animated Text</Animated.Text>);
      expect(getByText('Animated Text')).toBeTruthy();
    });

    test('Animated.Image renders', () => {
      const { getByTestId } = render(
        <Animated.Image testID="animated-image" source={{ uri: 'https://example.com/image.png' }} />
      );
      expect(getByTestId('animated-image')).toBeTruthy();
    });

    test('createAnimatedComponent is callable', () => {
      const AnimatedComponent = Animated.createAnimatedComponent(View);
      expect(AnimatedComponent).toBeDefined();
    });
  });

  describe('Math operations', () => {
    test('add is callable', () => {
      expect(Animated.add).toBeDefined();
    });

    test('subtract is callable', () => {
      expect(Animated.subtract).toBeDefined();
    });

    test('multiply is callable', () => {
      expect(Animated.multiply).toBeDefined();
    });

    test('divide is callable', () => {
      expect(Animated.divide).toBeDefined();
    });

    test('modulo is callable', () => {
      expect(Animated.modulo).toBeDefined();
    });

    test('diffClamp is callable', () => {
      expect(Animated.diffClamp).toBeDefined();
    });
  });

  test('matches snapshot', () => {
    const opacity = new Animated.Value(1);
    const { toJSON } = render(
      <Animated.View style={{ opacity }}>
        <Text>Animated Content</Text>
      </Animated.View>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
