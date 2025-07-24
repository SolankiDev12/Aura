import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { useUserDetails } from '../hooks/useUserDetails';

const LeaderboardList = ({ leaderboardData, height, isTallDevice, isSmallDevice, insets }) => {
  const avatarSize = isSmallDevice ? 40 : isTallDevice ? 48 : 44;
  const listItemHeight = isSmallDevice ? 60 : isTallDevice ? 70 : 70;

  return (
    <View 
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * (isTallDevice ? 0.33 : isSmallDevice ? 0.25 : 0.30),
        backgroundColor: '#09090b',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 16
      }}
    >
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{
          paddingTop: 10,
          paddingBottom: insets.bottom + 50,
        }}
        showsVerticalScrollIndicator={false}
      >
        {leaderboardData.slice(3).map((user, index) => {
          if (!user.id) return null; // Skip rendering if user.id is undefined
          const { photoURL: userAvatar, username: userName } = useUserDetails(user.id);

          return (
            <View 
              key={user.id} 
              className="flex-row items-center bg-zinc-800 bg-opacity-20 rounded-xl p-4 mb-3"
              style={{ height: listItemHeight }}
            >
              <Text 
                className="text-white font-bold mr-3" 
                style={{ 
                  fontSize: isSmallDevice ? 16 : 18,
                  minWidth: 20 
                }}
              >
                {index + 4}
              </Text>
              <Image 
                source={userAvatar ? { uri: userAvatar } : require('../assets/profile/default_profile.png')} 
                style={{ 
                  width: avatarSize, 
                  height: avatarSize,
                  borderRadius: avatarSize / 2
                }}
                className="mr-3" 
              />
              <View className="flex-1 flex-row items-center justify-between">
                <Text 
                  className="text-white font-bold flex-1 mr-2" 
                  numberOfLines={1}
                  style={{ fontSize: isSmallDevice ? 14 : 16 }}
                >
                  {userName}
                </Text>
                <View className="bg-mainPrimary rounded-md px-3 py-2">
                  <Text 
                    className="text-white font-bold"
                    style={{ fontSize: isSmallDevice ? 12 : 14 }}
                  >
                    {user.points} AP
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default LeaderboardList;