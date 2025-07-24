import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;
const isTallDevice = height > 800;

const PointsDial = ({ initialPoints, onPointsChange, onClose, minPoints = -1000, maxPoints = 1000 }) => {
  const [points, setPoints] = useState(initialPoints);
  const rotation = useSharedValue(0);
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);

  // Use dynamic min and max points instead of hardcoding values.
  const clamp = (value, min, max) => {
    return Math.max(min, Math.min(value, max));
  };

  const updateValue = useCallback((newValue) => {
    setPoints(newValue);
    onPointsChange(newValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [onPointsChange]);

  const onGestureEvent = useCallback((event) => {
    const { translationX, translationY } = event.nativeEvent;
    const angle = Math.atan2(translationY, translationX);

    if (previousAngle.current !== 0) {
      let angleDiff = angle - previousAngle.current;
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      accumulatedRotation.current += angleDiff;

      const rotationThreshold = Math.PI / 18; // Adjust rotation sensitivity
      if (Math.abs(accumulatedRotation.current) >= rotationThreshold) {
        const change = Math.floor(accumulatedRotation.current / rotationThreshold);
        const newPoints = clamp(points + change * 100, minPoints, maxPoints); // Use dynamic min and max
        updateValue(newPoints);
        accumulatedRotation.current -= change * rotationThreshold;
      }
    }

    rotation.value = withTiming(rotation.value + (angle - previousAngle.current), { duration: 100 });
    previousAngle.current = angle;
  }, [points, updateValue, rotation, minPoints, maxPoints]);

  const onGestureEnd = () => {
    previousAngle.current = 0;
    accumulatedRotation.current = 0;
  };

  const renderTicks = () => {
    const tickArray = [];
    const tickCount = 36; // Number of ticks around the dial
    for (let i = 0; i < tickCount; i++) {
      const angle = (i * (360 / tickCount)) * (Math.PI / 180);
      const x = 90 * Math.cos(angle);
      const y = 90 * Math.sin(angle);

      const tickThickness = (i % 9 === 0) ? 2 : 0.5; // Thicker tick every 9th tick
      const tickStyle = {
        position: 'absolute',
        width: 13,
        height: tickThickness,
        backgroundColor: '#D6D6D6',
        borderRadius: 2,
        opacity: 1,
      };

      tickArray.push(
        <View
          key={i}
          style={[
            tickStyle,
            {
              transform: [
                { translateX: x },
                { translateY: y },
                { rotate: `${angle}rad` },
              ],
            },
          ]}
        />
      );
    }
    return tickArray;
  };

  const animatedStyle = useAnimatedStyle(() => {
    const normalizedRotation = rotation.value % (Math.PI * 2);
    return {
      transform: [{ rotate: `${normalizedRotation}rad` }],
    };
  });

  return (
    <View style={styles.container}>
      
      <Text style={styles.points}>{points}</Text>

      <View style={styles.dialContainer}>
        <View style={[styles.wheelIn]}>
          <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onGestureEnd}>
            <Animated.View style={[styles.dial, animatedStyle]}>
              {renderTicks()}
            </Animated.View>
          </PanGestureHandler>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#18181b',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    backgroundColor: '#3f3f46',
    borderRadius: 50,
    padding: 4,
  },
  points: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  dialContainer: {
    width: width - 40,
    height: isSmallDevice ? 200 : isTallDevice ? 240 : 200,
    backgroundColor: '#2354E9',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'white',
  },
  dial: {
    width: 220,
    height: 220,
    borderRadius: 150,
    borderWidth: 50,
    borderColor: '#1B1E28',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  wheelIn: {
    marginTop: isSmallDevice ? 20 : isTallDevice ? 20 : 20,
    transform: isSmallDevice ? 'scale(1.2)' : isTallDevice ? 'scale(1.4)' : 'scale(1.3)', 
  },
});

export default PointsDial;