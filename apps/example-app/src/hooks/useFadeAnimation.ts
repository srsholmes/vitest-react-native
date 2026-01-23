import { useCallback, useState } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

export interface UseFadeAnimationOptions {
  duration?: number;
  initialVisible?: boolean;
}

export interface UseFadeAnimationReturn {
  opacity: ReturnType<typeof useSharedValue<number>>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  isVisible: boolean;
  fadeIn: () => void;
  fadeOut: () => void;
  toggle: () => void;
}

export function useFadeAnimation(options: UseFadeAnimationOptions = {}): UseFadeAnimationReturn {
  const { duration = 300, initialVisible = true } = options;

  const [isVisible, setIsVisible] = useState(initialVisible);
  const opacity = useSharedValue(initialVisible ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const fadeIn = useCallback(() => {
    setIsVisible(true);
    opacity.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.ease),
    });
  }, [opacity, duration]);

  const fadeOut = useCallback(() => {
    opacity.value = withTiming(
      0,
      {
        duration,
        easing: Easing.in(Easing.ease),
      },
      (finished) => {
        if (finished) {
          runOnJS(setIsVisible)(false);
        }
      }
    );
  }, [opacity, duration]);

  const toggle = useCallback(() => {
    if (isVisible) {
      fadeOut();
    } else {
      fadeIn();
    }
  }, [isVisible, fadeIn, fadeOut]);

  return {
    opacity,
    animatedStyle,
    isVisible,
    fadeIn,
    fadeOut,
    toggle,
  };
}

export interface UseSlideAnimationOptions {
  duration?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
}

export function useSlideAnimation(options: UseSlideAnimationOptions = {}) {
  const { duration = 300, direction = 'up', distance = 50 } = options;

  const [isVisible, setIsVisible] = useState(false);
  const translateX = useSharedValue(
    direction === 'left' ? -distance : direction === 'right' ? distance : 0
  );
  const translateY = useSharedValue(
    direction === 'up' ? distance : direction === 'down' ? -distance : 0
  );
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    };
  });

  const slideIn = useCallback(() => {
    setIsVisible(true);
    opacity.value = withTiming(1, { duration });
    translateX.value = withTiming(0, { duration });
    translateY.value = withTiming(0, { duration });
  }, [opacity, translateX, translateY, duration]);

  const slideOut = useCallback(() => {
    const targetX = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
    const targetY = direction === 'up' ? distance : direction === 'down' ? -distance : 0;

    opacity.value = withTiming(0, { duration });
    translateX.value = withTiming(targetX, { duration }, (finished) => {
      if (finished) {
        runOnJS(setIsVisible)(false);
      }
    });
    translateY.value = withTiming(targetY, { duration });
  }, [opacity, translateX, translateY, duration, direction, distance]);

  return {
    animatedStyle,
    isVisible,
    slideIn,
    slideOut,
  };
}
