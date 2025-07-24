import React, { useCallback, useEffect } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ref, remove, push, update } from 'firebase/database';
import { database } from '../firebase';
import { useUserDetails } from '../hooks/useUserDetails';

const SWIPE_THRESHOLD = 80;

const SwipeableMemberItem = React.memo(({ 
  item, 
  onSelect, 
  isCreator, 
  currentUserId, 
  groupCreatorId, 
  groupId,
  groupIcon, 
  isModalVisible,
  groupName
}) => {
  const translateX = useSharedValue(0);
  const { photoURL: userProfilePic, username: userName } = useUserDetails(item.uid);

  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0);
  }, [translateX]);

  const createNotification = async (targetUserId, notification) => {
    try {
      const notificationRef = push(ref(database, `notifications/${targetUserId}`));
      await update(notificationRef, {
        ...notification,
        createdAt: Date.now(),
        read: false,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const handleDelete = useCallback(async () => {
    if (item.uid === groupCreatorId) {
      Alert.alert("Error", "The group creator cannot be removed.");
      resetPosition();
      return;
    }

    if (currentUserId !== groupCreatorId) {
      Alert.alert("Error", "Only the group creator can remove members.");
      resetPosition();
      return;
    }

    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${userName} from the group?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: resetPosition,
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await remove(ref(database, `groups/${groupId}/memberPoints/${item.uid}`));
              await remove(ref(database, `groups/${groupId}/members/${item.uid}`));
              
              await createNotification(item.uid, {
                type: 'group_removal',
                groupId: groupId,
                groupName: groupName,
                message: `You have been removed from the group ${groupName}`,
              });

              Alert.alert('Success', `${userName} has been removed from the group.`);
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member. Please try again.');
            }
            resetPosition();
          },
        },
      ]
    );
  }, [item, groupId, groupCreatorId, currentUserId, groupName, resetPosition, userName]);

  useEffect(() => {
    if (!isModalVisible) {
      resetPosition();
    }
  }, [isModalVisible, resetPosition]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      if (currentUserId !== groupCreatorId) {
        return;
      }
      translateX.value = context.startX + event.translationX;
    },
    onEnd: () => {
      if (currentUserId !== groupCreatorId) {
        runOnJS(resetPosition)();
        return;
      }
      if (translateX.value < -SWIPE_THRESHOLD) {
        runOnJS(onSelect)(item);
        runOnJS(resetPosition)();
      } else if (translateX.value > SWIPE_THRESHOLD) {
        runOnJS(handleDelete)();
      } else {
        runOnJS(resetPosition)();
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: currentUserId === groupCreatorId && translateX.value < 0 ? Math.min(1, -translateX.value / SWIPE_THRESHOLD) : 0,
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: currentUserId === groupCreatorId && item.uid !== groupCreatorId && translateX.value > 0 ? Math.min(1, translateX.value / SWIPE_THRESHOLD) : 0,
  }));

  return (
    <View className="relative mb-4 items-center">
      <Animated.View 
        className="absolute inset-0 justify-center items-end w-full px-4 py-7 bg-green-500 rounded-full" 
        style={leftActionStyle}
      >
        <Image 
          source={require('../assets/edit.png')}
          className="w-6 h-6 tint-white" 
        />
      </Animated.View>

      {item.uid !== groupCreatorId && (
        <Animated.View 
          className="absolute inset-0 justify-center items-start w-full px-4 py-7 bg-red-500 rounded-full" 
          style={rightActionStyle}
        >
          <Ionicons name="trash" size={24} color="white" />
        </Animated.View>
      )}
      
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View 
          className="relative flex-row items-center bg-zinc-800 px-3 py-3 rounded-full"
          style={animatedStyle}
        >
          <View className="flex-row left-0 items-center flex-1">
            <Image
              source={userProfilePic ? { uri: userProfilePic } : require('../assets/profile/default_profile.png')}
              className="w-12 h-12 rounded-full mr-3"
            />
            <View>
              <Text className="text-white text-lg">{userName}</Text>
              {item.uid === groupCreatorId && (
                <Text className="text-blue-400 text-sm">Aurator</Text>
              )}
            </View>
          </View>
          <View className="bg-blue-600 h-15 py-4 w-24 rounded-full justify-center items-center">
            <Text className="text-white text-lg">{item.points}</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
});

export default SwipeableMemberItem;