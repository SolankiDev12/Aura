import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { MaterialIcons } from '@expo/vector-icons';
import LeaderboardSkeleton from '../components/LeaderboardSkeleton';
import TopThree from '../components/TopThree';
import LeaderboardList from '../components/LeaderboardList';
import GroupSelector from '../components/GroupSelector';

const LeaderboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();

  const isSmallDevice = height < 700;
  const isTallDevice = height > 800;
  const podiumWidth = width * 0.9;
  const podiumHeight = height * 0.3;
  const podiumTop = isSmallDevice ? height * 0.19 : isTallDevice ? height * 0.15 : height * 0.19;
  const topThreeTop = podiumTop + (podiumHeight * (isSmallDevice ? -0.5 : -0.4));

  const [userGroups, setUserGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const user = auth.currentUser;
  const currentUserId = user?.uid;

  useEffect(() => {
    const groupsRef = ref(database, 'groups');
    setIsLoading(true);
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      if (snapshot.exists()) {
        const groups = snapshot.val();
        const userGroups = Object.entries(groups).reduce((acc, [groupId, groupData]) => {
          if (groupData.members && groupData.members[currentUserId]) {
            acc[groupId] = groupData.groupName;
          }
          return acc;
        }, {});
        setUserGroups(userGroups);
        if (Object.keys(userGroups).length > 0 && !selectedGroup) {
          setSelectedGroup(Object.keys(userGroups)[0]);
        }
      } else {
        setUserGroups({});
        setSelectedGroup(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedGroup) {
      const groupRef = ref(database, `groups/${selectedGroup}`);
      const unsubscribe = onValue(groupRef, (snapshot) => {
        if (snapshot.exists()) {
          const groupData = snapshot.val();
          const members = Object.entries(groupData.members).map(([userId, userData]) => ({
            id: userId,
            name: userData.name,
            points: groupData.memberPoints?.[userId] || 0,
            avatar: userData.photoURL || null,
          }));
          setLeaderboardData(members.sort((a, b) => b.points - a.points));
        }
      });

      return () => unsubscribe();
    }
  }, [selectedGroup]);

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (Object.keys(userGroups).length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0F15' }}>
        <Text style={{ fontSize: 18, textAlign: 'center', color: 'white', paddingHorizontal: 16 }}>
          You haven't joined any groups yet. Join a group to see the leaderboard.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0F15' }}>
      <View style={{ paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1F2937', marginBottom: 12 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Leaderboard</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <TopThree
          leaderboardData={leaderboardData}
          podiumTop={podiumTop}
          podiumWidth={podiumWidth}
          podiumHeight={podiumHeight}
          topThreeTop={topThreeTop}
          isSmallDevice={isSmallDevice}
          isTallDevice={isTallDevice}
        />

        <LeaderboardList
          leaderboardData={leaderboardData}
          height={height}
          isTallDevice={isTallDevice}
          isSmallDevice={isSmallDevice}
          insets={insets}
        />
      </View>

      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 20,
          bottom: insets.bottom + (isSmallDevice ? 20 : isTallDevice ? 14 : 10),
          backgroundColor: '#2354E9',
          borderRadius: 28,
          width: 56,
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 5,
        }}
        onPress={() => setIsBottomSheetVisible(true)}
      >
        <MaterialIcons name="groups-3" size={24} color="white" />
      </TouchableOpacity>

      <GroupSelector
        isBottomSheetVisible={isBottomSheetVisible}
        setIsBottomSheetVisible={setIsBottomSheetVisible}
        userGroups={userGroups}
        setSelectedGroup={setSelectedGroup}
        isSmallDevice={isSmallDevice}
        isTallDevice={isTallDevice}
      />
    </View>
  );
};

export default LeaderboardScreen;