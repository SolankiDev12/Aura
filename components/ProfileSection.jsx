import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import NotificationIcon from '../assets/bottom_nav_icons/notification';
import ChatIcon from '../assets/bottom_nav_icons/chat';
import { useNavigation } from '@react-navigation/native';
import { database, auth } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { useUserDetails } from '../hooks/useUserDetails';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);

const ProfileSection = ({ isProfileLoading }) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const currentUser = auth.currentUser;
  const { photoURL, username } = useUserDetails(currentUser?.uid);
  const navigation = useNavigation();

  useEffect(() => {
    if (!currentUser) return;
    
    const notificationsRef = ref(database, `notifications/${currentUser.uid}`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const unreadExists = Object.values(data).some(
          notification => notification && notification.read === false
        );
        setHasUnreadNotifications(unreadExists);
      } else {
        setHasUnreadNotifications(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <StyledView className="flex-row h-16 items-center justify-between mb-4 px-4">
      {isProfileLoading || !currentUser ? (
        <StyledView className="flex-row items-center">
          <StyledView className="w-12 h-12 rounded-full mr-4 bg-gray-700 animate-pulse" />
          <StyledView>
            <StyledView className="w-16 h-5 bg-gray-700 rounded animate-pulse mb-1" />
            <StyledView className="w-24 h-6 bg-gray-700 rounded animate-pulse" />
          </StyledView>
        </StyledView>
      ) : (
        <>
          <StyledView className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              {photoURL ? (
                <StyledImage
                  source={{ uri: photoURL }}
                  className="w-12 h-12 rounded-full mr-4"
                />
              ) : (
                <StyledView className="w-12 h-12 rounded-full mr-4 bg-gray-300 justify-center items-center">
                  <Ionicons name="person" size={24} color="white" />
                </StyledView>
              )}
            </TouchableOpacity>
            <StyledView>
              <StyledText className="text-sm text-[#F3F4F6] font-semibold">Hello,</StyledText>
              <StyledText className="text-lg text-[#F3F4F6] font-bold">{username}</StyledText>
            </StyledView>
          </StyledView>

          <StyledView className="relative flex-row space-x-4 border-[1px] rounded-full justify-between items-center border-white p-2">
            <TouchableOpacity 
              onPress={() => navigation.navigate('ChatDetail')} 
              className="items-center justify-center ml-[3px]"
            >
              <StyledView className="relative items-center justify-center">
                <ChatIcon width={20} height={20} fill="#F3F4F6" />
              </StyledView>
            </TouchableOpacity>

            <View className="w-[1px] h-5 bg-white"></View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Home', { screen: 'Notification' })} 
              className="items-center justify-center"
            >
              <StyledView className="relative items-center justify-center">
                <NotificationIcon width={24} height={24} fill="#F3F4F6" />
                {hasUnreadNotifications && (
                  <StyledView className="absolute right-[1px] -top-1 w-3 h-3 bg-blue-500 rounded-full border border-[#0D0F15]" />
                )}
              </StyledView>
            </TouchableOpacity>
          </StyledView>
        </>
      )}
    </StyledView>
  );
};

export default ProfileSection;