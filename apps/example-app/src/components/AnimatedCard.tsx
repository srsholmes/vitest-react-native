import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AnimatedCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  onPress?: () => void;
  onLike?: () => void;
  liked?: boolean;
  testID?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  title,
  description,
  imageUrl,
  onPress,
  onLike,
  liked = false,
  testID,
}) => {
  const cardScale = useSharedValue(1);
  const likeScale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const elevation = interpolate(pressed.value, [0, 1], [4, 2], Extrapolation.CLAMP);
    return {
      transform: [{ scale: cardScale.value }],
      shadowOpacity: interpolate(pressed.value, [0, 1], [0.2, 0.1]),
      elevation,
    };
  });

  const likeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likeScale.value }],
    };
  });

  const handlePressIn = useCallback(() => {
    cardScale.value = withSpring(0.98);
    pressed.value = withTiming(1, { duration: 100 });
  }, [cardScale, pressed]);

  const handlePressOut = useCallback(() => {
    cardScale.value = withSpring(1);
    pressed.value = withTiming(0, { duration: 100 });
  }, [cardScale, pressed]);

  const handleLike = useCallback(() => {
    likeScale.value = withSpring(1.4, { damping: 8 }, () => {
      likeScale.value = withSpring(1);
    });
    onLike?.();
  }, [likeScale, onLike]);

  return (
    <AnimatedPressable
      testID={testID}
      style={[styles.card, cardAnimatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
    >
      {imageUrl && (
        <Image
          testID={`${testID}-image`}
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text testID={`${testID}-title`} style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text testID={`${testID}-description`} style={styles.description} numberOfLines={3}>
          {description}
        </Text>
        <View style={styles.footer}>
          <AnimatedPressable
            testID={`${testID}-like`}
            style={[styles.likeButton, likeAnimatedStyle]}
            onPress={handleLike}
            accessibilityRole="button"
            accessibilityLabel={liked ? 'Unlike' : 'Like'}
          >
            <Text style={[styles.likeIcon, liked && styles.liked]}>{liked ? '❤️' : '🤍'}</Text>
          </AnimatedPressable>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E5EA',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  likeButton: {
    padding: 8,
  },
  likeIcon: {
    fontSize: 24,
  },
  liked: {
    color: '#FF3B30',
  },
});
