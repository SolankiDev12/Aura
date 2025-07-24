import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { auth, database } from '../firebase';
import { ref, get } from 'firebase/database';

const ChatItem = ({ message, showSenderName, isLastInGroup }) => {
    const { senderId, text, timestamp } = message;
    const isCurrentUser = senderId === auth.currentUser.uid;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [senderName, setSenderName] = useState('');

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        const fetchSenderName = async () => {
            const snapshot = await get(ref(database, `users/${senderId}/username`));
            if (snapshot.exists()) {
                setSenderName(snapshot.val());
            }
        };

        fetchSenderName();
    }, [senderId]);

    return (
        <Animated.View 
            style={{ opacity: fadeAnim }}
            className={`p-3 ${isLastInGroup ? 'mb-2' : 'mb-1'} rounded-lg max-w-[80%] ${
                isCurrentUser 
                    ? 'bg-blue-500 self-end rounded-tr-none' 
                    : 'bg-gray-800 self-start rounded-tl-none'
            }`}
        >
            {showSenderName && !isCurrentUser && (
                <Text className="text-gray-300 text-xs mb-1">{senderName}</Text>
            )}
            <Text className="text-white">{text}</Text>
            <Text className="text-gray-300 text-xs text-right mt-1">
                {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </Animated.View>
    );
};

export default ChatItem;