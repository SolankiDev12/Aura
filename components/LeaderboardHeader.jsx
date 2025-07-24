import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const LeaderboardHeader = ({ userGroups, selectedGroup, setSelectedGroup, setIsBottomSheetVisible }) => {
  return (
    <View className="flex-row justify-between items-center px-4 py-2">
      <Text className="text-xl font-bold text-white">Leaderboard</Text>
      <TouchableOpacity onPress={() => setIsBottomSheetVisible(true)} className="bg-zinc-700 rounded-full p-2">
        <Ionicons name="menu" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );
};