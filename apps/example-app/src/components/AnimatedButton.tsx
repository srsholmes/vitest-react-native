import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  testID?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  testID,
}) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: interpolate(pressed.value, [0, 1], [1, 0.8]),
    };
  });

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95);
    pressed.value = withTiming(1, { duration: 100 });
  }, [scale, pressed]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
    pressed.value = withTiming(0, { duration: 100 });
  }, [scale, pressed]);

  const buttonStyle = [styles.button, styles[variant], styles[size], disabled && styles.disabled];

  const textStyle = [
    styles.text,
    styles[`${size}Text` as keyof typeof styles],
    variant === 'secondary' && styles.secondaryText,
  ];

  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress();
    }
  }, [disabled, onPress]);

  return (
    <AnimatedPressable
      testID={testID}
      style={[buttonStyle, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={textStyle}>{title}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  primary: {
    backgroundColor: '#007AFF',
  } as ViewStyle,
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  } as ViewStyle,
  danger: {
    backgroundColor: '#FF3B30',
  } as ViewStyle,
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  } as ViewStyle,
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  } as ViewStyle,
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  } as ViewStyle,
  disabled: {
    opacity: 0.5,
  } as ViewStyle,
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  } as TextStyle,
  smallText: {
    fontSize: 12,
  } as TextStyle,
  mediumText: {
    fontSize: 16,
  } as TextStyle,
  largeText: {
    fontSize: 20,
  } as TextStyle,
  secondaryText: {
    color: '#007AFF',
  } as TextStyle,
});
