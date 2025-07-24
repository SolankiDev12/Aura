import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from '../firebase'; // Ensure auth is properly imported
import { ref, push } from 'firebase/database';

const PollCreationButton = ({ groupId }) => {
    const handleCreatePoll = async () => {
        const user = auth.currentUser;

        // Validate if user is authenticated
        if (!user) {
            console.error('User is not authenticated');
            return;
        }

        const pollData = {
            senderId: user.uid,
            type: 'poll',
            question: 'Should we change the group creator?',
            options: ['Yes', 'No'],
            votes: {},
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
        };

        const messagesRef = ref(database, `groups/${groupId}/messages`);

        try {
            await push(messagesRef, pollData);
        } catch (error) {
            console.error('Error creating poll:', error);
        }
    };

    const demoPress = async () => {

    };

    return (
        <TouchableOpacity onPress={demoPress} className="bg-blue-500 rounded-full p-2 ml-2">
            <Ionicons name="podium-outline" size={24} color="white" />
        </TouchableOpacity>
    );
};

export default PollCreationButton;