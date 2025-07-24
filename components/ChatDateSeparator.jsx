import React from 'react';
import { View, Text } from 'react-native';

const ChatDateSeparator = ({ date }) => (
    <View className="my-2 bg-gray-800 rounded-full px-3 py-1 self-center">
        <Text className="text-gray-400 text-xs">{date}</Text>
    </View>
);

export default ChatDateSeparator;