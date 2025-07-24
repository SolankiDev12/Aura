import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Feather } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const NotificationItem = ({ item, handleJoinRequest, handleNotificationPress }) => {
  const backgroundColor = item.type === 'join_request'
    ? 'bg-mainSurface'
    : item.read ? 'bg-mainSurface' : 'bg-zinc-900';

  const renderJoinRequest = () => (
    <StyledView className={`p-5 mb-3 rounded-xl shadow-md ${backgroundColor}`}>
      <StyledView className="flex-row items-center mb-3">
        <StyledView className="w-10 h-10 bg-mainBackground rounded-full items-center justify-center mr-3">
          <Feather name="user-plus" size={20} color="#2354E9" />
        </StyledView>
        <StyledView>
          <StyledText className="text-mainText text-base font-bold">
            {item.requesterName}
          </StyledText>
          <StyledText className="text-gray-400 text-sm">
            wants to join {item.groupName}
          </StyledText>
        </StyledView>
      </StyledView>
      <StyledText className="text-gray-500 text-xs mb-3">{item.createdAt}</StyledText>
      <StyledView className="flex-row justify-end">
        <StyledTouchableOpacity
          className="bg-mainPrimary px-5 py-2 rounded-full mr-2"
          onPress={() => handleJoinRequest(item, 'accept')}
        >
          <StyledText className="text-white font-semibold text-sm">Accept</StyledText>
        </StyledTouchableOpacity>
        <StyledTouchableOpacity
          className="bg-mainError px-5 py-2 rounded-full"
          onPress={() => handleJoinRequest(item, 'reject')}
        >
          <StyledText className="text-white font-semibold text-sm">Reject</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );

  const renderNotification = () => (
    <StyledTouchableOpacity 
      onPress={() => handleNotificationPress(item)}
      className="mb-3"
    >
      <StyledView className={`p-5 rounded-xl shadow-md relative ${backgroundColor}`}>
        <StyledView className="flex-row items-center">
          <StyledView className="w-10 h-10 bg-mainBackground rounded-full items-center justify-center mr-3">
            <Feather name={item.read ? "bell-off" : "bell"} size={20} color={item.read ? "#888" : "#2354E9"} />
          </StyledView>
          <StyledView className="flex-1">
            <StyledText className="text-mainText text-base font-bold mb-1">{item.message}</StyledText>
            <StyledText className="text-gray-500 text-xs">{item.createdAt}</StyledText>
          </StyledView>
          {!item.read && (
            <StyledView className="w-3 h-3 bg-mainError rounded-full absolute -top-3 -right-3" />
          )}
        </StyledView>
      </StyledView>
    </StyledTouchableOpacity>
  );

  return item.type === 'join_request' ? renderJoinRequest() : renderNotification();
};

export default NotificationItem;
