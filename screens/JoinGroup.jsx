import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { database, auth } from '../firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../hooks/useNotifications';

export default function JoinGroup() {
  const navigation = useNavigation();
  const [inviteCode, setInviteCode] = useState(['', '', '', '', '']);
  const [message, setMessage] = useState('');
  const inputRefs = useRef([]);
  const [memberJoinName, setMemberJoinName] = useState('');
  const user = auth.currentUser;
  const { createNotification } = useNotifications(user?.uid);

  const handleInputChange = (index, value) => {
    if (value.length <= 1) {
      const newInviteCode = [...inviteCode];
      newInviteCode[index] = value.replace(/[^0-9]/g, '');
      setInviteCode(newInviteCode);
      if (value && index < 4) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const fetchUsername = async () => {
    try {
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        if (userData && userData.username) {
          setMemberJoinName(userData.username);
        }
      }
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  };

  useEffect(() => {
    fetchUsername();
  }, []);

  const handleInputDelete = (index) => {
    const newInviteCode = [...inviteCode];
    newInviteCode[index] = '';
    setInviteCode(newInviteCode);
    if (index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const checkExistingRequest = async (creatorId, groupId) => {
    try {
      const notificationsRef = ref(database, `notifications/${creatorId}`);
      const snapshot = await get(notificationsRef);
      
      if (snapshot.exists()) {
        const notifications = Object.values(snapshot.val());
        return notifications.some(
          notification => 
            notification.type === 'join_request' && 
            notification.requesterId === user.uid &&
            notification.groupId === groupId &&
            notification.status === 'pending'
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking existing request:', error);
      return false;
    }
  };

  const handleJoinRequest = async () => {
    try {
      if (!user) {
        setMessage('User not authenticated');
        return;
      }

      if (!memberJoinName) {
        Alert.alert('Error', 'Unable to retrieve username. Please try again or log out and log back in.');
        return;
      }

      const groupsRef = ref(database, 'groups');
      const snapshot = await get(groupsRef);
      const inviteCodeString = inviteCode.join('');
      
      if (!snapshot.exists()) {
        setMessage('Invalid invite code. Please try again.');
        return;
      }

      const groups = snapshot.val();
      let groupFound = false;

      for (const groupId in groups) {
        const groupData = groups[groupId];

        if (groupData.inviteCode && groupData.inviteCode.toString() === inviteCodeString) {
          groupFound = true;

          if (groupData.members && groupData.members[user.uid]) {
            setMessage('You are already a member of this group.');
            return;
          }

          const existingRequest = await checkExistingRequest(groupData.creatorId, groupId);
          if (existingRequest) {
            setMessage('You already have a pending request for this group.');
            return;
          }

          await createNotification(groupData.creatorId, {
            type: 'join_request',
            groupId,
            groupName: groupData.groupName,
            requesterId: user.uid,
            requesterName: memberJoinName,
            status: 'pending'
          });

          await createNotification(user.uid, {
            type: 'join_request_sent',
            groupId,
            groupName: groupData.groupName,
            message: `Your request to join ${groupData.groupName} is pending approval.`,
            status: 'pending'
          });

          setMessage('Join request sent to group creator!');
          Alert.alert('Success', 'Your request to join the group has been sent to the group creator.', [
            { text: 'OK', onPress: () => navigation.navigate('GroupHome') },
          ]);
          return;
        }
      }

      if (!groupFound) {
        setMessage('Invalid invite code. Please try again.');
      }
    } catch (error) {
      console.error('Error handling join request:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-[#0D0F15] p-5">
        <View className="m-5 top-1/4">
          <Text className="text-3xl font-bold text-white mb-8">Join a Group</Text>

          <View className="flex-row justify-center mb-6">
            {inviteCode.map((code, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                placeholder="0"
                value={code}
                onChangeText={(value) => handleInputChange(index, value)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace' && code === '') {
                    handleInputDelete(index);
                  }
                }}
                className="bg-[#1E1E2D] text-white border m-1 border-gray-700 rounded-lg w-16 h-16 text-center text-xl"
                keyboardType="numeric"
                maxLength={1}
              />
            ))}
          </View>

          <TouchableOpacity onPress={handleJoinRequest} className="bg-[#2354E9] rounded-lg p-4 mt-4">
            <Text className="text-white text-center text-lg font-semibold">Request to Join Group</Text>
          </TouchableOpacity>

          {message && <Text className="text-white text-center mt-4">{message}</Text>}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}