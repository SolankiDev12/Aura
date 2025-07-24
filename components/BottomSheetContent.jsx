// BottomSheetContent.js
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomSheetContent = ({ handleCloseBottomSheet, handleJoinGroup, handleCreateGroup }) => (
  <View className="flex-1 p-4 bg-zinc-900 rounded-t-3xl">
    <View className="flex-row justify-end items-center -mt-3 mb-6">
      <TouchableOpacity
        onPress={handleCloseBottomSheet}
        className="bg-zinc-700 rounded-full p-2"
      >
        <Ionicons name="close" size={18} color="white" />
      </TouchableOpacity>
    </View>

    <View className="bg-mainSurface rounded-lg overflow-hidden">
      <TouchableOpacity 
        onPress={handleJoinGroup} 
        className="p-4 active:bg-mainPrimary"
      >
        <Text className="text-lg text-[#F3F4F6]">Join a Group</Text>
      </TouchableOpacity>
      <View className="h-[0.5px] bg-gray-700" />
      <TouchableOpacity 
        onPress={handleCreateGroup} 
        className="p-4 active:bg-mainPrimary"
      >
        <Text className="text-lg text-[#F3F4F6]">Create a Group</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default BottomSheetContent;