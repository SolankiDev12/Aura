// useNotifications.js
import { useEffect, useState } from 'react';
import { ref, onValue, push, set, remove, update } from 'firebase/database';
import { database } from '../firebase';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const notificationsRef = ref(database, `notifications/${userId}`);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.entries(data).map(([id, notification]) => ({
          id,
          ...notification,
          createdAt: Number(notification.createdAt) || 0,
          message: notification.message || ''
        }));
        setNotifications(notificationsList.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const createNotification = async (targetUserId, notification) => {
    try {
      const notificationRef = push(ref(database, `notifications/${targetUserId}`));
      await set(notificationRef, {
        ...notification,
        createdAt: Date.now(),
        read: false,
      });
      return notificationRef.key;
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const updateNotification = async (targetUserId, notificationId, updates) => {
    try {
      const notificationRef = ref(database, `notifications/${targetUserId}/${notificationId}`);
      await update(notificationRef, updates);
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const removeNotification = async (targetUserId, notificationId) => {
    try {
      const notificationRef = ref(database, `notifications/${targetUserId}/${notificationId}`);
      await remove(notificationRef);
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  };

  return {
    notifications,
    createNotification,
    updateNotification,
    removeNotification,
  };
};
