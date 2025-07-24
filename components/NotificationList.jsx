import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getNotifications } from '../utils/notificationService';

const NotificationList = ({ groupId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch notifications when component mounts
    getNotifications(groupId, (fetchedNotifications) => {
      setNotifications(fetchedNotifications);
    });
  }, [groupId]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.notificationText}>{item.message}</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0D0F15',
  },
  header: {
    fontSize: 24,
    color: 'white',
    marginBottom: 16,
  },
  notificationItem: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  notificationText: {
    color: 'white',
  },
  timestamp: {
    color: '#bbb',
    fontSize: 12,
  },
});

export default NotificationList;