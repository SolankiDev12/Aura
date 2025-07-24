import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../firebase';
import { ref, update, onValue, remove, push, get } from 'firebase/database';
import NotificationItem from '../components/NotificationItem';
import NoNotifications from '../components/NoNotifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StyledView = styled(View);
const StyledText = styled(Text);

const NotificationScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allNotifications, setAllNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchNotifications(currentUser.uid);
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      const notificationsRef = ref(database, `notifications/${userId}`);
      onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const notificationsList = Object.entries(data).map(([id, notification]) => ({
            id,
            ...notification,
            createdAt: notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Unknown date',
          })).sort((a, b) => b.createdAt - a.createdAt);
          setAllNotifications(notificationsList);
        } else {
          setAllNotifications([]);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async (notification, action) => {
    try {
      const { requesterId, groupId, id } = notification;
      const groupRef = ref(database, `/groups/${groupId}`);
      const groupSnapshot = await get(groupRef);
      const groupData = groupSnapshot.val();

      if (!groupData) {
        console.error("Group not found");
        return;
      }

      const creatorId = groupData.creatorId;
      const initialPoints = groupData.initialPoints || 0;

      if (action === 'accept') {
        const updates = {};
        updates[`/groups/${groupId}/members/${requesterId}`] = {
          name: notification.requesterName,
          joinedAt: new Date().toISOString(),
        };
        updates[`/groups/${groupId}/memberPoints/${requesterId}`] = initialPoints;
        await update(ref(database), updates);

        await createNotification(requesterId, {
          type: 'join_request_response',
          status: 'accepted',
          groupId,
          groupName: notification.groupName,
          message: `Your request to join ${notification.groupName} has been accepted!`,
        });

        await createNotification(creatorId, {
          type: 'join_request_action',
          action: 'accepted',
          requesterId,
          requesterName: notification.requesterName,
          groupId,
          groupName: notification.groupName,
          message: `You accepted ${notification.requesterName}'s request to join ${notification.groupName}.`,
        });

      } else {
        await createNotification(requesterId, {
          type: 'join_request_response',
          status: 'rejected',
          groupId,
          groupName: notification.groupName,
          message: `Your request to join ${notification.groupName} has been rejected.`,
        });

        await createNotification(creatorId, {
          type: 'join_request_action',
          action: 'rejected',
          requesterId,
          requesterName: notification.requesterName,
          groupId,
          groupName: notification.groupName,
          message: `You rejected ${notification.requesterName}'s request to join ${notification.groupName}.`,
        });
      }

      const notificationRef = ref(database, `notifications/${user.uid}/${id}`);
      await remove(notificationRef);

    } catch (error) {
      console.error("Error handling join request:", error);
    }
  };

  const createNotification = async (targetUserId, notification) => {
    try {
      const notificationRef = push(ref(database, `notifications/${targetUserId}`));
      await update(notificationRef, {
        ...notification,
        createdAt: Date.now(),
        read: false,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const handleNotificationPress = async (notification) => {
    try {
      if (!notification.read) {
        const notificationRef = ref(database, `notifications/${user.uid}/${notification.id}`);
        await update(notificationRef, { read: true });
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  if (isLoading) {
    return (
      <StyledView className="flex-1 bg-[#0D0F15] justify-center items-center">
        <ActivityIndicator size="large" color="#4A90E2" />
      </StyledView>
    );
  }

  if (!user) {
    return (
      <StyledView className="flex-1 bg-[#0D0F15] justify-center items-center">
        <StyledText className="text-white text-lg">Please log in to see notifications</StyledText>
      </StyledView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0D0F15]" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-3 border-b mb-3 border-gray-800">
        <StyledText className="text-white text-2xl font-bold">Notifications</StyledText>
      </View>
      {allNotifications.length > 0 ? (
        <FlatList
          data={allNotifications}
          renderItem={({ item }) => (
            <NotificationItem
              item={item}
              handleJoinRequest={handleJoinRequest}
              handleNotificationPress={handleNotificationPress}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        />
      ) : (
        <NoNotifications />
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;
