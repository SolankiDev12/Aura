import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { database, auth } from '../firebase';
import { ref, update, push, serverTimestamp, onValue, remove } from 'firebase/database';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeableMemberItem from '../components/SwipeableMemberItem';
import PointsUpdateModal from '../components/PointsUpdateModal';

export default function GroupDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { group } = route.params;
  const [membersList, setMembersList] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const currentUser = auth.currentUser;
  const isCreator = currentUser && currentUser.uid === group.creatorId;

  useEffect(() => {
    const membersRef = ref(database, `groups/${group.id}/memberPoints`);
    
    // Listener to update members list in real-time
    const unsubscribe = onValue(membersRef, (snapshot) => {
      const membersData = snapshot.val() || {};
      const members = Object.entries(membersData).map(([uid, points]) => ({
        uid,
        points,
        name: group.members[uid]?.name, // Safely access member name
      })).sort((a, b) => b.points - a.points);
      setMembersList(members);
    });

    return () => unsubscribe();
  }, [group]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase();
  };

  const handleSelectMember = useCallback((member) => {
    setSelectedMember(member);
    setModalVisible(true);
  }, []);

  const updatePoints = async (pointsDiff) => {
    if (!selectedMember || pointsDiff === 0) return;

    const newPoints = selectedMember.points + pointsDiff;
    const updates = {};
    updates[`groups/${group.id}/memberPoints/${selectedMember.uid}`] = newPoints;

    const newHistoryRef = push(ref(database, `groups/${group.id}/history`));
    
    // Define the point change object
    const pointChange = {
        userId: selectedMember.uid,
        pointsUpdated: Math.abs(pointsDiff), // Store absolute value
        changeType: pointsDiff > 0 ? 'added' : 'deducted', // Add a flag for type
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
    };

    updates[`groups/${group.id}/history/${newHistoryRef.key}`] = pointChange;

    try {
        await update(ref(database), updates);
        closeModal();
    } catch (error) {
        console.error('Error updating points:', error);
        Alert.alert('Error', 'Failed to update points. Please try again.');
    }
  };

  const deleteMember = async (member) => {
    try {
      // Remove the member's points from the database
      await remove(ref(database, `groups/${group.id}/memberPoints/${member.uid}`));
      
      // Optionally remove the member from the group members list if you store it
      await remove(ref(database, `groups/${group.id}/members/${member.uid}`));

      // Send notification after removing the member
      await sendNotification(member.uid, `You have been removed from the group ${group.groupName}`);

      Alert.alert('Success', `${member.name} has been removed from the group.`);
    } catch (error) {
      console.error('Error deleting member:', error);
      Alert.alert('Error', 'Failed to delete member. Please try again.');
    }
  };

  const sendNotification = async (userId, message) => {
    try {
      const notificationRef = push(ref(database, `notifications/${userId}`));
      await update(notificationRef, {
        message: message,
        createdAt: serverTimestamp(),
        read: false,
        groupId: group.id,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMember(null);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0F15' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomColor: '#333', borderBottomWidth: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: group.groupIcon }} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 15 }} />
          <View>
            <Text style={{ color: 'white', fontSize: 18 }}>{group.groupName}</Text>
            <Text style={{ color: 'gray', fontSize: 12 }}>Members: {membersList.length} • Created: {formatDate(group.createdAt)}</Text>
          </View>
        </View>

        <FlatList
          data={membersList}
          renderItem={({ item }) => (
            <SwipeableMemberItem
              item={item}
              onSelect={handleSelectMember}
              onDelete={deleteMember} // Pass the delete function
              isCreator={isCreator}
              currentUserId={currentUser?.uid}
              groupCreatorId={group.creatorId}
              groupIcon={group.groupIcon}
              isModalVisible={isModalVisible}
              groupId={group.id}
              groupName={group.groupName}
            />
          )}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 20 }}
        />

        <PointsUpdateModal
          isVisible={isModalVisible}
          closeModal={closeModal}
          selectedMember={selectedMember}
          updatePoints={updatePoints}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}