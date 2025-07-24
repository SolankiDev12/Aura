import React, { useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

const GroupSelector = ({ 
  isBottomSheetVisible, 
  setIsBottomSheetVisible, 
  userGroups, 
  setSelectedGroup,
  isSmallDevice,
  isTallDevice
}) => {
  const bottomSheetRef = useRef(null);
  const bottomSheetHeight = isSmallDevice ? '35%' : isTallDevice ? '40%' : '40%';

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsBottomSheetVisible(false);
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isBottomSheetVisible ? 0 : -1}
      snapPoints={[bottomSheetHeight]}
      onChange={(index) => setIsBottomSheetVisible(index !== -1)}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: '#18181b',
      }}
      handleIndicatorStyle={{
        width: 50,
        height: 5,
        backgroundColor: '#71717a',
      }}
    >
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-bold text-white">Select Group</Text>
          
          <TouchableOpacity
            onPress={handleCloseBottomSheet}
            className="bg-zinc-700 rounded-full p-2"
          >
            <Ionicons name="close" size={18} color="white" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={Object.entries(userGroups)}
          keyExtractor={([groupId]) => groupId}
          renderItem={({ item: [groupId, groupName] }) => (
            <TouchableOpacity
              key={groupId}
              className="py-4 px-3 mb-2 rounded-xl bg-zinc-800"
              onPress={() => {
                setSelectedGroup(groupId);
                handleCloseBottomSheet();
              }}
            >
              <Text className="text-white text-lg">{groupName}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </View>
    </BottomSheet>
  );
};

export default GroupSelector;