// GroupCard.js
import React, { useState } from 'react';
import { TouchableOpacity, View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GroupCard = ({ group, onPress }) => {
  const [isInviteVisible, setIsInviteVisible] = useState(false);

  const toggleInviteCode = (e) => {
    e.stopPropagation();
    setIsInviteVisible(!isInviteVisible);
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-[#0D0F15] rounded-xl p-4 mb-4 border border-gray-700 active:opacity-80"
    >
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 rounded-full mr-3 overflow-hidden">
          <Image
            source={{ uri: group.groupIcon }}
            defaultSource={require('../assets/profile/default_profile.png')}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View>
          <Text className="text-lg text-white font-bold">{group.groupName}</Text>
          <Text className="text-gray-400">
            Members: {Object.keys(group.members || {}).length}
          </Text>
        </View>
      </View>
      
      <Pressable 
        onPress={toggleInviteCode}
        className="flex-row items-center mt-2"
      >
        <Text className="text-gray-400 mr-2">Invite Code:</Text>
        <Text className="text-white font-medium">
          {isInviteVisible ? group.inviteCode : '*'.repeat(5)}
        </Text>
        <Ionicons 
          name={isInviteVisible ? "eye-off" : "eye"} 
          size={20} 
          color="#6B7280"
          style={{ marginLeft: 8 }}
        />
      </Pressable>
    </TouchableOpacity>
  );
};

export default GroupCard;