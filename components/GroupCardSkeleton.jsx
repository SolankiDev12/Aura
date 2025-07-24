// GroupCardSkeleton.js
import React from 'react';
import { View } from 'react-native';

const GroupCardSkeleton = () => (
  <View className="bg-[#0D0F15] rounded-xl p-4 mb-4 border border-gray-700">
    <View className="flex-row items-center mb-3">
      <View className="w-12 h-12 rounded-full mr-3 bg-gray-700 animate-pulse" />
      <View>
        <View className="w-32 h-6 bg-gray-700 rounded animate-pulse mb-2" />
        <View className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
      </View>
    </View>
    <View className="flex-row items-center mt-2">
      <View className="w-20 h-4 bg-gray-700 rounded animate-pulse mr-2" />
      <View className="w-16 h-4 bg-gray-700 rounded animate-pulse" />
    </View>
  </View>
);

export default GroupCardSkeleton;