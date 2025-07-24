import { ref, get } from 'firebase/database';
import { database } from '../firebase'; // Make sure this path is correct for your Firebase setup

export const getNotifications = async (userId) => {
  const notificationsRef = ref(database, `users/${userId}/notifications`);
  
  try {
    const snapshot = await get(notificationsRef);
    if (snapshot.exists()) {
      const notificationsData = snapshot.val();
      return Object.entries(notificationsData).map(([id, notification]) => ({
        id,
        ...notification,
      }));
    } else {
      return []; // Return an empty array if there are no notifications
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return []; // Return an empty array on error
  }
};