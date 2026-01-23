import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
  color?: string;
  backgroundColor?: string;
  testID?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showLabel = true,
  animated = true,
  color = '#007AFF',
  backgroundColor = '#E5E5EA',
  testID,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const progressValue = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressValue.value = withTiming(clampedProgress, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progressValue.value = clampedProgress;
    }
  }, [clampedProgress, animated, progressValue]);

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
      backgroundColor: interpolateColor(
        progressValue.value,
        [0, 50, 100],
        ['#FF3B30', '#FF9500', '#34C759']
      ),
    };
  });

  return (
    <View style={styles.container} testID={testID}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text testID={`${testID}-label`} style={styles.label}>
            {Math.round(clampedProgress)}%
          </Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor, borderRadius: height / 2 }]}>
        <Animated.View
          testID={`${testID}-fill`}
          style={[
            styles.fill,
            { height, borderRadius: height / 2, backgroundColor: color },
            progressAnimatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

export interface CircularProgressProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  testID?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 100,
  strokeWidth = 10,
  color: _color = '#007AFF',
  backgroundColor = '#E5E5EA',
  showLabel = true,
  testID,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const progressValue = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progressValue.value = withSpring(clampedProgress, {
      damping: 15,
      stiffness: 100,
    });
  }, [clampedProgress, progressValue]);

  // Animated style prepared for future SVG-based implementation
  const _animatedStyle = useAnimatedStyle(() => {
    const strokeDashoffset = circumference - (progressValue.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View testID={testID} style={[styles.circularContainer, { width: size, height: size }]}>
      <View style={styles.svgContainer}>
        {/* Background circle - using View since we don't have SVG */}
        <View
          style={[
            styles.circleBackground,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            },
          ]}
        />
      </View>
      {showLabel && (
        <View style={styles.circularLabelContainer}>
          <Text testID={`${testID}-label`} style={styles.circularLabel}>
            {Math.round(clampedProgress)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    position: 'absolute',
  },
  circleBackground: {
    backgroundColor: 'transparent',
  },
  circularLabelContainer: {
    position: 'absolute',
  },
  circularLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
});
