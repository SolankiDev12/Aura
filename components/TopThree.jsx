import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { database } from '../firebase'; // Make sure this is correctly configured
import { ref, get } from 'firebase/database';

const TopThree = ({ leaderboardData, podiumTop, podiumWidth, podiumHeight, topThreeTop, isSmallDevice, isTallDevice }) => {
  const [userDetailsList, setUserDetailsList] = useState([]);

  const topThreeAvatarSize = isSmallDevice ? 56 : isTallDevice ? 64 : 60;

  const getPositionStyle = (position, totalUsers) => {
    const baseStyles = {
      1: { left: (isSmallDevice ? '49%' : isTallDevice ? '49%' : '49%'), top: topThreeTop + (isSmallDevice ? -5 : isTallDevice ? 10 : -12) },
      2: { left: (isSmallDevice ? '22%' : isTallDevice ? '19.1%' : '20%'), top: topThreeTop + (isSmallDevice ? 25 : isTallDevice ? 48 : 20) },
      3: { left: (isSmallDevice ? '78%' : isTallDevice ? '78%' : '78%'), top: topThreeTop + (isSmallDevice ? 57 : isTallDevice ? 83 : 50) },
      4: { left: (isSmallDevice ? '48%' : isTallDevice ? '47%' : '49%'), top: topThreeTop + (isSmallDevice ? -5 : isTallDevice ? 10 : -12) }
    };

    if (totalUsers === 1) {
      return baseStyles[4];
    } else if (totalUsers === 2) {
      return position === 1
        ? { left: (isSmallDevice ? '48%' : isTallDevice ? '47%' : '49%'), top: topThreeTop + (isSmallDevice ? -5 : isTallDevice ? 10 : -12) }
        : { left: (isSmallDevice ? '20%' : isTallDevice ? '17.1%' : '20%'), top: topThreeTop + (isSmallDevice ? 25 : isTallDevice ? 48 : 20) };
    } else {
      return baseStyles[position] || {};
    }
  };

  // Function to fetch user details from the database
  const fetchUserDetails = async (userId) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
    return { username: 'User', photoURL: null }; // Default values
  };

  // Function to fetch details for the top three users
  const loadTopThreeDetails = async () => {
    const details = await Promise.all(
      leaderboardData.slice(0, 3).map(user => fetchUserDetails(user.id))
    );
    setUserDetailsList(details);
  };

  useEffect(() => {
    loadTopThreeDetails();
  }, [leaderboardData]);

  const topThreeUsers = leaderboardData.slice(0, 3);

  return (
    <View style={{ position: 'absolute', width: '100%', height: podiumHeight }}>
      <Image
        source={require('../assets/board.png')}
        style={{
          position: 'absolute',
          top: podiumTop,
          alignSelf: 'center',
          width: podiumWidth,
          height: podiumHeight,
          resizeMode: 'contain'
        }}
      />
      {topThreeUsers.map((user, index) => {
        const position = index + 1;
        const style = getPositionStyle(position, topThreeUsers.length);
        const isFirstPlace = position === 1;

        const { username: userName, photoURL: userAvatar } = userDetailsList[index] || {};

        return (
          <View
            key={user.id}
            style={[
              { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
              style,
              { transform: [{ translateX: -topThreeAvatarSize / 2 }] }
            ]}
          >
            {isFirstPlace && (
              <View style={{ position: 'absolute', top: -24 }}>
                <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
              </View>
            )}
            <View
              style={{
                width: topThreeAvatarSize * 1.07,
                height: topThreeAvatarSize * 1.05,
                alignItems: 'center',
                aspectRatio: 1 / 1,
                borderWidth: isFirstPlace ? 2 : 0,
                backgroundColor: isFirstPlace ? '#FFD700' : 'transparent',
                borderColor: '#FFD700',
                borderRadius: topThreeAvatarSize / 2,
                marginBottom: 2
              }}
            >
              <Image
                source={userAvatar ? { uri: userAvatar } : require('../assets/profile/default_profile.png')}
                style={{
                  width: topThreeAvatarSize * 1.0,
                  height: topThreeAvatarSize * 1.0,
                  aspectRatio: 1 / 1,
                  borderRadius: topThreeAvatarSize / 2
                }}
              />
            </View>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontSize: isSmallDevice ? 11 : 12,
                maxWidth: topThreeAvatarSize + 20
              }}
              numberOfLines={1}
            >
              {userName}
            </Text>
            <View
              style={{
                backgroundColor: isFirstPlace ? '#FFD700' : '#2354E9',
                borderRadius: 4,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginTop: 2,
                alignSelf: 'center'
              }}
            >
              <Text
                style={{
                  color: isFirstPlace ? 'black' : 'white',
                  fontWeight: 'bold',
                  fontSize: isSmallDevice ? 11 : 12
                }}
              >
                {user.points} AP
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default TopThree;
