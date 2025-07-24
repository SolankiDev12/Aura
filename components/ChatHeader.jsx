import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChatHeader = ({ groupName, groupIcon, navigation }) => {
    return (
        <View className="flex-row items-center p-4 bg-zinc-800 border-b border-gray-700">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2">
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            {groupIcon && (
                <Image source={{ uri: groupIcon }} className="w-10 h-10 rounded-full mr-2" />
            )}
            <Text className="text-white text-lg font-bold">{groupName}</Text>
        </View>
    );
};

export default ChatHeader;