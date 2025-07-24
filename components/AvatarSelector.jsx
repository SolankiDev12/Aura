import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AvatarSkeleton = () => (
  <View className="w-[30%] aspect-square mb-3">
    <LinearGradient
      colors={['#3f3f46', '#27272a']}
      style={{ width: '100%', height: '100%', borderRadius: 999 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  </View>
);

const AvatarSelector = ({ icons, loading, selectedIcon, onSelectIcon }) => {
  return (
    <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {loading
        ? Array(6).fill().map((_, index) => <AvatarSkeleton key={index} />)
        : icons.map((icon, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onSelectIcon(icon)}
              className="w-[28.5%] aspect-square m-1"
            >
              <View className={`relative rounded-full ${selectedIcon === icon ? 'p-1 border-4 border-[#2354E9]' : 'p-1 border-4 border-transparent'}`}>
                <Image
                  source={{ uri: icon }}
                  className="w-full h-full rounded-full"
                />
              </View>
            </TouchableOpacity>
          ))
      }
    </ScrollView>
  );
};

export default AvatarSelector;