import { useState, useEffect } from 'react';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import defaultProfile from '../assets/profile/default_profile.png';

const useUserProfile = () => {
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(database, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsername(data.username);
        setProfileImage(data.profileImage || defaultProfile);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return { username, profileImage, isLoading };
};

export default useUserProfile;