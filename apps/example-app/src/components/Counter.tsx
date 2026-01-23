import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

export interface CounterProps {
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  testID?: string;
}

export const Counter: React.FC<CounterProps> = ({
  initialValue = 0,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  onChange,
  testID,
}) => {
  const [count, setCount] = useState(initialValue);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedCountStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotateZ: `${rotation.value}deg` }],
    };
  });

  const triggerAnimation = useCallback(
    (direction: 'up' | 'down') => {
      scale.value = withSequence(withSpring(1.2, { damping: 10 }), withSpring(1, { damping: 15 }));
      rotation.value = withSequence(
        withSpring(direction === 'up' ? 5 : -5, { damping: 10 }),
        withSpring(0, { damping: 15 })
      );
    },
    [scale, rotation]
  );

  const increment = useCallback(() => {
    if (count < max) {
      const newValue = Math.min(count + step, max);
      setCount(newValue);
      onChange?.(newValue);
      triggerAnimation('up');
    }
  }, [count, max, step, onChange, triggerAnimation]);

  const decrement = useCallback(() => {
    if (count > min) {
      const newValue = Math.max(count - step, min);
      setCount(newValue);
      onChange?.(newValue);
      triggerAnimation('down');
    }
  }, [count, min, step, onChange, triggerAnimation]);

  const reset = useCallback(() => {
    setCount(initialValue);
    onChange?.(initialValue);
    scale.value = withSequence(withSpring(0.8), withSpring(1.1), withSpring(1));
  }, [initialValue, onChange, scale]);

  return (
    <View style={styles.container} testID={testID}>
      <Pressable
        testID={`${testID}-decrement`}
        style={[styles.button, count <= min && styles.buttonDisabled]}
        onPress={decrement}
        disabled={count <= min}
        accessibilityRole="button"
        accessibilityLabel="Decrement"
      >
        <Text style={styles.buttonText}>-</Text>
      </Pressable>

      <Animated.View style={[styles.countContainer, animatedCountStyle]}>
        <Text testID={`${testID}-value`} style={styles.count}>
          {count}
        </Text>
      </Animated.View>

      <Pressable
        testID={`${testID}-increment`}
        style={[styles.button, count >= max && styles.buttonDisabled]}
        onPress={increment}
        disabled={count >= max}
        accessibilityRole="button"
        accessibilityLabel="Increment"
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>

      <Pressable
        testID={`${testID}-reset`}
        style={styles.resetButton}
        onPress={reset}
        accessibilityRole="button"
        accessibilityLabel="Reset"
      >
        <Text style={styles.resetText}>Reset</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  countContainer: {
    minWidth: 80,
    alignItems: 'center',
  },
  count: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  resetText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
