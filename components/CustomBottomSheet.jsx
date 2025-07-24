import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

const CustomBottomSheet = ({ 
  isVisible, 
  onClose, 
  onJoinGroup, 
  onCreateGroup, 
  bottomSheetRef, 
  bottomSheetHeight 
}) => (
  <BottomSheet
    ref={bottomSheetRef}
    index={isVisible ? 0 : -1}
    snapPoints={[bottomSheetHeight]}
    onChange={(index) => index === -1 && onClose()}
    enablePanDownToClose
    backgroundStyle={{ backgroundColor: '#18181b' }}
    handleIndicatorStyle={{ width: 50, height: 5, backgroundColor: '#71717a' }}
  >
    <View className="flex-1 p-4 bg-zinc-900 rounded-t-3xl">
      <View className="flex-row justify-end items-center -mt-3 mb-6">
        <TouchableOpacity onPress={onClose} className="bg-zinc-700 rounded-full p-2">
          <Ionicons name="close" size={18} color="white" />
        </TouchableOpacity>
      </View>
      <View className="bg-mainSurface rounded-lg overflow-hidden">
        <TouchableOpacity onPress={onJoinGroup} className="p-4 active:bg-mainPrimary">
          <Text className="text-lg text-[#F3F4F6]">Join a Group</Text>
        </TouchableOpacity>
        <View className="h-[0.5px] bg-gray-700" />
        <TouchableOpacity onPress={onCreateGroup} className="p-4 active:bg-mainPrimary">
          <Text className="text-lg text-[#F3F4F6]">Create a Group</Text>
        </TouchableOpacity>
      </View>
    </View>
  </BottomSheet>
);

export default CustomBottomSheet;