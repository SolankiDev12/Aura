import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


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

const RuleItem = ({ rule }) => (
  <View className="bg-gray-800 rounded-xl p-4 mb-3">
    <Text className="text-white text-lg">{rule.ruleName}</Text>
    <Text className="text-gray-400">{rule.points} points</Text>
  </View>
);

const RuleBookScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [rules, setRules] = useState([]);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const bottomSheetRef = React.useRef(null);
  const snapPoints = useMemo(() => ['50%'], []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const groupsRef = ref(database, 'groups');
      
      const unsubscribe = onValue(groupsRef, (snapshot) => {
        const groupsData = snapshot.val();
        const userGroupsList = Object.entries(groupsData || {})
          .filter(([_, group]) => group.members && group.members[user.uid])
          .map(([id, group]) => ({ id, ...group }));
        setUserGroups(userGroupsList);
      });

      return () => unsubscribe();
    }
  }, []);

  const fetchRules = useCallback((groupId) => {
    const rulesRef = ref(database, `groups/${groupId}/rules`);
    onValue(rulesRef, (snapshot) => {
      const rulesData = snapshot.val() || {};
      const rulesList = Object.entries(rulesData).map(([ruleId, rule]) => ({
        id: ruleId,
        ...rule,
      }));
      setRules(rulesList);
    });
  }, []);

  const handleGroupPress = useCallback((group) => {
      // setIsBottomSheetVisible(false);
      // bottomSheetRef.current?.close();
    setSelectedGroup(group);
    fetchRules(group.id);
    if (group.creatorId === auth.currentUser.uid) {
      navigation.navigate('RuleDetail', { group });
    } else {
      setIsBottomSheetVisible(true);
      bottomSheetRef.current?.expand();
    }
  }, [fetchRules, navigation]);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsBottomSheetVisible(false);
  }, []);

  

  const renderGroupItem = ({ item }) => (
    <GroupCard group={item} onPress={() => handleGroupPress(item)} />
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0D0F15]" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-3 border-b border-gray-800">
        <Text className="text-white text-2xl font-bold">Rule Book</Text>
      </View>
      <FlatList
        data={userGroups}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-400 text-lg">No groups found</Text>
          </View>
        }
      />
      {/* {isBottomSheetVisible && ( */}
        <BottomSheet
          ref={bottomSheetRef}
          index={isBottomSheetVisible ? 0 : -1}
          snapPoints={snapPoints}
          onChange={(index) => setIsBottomSheetVisible(index !== -1)}
          enablePanDownToClose
          backgroundStyle={{ backgroundColor: '#18181b' }}
          handleIndicatorStyle={{ backgroundColor: '#71717a' }}
        >
          <View className="flex-1 bg-[#18181b] p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-2xl font-bold">
                {selectedGroup?.groupName} Rules
              </Text>
              <TouchableOpacity className="bg-zinc-700 rounded-full p-2" onPress={handleCloseBottomSheet}>
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>
            {rules.length > 0 ? (
              <FlatList
                data={rules}
                renderItem={({ item }) => <RuleItem rule={item} />}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-gray-400 text-lg">No rules found for this group</Text>
              </View>
            )}
          </View>
        </BottomSheet>
      {/* )} */}
    </SafeAreaView>
  );
};

export default RuleBookScreen;