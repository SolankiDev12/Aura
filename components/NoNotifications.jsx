// NoNotifications.js
import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

const NoNotifications = () => {
  return (
    <StyledView className="flex-1 justify-center items-center">
      <StyledText className="text-gray-400 text-lg">No notifications yet</StyledText>
    </StyledView>
  );
};

export default NoNotifications;