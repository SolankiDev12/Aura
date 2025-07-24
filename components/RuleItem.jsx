import React, { useCallback, useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, useAnimatedGestureHandler, withSpring, runOnJS } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const SWIPE_THRESHOLD = 80;

const RuleItem = ({ item, onEdit, onDelete, isBottomSheetVisible }) => {
  const translateX = useSharedValue(0);

  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0);
  }, [translateX]);

  useEffect(() => {
    if (!isBottomSheetVisible) {
      resetPosition();
    }
  }, [isBottomSheetVisible, resetPosition]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: () => {
      if (translateX.value < -SWIPE_THRESHOLD) {
        runOnJS(onEdit)(item);
      } else if (translateX.value > SWIPE_THRESHOLD) {
        runOnJS(onDelete)(item);
      }
      runOnJS(resetPosition)();
    },
  });

  const ruleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? Math.min(1, -translateX.value / SWIPE_THRESHOLD) : 0,
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 0 ? Math.min(1, translateX.value / SWIPE_THRESHOLD) : 0,
  }));

  return (
    <View className="relative mb-2">
      <Animated.View className="absolute top-0 bottom-0 left-0 w-full justify-center pr-4 items-end bg-blue-500 rounded-xl" style={leftActionStyle}>
        <Ionicons name="pencil" size={24} color="white" />
      </Animated.View>
      <Animated.View className="absolute top-0 bottom-0 right-0 w-full justify-center pl-4 items-start bg-red-500 rounded-xl" style={rightActionStyle}>
        <Ionicons name="trash" size={24} color="white" />
      </Animated.View>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View className="bg-zinc-800 px-5 py-6 rounded-xl flex-row justify-between items-center" style={ruleStyle}>
          <Text className="text-white text-lg">{item.ruleName}</Text>
          <View>
            <Text className="text-gray-400 text-base">{item.points} points</Text>
            {item.createdAt && (
              <Text className="text-gray-500 text-xs">Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
            )}
            {item.updatedAt && (
              <Text className="text-gray-500 text-xs">Updated: {new Date(item.updatedAt).toLocaleDateString()}</Text>
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default RuleItem;