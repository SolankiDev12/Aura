import { useState, useEffect } from 'react';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';

export const useUserDetails = (userId) => {
  const [userDetails, setUserDetails] = useState({ photoURL: null, username: '' });

  useEffect(() => {
    if (userId) {
      const userRef = ref(database, `users/${userId}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          setUserDetails({
            photoURL: userData.photoURL || null,
            username: userData.username || 'User'
          });
        }
      });
      return () => unsubscribe();
    }
  }, [userId]);

  return userDetails;
};