import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;
const isTallDevice = height > 800;
const bottomSheetHeight = isSmallDevice ? '80%' : isTallDevice ? '60%' : '70%';

const PointsUpdateBottomSheet = ({ isVisible, closeModal, selectedMember, updatePoints }) => {
  const [points, setPoints] = useState(0);
  const rotation = useSharedValue(0);
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);
  const bottomSheetRef = useRef(null);

  const clamp = (value, min, max) => {
    return Math.max(min, Math.min(value, max));
  };

  const updateValue = useCallback((newValue) => {
    setPoints(newValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const onGestureEvent = useCallback((event) => {
    const { translationX, translationY } = event.nativeEvent;
    const angle = Math.atan2(translationY, translationX);
    
    if (previousAngle.current !== 0) {
      let angleDiff = angle - previousAngle.current; // Calculate the angle difference
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI; // Normalize the angle difference
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      accumulatedRotation.current += angleDiff;

      const rotationThreshold = Math.PI / 18; // Controls sensitivity
      if (Math.abs(accumulatedRotation.current) >= rotationThreshold) {
        const change = Math.floor(accumulatedRotation.current / rotationThreshold);
        const newPoints = clamp(points + change * 10, -1000, 1000); // Clamping to limit between -1000 and 1000
        updateValue(newPoints);
        accumulatedRotation.current -= change * rotationThreshold; // Reset accumulated rotation
      }
    }

    // Use withTiming for clamping and smoother control
    rotation.value = withTiming(rotation.value + (angle - previousAngle.current), { duration: 100 });
    previousAngle.current = angle; // Update previous angle for the next gesture event
  }, [points, updateValue, rotation]);

  const onGestureEnd = () => {
    previousAngle.current = 0; // Reset previous angle on gesture end
    accumulatedRotation.current = 0; // Reset accumulated rotation
  };

  const resetPoints = useCallback(() => {
    setPoints(0);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      resetPoints();
    }
  }, [isVisible, resetPoints]);

  const renderTicks = () => {
  const tickArray = [];
  const tickCount = 36;
  for (let i = 0; i < tickCount; i++) {
    const angle = (i * (360 / tickCount)) * (Math.PI / 180);
    const x = 115 * Math.cos(angle);
    const y = 115 * Math.sin(angle);

    const tickThickness = (i % 9 === 0) ? 2 : 0.5; // 2px thickness for every 9th tick
    const tickStyle = {
      position: 'absolute',
      width: 13,
      height: tickThickness, // Use tickThickness
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}rad` }],
  }));

  const getPointsColor = () => {
    if (points < 0) return '#FF3B3B';
    if (points > 0) return '#29DD70';
    return 'white';
  };

  const formatPoints = () => {
    if (points > 0) return `+${points}`;
    return `${points}`;
  };

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    closeModal();
  }, [closeModal]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={[bottomSheetHeight]}
      onChange={(index) => {
        if (index === -1) handleCloseBottomSheet();
      }}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: '#18181b' }}
      handleIndicatorStyle={{ width: 50, height: 5, backgroundColor: '#71717a' }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.username}>{selectedMember?.name || 'Username'}</Text>
          <TouchableOpacity style={styles.closeIcon} onPress={handleCloseBottomSheet}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.points, { color: getPointsColor() }]}>{formatPoints()}</Text>

        <View style={[styles.wheelContainer]}>
          <View style={[styles.wheelIn]}>
            <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onGestureEnd}>
              <Animated.View style={[styles.wheel, animatedStyle]}>
                {renderTicks()}
              </Animated.View>
            </PanGestureHandler>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            updatePoints(points);
            handleCloseBottomSheet();
          }}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  wheelContainer: {
    width: width - 50,
    alignItems: 'center',
    height: 250,
    overflow: 'hidden',
    backgroundColor: '#2354E9',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'white',
  },
  wheelIn: {
    marginTop: isSmallDevice ? 20 : isTallDevice ? 20 : 20,
    transform: isSmallDevice ? 'scale(1)' : isTallDevice ? 'scale(1.07)' : 'scale(0.95)',
    padding: 10,
  },
  closeIcon: {
    padding: 8,
    backgroundColor: '#3f3f46',
    borderRadius: 20,
  },
  points: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  wheel: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 70,
    borderColor: '#1B1E28',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tick: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: '#D6D6D6',
    borderRadius: 2,
    opacity: 1,
  },
  saveButton: {
    backgroundColor: '#2354E9',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PointsUpdateBottomSheet;
