import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, database } from '../firebase';
import { ref, push } from 'firebase/database';

const MessageInput = ({ groupId, flatListRef }) => {
    const [newMessage, setNewMessage] = useState('');
    const inputRef = useRef(null);
    const sendButtonOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(sendButtonOpacity, {
            toValue: newMessage.trim().length > 0 ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [newMessage]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;

        const user = auth.currentUser;
        const messageData = {
            senderId: user.uid,
            text: newMessage,
            timestamp: new Date().toISOString(),
            type: 'text',
        };

        const messagesRef = ref(database, `groups/${groupId}/messages`);
        await push(messagesRef, messageData);
        setNewMessage('');
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    return (
        <View className="flex-row flex-1">
            <TextInput
                ref={inputRef}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor="#a1a1aa"
                className="flex-1 bg-zinc-700 rounded-lg p-2 py-3 text-white"
            />
            <Animated.View style={{ opacity: sendButtonOpacity }}>
                <TouchableOpacity onPress={handleSendMessage} className="bg-mainPrimary items-center justify-center rounded-full p-2 ml-2">
                    <Ionicons name="send" size={24} color="white" />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default MessageInput;