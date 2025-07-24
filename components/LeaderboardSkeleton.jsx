import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LeaderboardSkeleton = () => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <View className="flex-1 bg-[#0D0F15]" style={{ paddingTop: insets.top }}>
      <View className="flex-row justify-between items-center px-4 py-2">
        <View className="w-32 h-8 bg-zinc-800 rounded-lg" />
      </View>
      <View className="flex-row justify-center mt-2 mx-4 h-12 bg-zinc-800 rounded-full" />
      <View className="flex-1 ">
        <View className="flex-row justify-between  items-end px-14 pb-4 mt-8">
          {[1, 2, 3].map((_, index) => (
            <View key={index} className={`${index == 1 ? " mb-8" : ""} ${index == 0 ? " mb-2" : ""} items-center`}>
              <View className="w-16 h-16 bg-zinc-800 rounded-full mb-2" />
              <View className="w-20 h-4 bg-zinc-800 rounded mb-1" />
              <View className="w-12 h-6 bg-zinc-800 rounded" />
            </View>
          ))}
        </View>
        <View className="absolute w-full bg-zinc-900 bottom-0 rounded-t-3xl p-4" style={{ height: height * 0.35 }}>
          {[1, 2, 3, 4].map((_, index) => (
            <View key={index} className="flex-row items-center bg-zinc-800 rounded-xl p-4 mb-3">
              <View className="w-12 h-12 bg-zinc-700 rounded-full mr-3" />
              <View className="flex-1 flex-row items-center justify-between">
                <View className="w-32 h-4 bg-zinc-700 rounded" />
                <View className="w-16 h-8 bg-zinc-700 rounded" />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default LeaderboardSkeleton;