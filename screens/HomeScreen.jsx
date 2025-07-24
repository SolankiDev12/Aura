import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// import { BottomSheet } from 'react-native-btr'
import BottomSheet from '@gorhom/bottom-sheet';
import defaultProfile from '../assets/profile/default_profile.png';
import { useNavigation } from '@react-navigation/native';
import NotificationIcon from '../assets/bottom_nav_icons/notification'; // Adjust the import based on the actual path

import GroupCard from '../components/GroupCard';
import GroupCardSkeleton from '../components/GroupCardSkeleton';
import ProfileSection from '../components/ProfileSection';


export default function HomeScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [userID, setUserID] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [groups, setGroups] = useState([]);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const { height } = useWindowDimensions();
  const isSmallDevice = height < 700;
  const isTallDevice = height > 800;
  const bottomSheetRef = React.useRef(null);
  const bottomSheetHeight = isSmallDevice ? '38%' : isTallDevice ? '27%' : '34%';
  // const profileUserID = 'null';

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      const userUnsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUsername(data.username);
          setProfileImage(data.profileImage || require('../assets/profile/default_profile.png'));
          setUserID(user.uid);
        }
        setIsProfileLoading(false);
      });

      const groupsRef = ref(database, `groups`);
      const groupsUnsubscribe = onValue(groupsRef, (snapshot) => {
        const userGroups = [];
        snapshot.forEach((childSnapshot) => {
          const groupData = childSnapshot.val();
          if (groupData.members && groupData.members[user.uid]) {
            userGroups.push({
              id: childSnapshot.key,
              ...groupData,
            });
          }
        });
        setGroups(userGroups);
        setIsLoading(false);
      });

      return () => {
        userUnsubscribe();
        groupsUnsubscribe();
      };
    }
  }, []);

  const toggleBottomSheet = () => {
    setBottomSheetVisible(!bottomSheetVisible);
  };

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsBottomSheetVisible(false);
  }, []);

  const handleJoinGroup = () => {
    navigation.navigate('JoinGroup');
    bottomSheetRef.current?.close();
    setIsBottomSheetVisible(false);
    toggleBottomSheet();
  };

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
    bottomSheetRef.current?.close();
    setIsBottomSheetVisible(false);
    toggleBottomSheet();
  };

  const handleGroupPress = (group) => {
    navigation.navigate('GroupDetails', { group });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0D0F15]">
      <StatusBar barStyle="light-content" backgroundColor="#0D0F15" />
      <View className="px-2 pt-4 flex-1 ">
        <ProfileSection 
          isProfileLoading={isProfileLoading} 
          profileImage={profileImage} 
          username={username} 
          userId={userID}
        />

        {isLoading ? (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <GroupCardSkeleton />
            <GroupCardSkeleton />
            <GroupCardSkeleton />
          </ScrollView>
        ) : groups.length > 0 ? (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {groups.map((group) => (
              <GroupCard 
                key={group.id} 
                group={group}
                onPress={() => handleGroupPress(group)}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-[#F3F4F6] text-lg text-center">
              No groups available.{'\n'}Create or join a group to get started!
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        className="absolute bottom-5 right-5 bg-[#2354E9] rounded-full p-4 shadow-lg" 
        onPress={() => setIsBottomSheetVisible(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

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
      <View className="flex-1 p-4  bg-zinc-900 rounded-t-3xl">

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
      </BottomSheet>
    </SafeAreaView>
  );
}