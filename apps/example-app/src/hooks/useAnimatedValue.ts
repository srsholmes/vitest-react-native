import { useEffect, useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  cancelAnimation,
  SharedValue,
  AnimatedStyle,
} from 'react-native-reanimated';

export interface UseAnimatedValueOptions {
  initialValue?: number;
  duration?: number;
  useSpring?: boolean;
}

export interface UseAnimatedValueReturn {
  value: SharedValue<number>;
  animatedStyle: AnimatedStyle;
  animateTo: (target: number) => void;
  reset: () => void;
  pulse: () => void;
}

export function useAnimatedValue(options: UseAnimatedValueOptions = {}): UseAnimatedValueReturn {
  const { initialValue = 0, duration = 300, useSpring: springAnimation = false } = options;

  const value = useSharedValue(initialValue);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: value.value,
      transform: [{ scale: value.value }],
    };
  });

  const animateTo = useCallback(
    (target: number) => {
      if (springAnimation) {
        value.value = withSpring(target);
      } else {
        value.value = withTiming(target, { duration });
      }
    },
    [value, duration, springAnimation]
  );

  const reset = useCallback(() => {
    cancelAnimation(value);
    value.value = withTiming(initialValue, { duration: duration / 2 });
  }, [value, initialValue, duration]);

  const pulse = useCallback(() => {
    value.value = withSequence(
      withTiming(1.2, { duration: duration / 2 }),
      withTiming(0.8, { duration: duration / 2 }),
      withTiming(1, { duration: duration / 2 })
    );
  }, [value, duration]);

  useEffect(() => {
    return () => {
      cancelAnimation(value);
    };
  }, [value]);

  return {
    value,
    animatedStyle,
    animateTo,
    reset,
    pulse,
  };
}

export interface UseLoopAnimationOptions {
  duration?: number;
  reverse?: boolean;
}

export function useLoopAnimation(options: UseLoopAnimationOptions = {}) {
  const { duration = 1000, reverse = true } = options;

  const progress = useSharedValue(0);

  const start = useCallback(() => {
    progress.value = withRepeat(withTiming(1, { duration }), -1, reverse);
  }, [progress, duration, reverse]);

  const stop = useCallback(() => {
    cancelAnimation(progress);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
    };
  });

  useEffect(() => {
    return () => {
      cancelAnimation(progress);
    };
  }, [progress]);

  return {
    progress,
    animatedStyle,
    start,
    stop,
  };
}
