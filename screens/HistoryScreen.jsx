import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  // FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import BottomSheet from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { FlatList } from 'react-native-gesture-handler';

const GroupCard = ({ group, onPress }) => (
  <TouchableOpacity onPress={onPress} className="bg-[#27272a] border border-gray-700 rounded-xl p-4 mb-2 flex-row items-center">
    <Image source={{ uri: group.groupIcon }} className="w-12 h-12 rounded-full mr-4" />
    <View>
      <Text className="text-white text-lg font-bold">{group.groupName}</Text>
      <Text className="text-gray-400">
        Members: {Object.keys(group.members || {}).length}
      </Text>
    </View>
  </TouchableOpacity>
);

const HistoryItem = ({ item, username }) => (
  <View
    style={{
      backgroundColor: '#27272a',
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: item.changeType === 'added' ? '#29DD70' : '#FF3B3B',
    }}
  >
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
          {username || 'Unknown User'}
        </Text>
        <Text style={{ color: '#a1a1aa', fontSize: 14 }}>
          {new Date(item.updatedAt).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: '2-digit' 
          }).toUpperCase()}
        </Text>
      </View>
      <Text
        style={{
          fontWeight: 'bold',
          fontSize: 18,
          color: item.changeType === 'added' ? '#29DD70' : '#FF3B3B',
        }}
      >
        {item.changeType === 'added' ? '+' : '-'}{item.pointsUpdated}
      </Text>
    </View>
  </View>
);

const HistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const [userGroups, setUserGroups] = useState([]);
  const [historyData, setHistoryData] = useState({});
  const [usernames, setUsernames] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const bottomSheetRef = React.useRef(null);
  const snapPoints = useMemo(() => ['50%'], []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      const groupsRef = ref(database, 'groups');

      const unsubscribeUser = onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          const unsubscribeGroups = onValue(groupsRef, (groupSnapshot) => {
            const groups = [];
            groupSnapshot.forEach((childSnapshot) => {
              const groupData = childSnapshot.val();
              if (groupData.members && groupData.members[user.uid]) {
                groups.push({
                  id: childSnapshot.key,
                  ...groupData,
                });
              }
            });
            setUserGroups(groups);
            fetchHistory(groups);
          });

          return () => unsubscribeGroups();
        }
      });

      return () => unsubscribeUser();
    }
  }, []);

  const fetchHistory = useCallback((groups) => {
    const historyPromises = groups.map((group) => {
      return new Promise((resolve) => {
        const historyRef = ref(database, `groups/${group.id}/history`);
        onValue(historyRef, (snapshot) => {
          const history = [];
          snapshot.forEach((childSnapshot) => {
            history.push({
              id: childSnapshot.key,
              ...childSnapshot.val(),
            });
          });
          resolve({ groupId: group.id, history });
        });
      });
    });

    Promise.all(historyPromises).then((results) => {
      const historyMap = {};
      const allHistoryItems = [];
      results.forEach(({ groupId, history }) => {
        historyMap[groupId] = history.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        allHistoryItems.push(...history);
      });
      setHistoryData(historyMap);
      fetchUsernames(allHistoryItems);
      setLoading(false);
    });
  }, []);

  const fetchUsernames = useCallback(async (historyItems) => {
    const usernamesMap = {};
    const userPromises = historyItems.map((item) => {
      return new Promise((resolve) => {
        const userRef = ref(database, `users/${item.userId}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            usernamesMap[item.userId] = userData.username;
          }
          resolve();
        });
      });
    });

    await Promise.all(userPromises);
    setUsernames(usernamesMap);
  }, []);

  const handleGroupPress = useCallback((group) => {
    setSelectedGroupId(group.id);
    setIsBottomSheetVisible(true);
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsBottomSheetVisible(false);
  }, []);

  const renderGroupItem = useCallback(({ item }) => (
    <GroupCard group={item} onPress={() => handleGroupPress(item)} />
  ), [handleGroupPress]);

  const renderHistoryItem = useCallback(({ item }) => (
    <HistoryItem item={item} username={usernames[item.userId]} />
  ), [usernames]);

  const selectedGroupHistory = useMemo(() => 
    historyData[selectedGroupId] || [],
    [historyData, selectedGroupId]
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0D0F15]" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0F15" />
      <View className="border-gray-800">
        <View className=" px-4 py-3 border-b border-gray-800">
          <Text className="text-white text-2xl font-bold">History</Text>
        </View>
        <View style="">
        {loading ? (
          <ActivityIndicator size="large" color="#4ade80" />
        ) : (
          <FlatList
            data={userGroups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            // contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          />
        )}
        </View>
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        index={isBottomSheetVisible ? 0 : -1}
        snapPoints={snapPoints}
        onChange={(index) => setIsBottomSheetVisible(index !== -1)}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#18181b' }}
        handleIndicatorStyle={{ backgroundColor: '#71717a' }}
      >
        <View style={{ flex: 1, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
              {userGroups.find(group => group.id === selectedGroupId)?.groupName || 'Group History'}
            </Text>
            <TouchableOpacity
              onPress={handleCloseBottomSheet}
              style={{ backgroundColor: '#3f3f46', borderRadius: 20, padding: 8 }}
            >
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={selectedGroupHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            ListEmptyComponent={() => (
              <Text style={{ color: '#a1a1aa', textAlign: 'center' }}>
                No history available.
              </Text>
            )}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default HistoryScreen;