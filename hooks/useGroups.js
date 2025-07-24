import { useState, useEffect } from 'react';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';

const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const groupsRef = ref(database, `groups`);
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const userGroups = [];
      snapshot.forEach((childSnapshot) => {
        const groupData = childSnapshot.val();
        if (groupData.members && groupData.members[user.uid]) {
          userGroups.push({
            id: childSnapshot.key,
            ...groupData,
          });
        }
      });
      setGroups(userGroups);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return { groups, isLoading };
};

export default useGroups;