/**
 * Test setup for the example app
 * This file mocks react-native-reanimated for testing
 */

import { vi } from 'vitest';
import React from 'react';

// Mock react-native-reanimated
vi.mock('react-native-reanimated', () => {
  const { View, Text, Image, ScrollView, FlatList } = require('react-native');

  // Shared value mock
  const useSharedValue = (initialValue: number) => {
    const ref = React.useRef({ value: initialValue });
    return ref.current;
  };

  // Animated style mock - returns empty object for styles
  const useAnimatedStyle = <T extends object>(_updater: () => T, _deps?: unknown[]): T => {
    return {} as T;
  };

  // Animation functions that return immediately
  const withTiming = (toValue: number, config?: object, callback?: (finished: boolean) => void) => {
    if (callback) callback(true);
    return toValue;
  };

  const withSpring = (toValue: number, config?: object, callback?: (finished: boolean) => void) => {
    if (callback) callback(true);
    return toValue;
  };

  const withDecay = (config?: object, callback?: (finished: boolean) => void) => {
    if (callback) callback(true);
    return 0;
  };

  const withDelay = (delay: number, animation: number) => animation;
  const withSequence = (...animations: number[]) => animations[animations.length - 1];
  const withRepeat = (
    animation: number,
    numberOfReps?: number,
    reverse?: boolean,
    callback?: (finished: boolean) => void
  ) => {
    if (callback) callback(true);
    return animation;
  };

  const cancelAnimation = () => {};
  const runOnJS = <T extends (...args: unknown[]) => unknown>(fn: T) => fn;
  const runOnUI = <T extends (...args: unknown[]) => unknown>(fn: T) => fn;

  // Interpolation
  const interpolate = (value: number, inputRange: number[], outputRange: number[]) => {
    if (typeof value !== 'number') return outputRange[0];
    const inputMin = inputRange[0];
    const inputMax = inputRange[inputRange.length - 1];
    const outputMin = outputRange[0];
    const outputMax = outputRange[outputRange.length - 1];

    if (value <= inputMin) return outputMin;
    if (value >= inputMax) return outputMax;

    const ratio = (value - inputMin) / (inputMax - inputMin);
    return outputMin + ratio * (outputMax - outputMin);
  };

  const interpolateColor = (value: number, inputRange: number[], outputRange: string[]) => {
    return outputRange[0];
  };

  const Extrapolation = {
    EXTEND: 'extend',
    CLAMP: 'clamp',
    IDENTITY: 'identity',
  };

  // Easing functions
  const Easing = {
    linear: (t: number) => t,
    ease: (t: number) => t,
    quad: (t: number) => t * t,
    cubic: (t: number) => t * t * t,
    poly: (n: number) => (t: number) => Math.pow(t, n),
    sin: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
    circle: (t: number) => 1 - Math.sqrt(1 - t * t),
    exp: (t: number) => Math.pow(2, 10 * (t - 1)),
    elastic: (_bounciness: number) => (t: number) => t,
    back: (s: number) => (t: number) => t * t * ((s + 1) * t - s),
    bounce: (t: number) => t,
    bezier: (_x1: number, _y1: number, _x2: number, _y2: number) => (t: number) => t,
    in: (easing: (t: number) => number) => easing,
    out: (easing: (t: number) => number) => (t: number) => 1 - easing(1 - t),
    inOut: (easing: (t: number) => number) => (t: number) =>
      t < 0.5 ? easing(t * 2) / 2 : 1 - easing((1 - t) * 2) / 2,
  };

  // Create animated component
  const createAnimatedComponent = <T extends React.ComponentType<any>>(Component: T) => {
    const AnimatedComponent = React.forwardRef((props: any, ref: any) => {
      return React.createElement(Component, { ...props, ref });
    });
    AnimatedComponent.displayName = `Animated(${Component.displayName || Component.name || 'Component'})`;
    return AnimatedComponent;
  };

  const Animated = {
    View: createAnimatedComponent(View),
    Text: createAnimatedComponent(Text),
    Image: createAnimatedComponent(Image),
    ScrollView: createAnimatedComponent(ScrollView),
    FlatList: createAnimatedComponent(FlatList),
    createAnimatedComponent,
  };

  // Layout animations - chainable objects
  const createLayoutAnimation = (_name: string): any => {
    const anim: any = {};
    anim.duration = () => anim;
    anim.delay = () => anim;
    anim.springify = () => anim;
    anim.damping = () => anim;
    anim.stiffness = () => anim;
    anim.withInitialValues = () => anim;
    anim.withCallback = () => anim;
    return anim;
  };

  const FadeIn = createLayoutAnimation('FadeIn');
  const FadeOut = createLayoutAnimation('FadeOut');
  const FadeInUp = createLayoutAnimation('FadeInUp');
  const FadeOutDown = createLayoutAnimation('FadeOutDown');
  const SlideInRight = createLayoutAnimation('SlideInRight');
  const SlideOutLeft = createLayoutAnimation('SlideOutLeft');
  const Layout = createLayoutAnimation('Layout');

  // Hooks
  const useAnimatedGestureHandler = (handlers: object) => handlers;
  const useAnimatedScrollHandler = (handlers: object) => handlers;
  const useAnimatedRef = () => React.useRef(null);
  const useDerivedValue = (updater: () => number, _deps?: unknown[]) => {
    const ref = React.useRef({ value: typeof updater === 'function' ? 0 : updater });
    return ref.current;
  };
  const useAnimatedReaction = () => {};
  const useAnimatedProps = () => ({});
  const useWorkletCallback = <T extends (...args: unknown[]) => unknown>(callback: T) => callback;
  const useFrameCallback = () => ({ setActive: vi.fn() });

  // Measure functions
  const measure = vi.fn(() => ({ x: 0, y: 0, width: 100, height: 100, pageX: 0, pageY: 0 }));
  const scrollTo = vi.fn();

  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue,
    useAnimatedStyle,
    useDerivedValue,
    useAnimatedRef,
    useAnimatedReaction,
    useAnimatedProps,
    useWorkletCallback,
    useFrameCallback,
    useAnimatedGestureHandler,
    useAnimatedScrollHandler,
    withTiming,
    withSpring,
    withDecay,
    withDelay,
    withSequence,
    withRepeat,
    cancelAnimation,
    runOnJS,
    runOnUI,
    interpolate,
    interpolateColor,
    Extrapolation,
    Easing,
    FadeIn,
    FadeOut,
    FadeInUp,
    FadeOutDown,
    SlideInRight,
    SlideOutLeft,
    Layout,
    measure,
    scrollTo,
    setGestureState: vi.fn(),
    makeMutable: (value: number) => ({ value }),
    makeShareableCloneRecursive: (value: unknown) => value,
    isReanimated2: () => true,
    createAnimatedComponent,
  };
});
