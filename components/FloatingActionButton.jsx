import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledView = styled(View);
const StyledText = styled(Text);

const FloatingActionButton = ({ onPress }) => (
  <StyledTouchableOpacity
    className="absolute bottom-8 right-6 bg-blue-500 rounded-full p-4 shadow-lg"
    onPress={onPress}
  >
    <StyledText className="text-white text-xl">+</StyledText>
  </StyledTouchableOpacity>
);

export default FloatingActionButton;
