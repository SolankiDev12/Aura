import React, { useEffect, useState, useRef } from 'react';
import {
    Text,
    View,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Keyboard,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { auth, database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import PollCreationButton from '../components/PollCreationButton';
import { AntDesign, Ionicons } from '@expo/vector-icons';


const ChatScreen = ({ navigation }) => {
    const route = useRoute();
    const { groupId, groupName, groupIcon } = route.params;

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupMembers, setGroupMembers] = useState({});
    const [isMember, setIsMember] = useState(false);
    const [isCreator, setIsCreator] = useState(false);
    const flatListRef = useRef(null);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [overlayAnimation] = useState(new Animated.Value(0));
    const [blurAnimation] = useState(new Animated.Value(0));
    const iconRef = useRef(null);
    const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                setKeyboardHeight(275);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        const messagesRef = ref(database, `groups/${groupId}/messages`);
        const membersRef = ref(database, `groups/${groupId}/members`);
        const groupRef = ref(database, `groups/${groupId}`);

        const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
            const messagesData = [];
            snapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                messagesData.push({ id: childSnapshot.key, ...message });
            });
            const sortedMessages = messagesData
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map((msg) => ({
                    ...msg,
                    read: msg.read || {},
                    readByCurrentUser: msg.read && msg.read[auth.currentUser.uid] ? true : false,
                }));
            setMessages(sortedMessages);
            setLoading(false);
            setTimeout(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToEnd({ animated: true });
                }
            }, 100);
        });

        const unsubscribeMembers = onValue(membersRef, (snapshot) => {
            const members = snapshot.val() || {};
            setGroupMembers(members);
            const currentUser = auth.currentUser;
            setIsMember(currentUser && members[currentUser.uid] ? true : false);
        });

        const unsubscribeGroup = onValue(groupRef, (snapshot) => {
            const groupData = snapshot.val();
            const currentUser = auth.currentUser;
            if (groupData && currentUser) {
                setIsCreator(groupData.creatorId === currentUser.uid);
            }
        });

        return () => {
            unsubscribeMessages();
            unsubscribeMembers();
            unsubscribeGroup();
        };
    }, [groupId]);

    const markMessageAsRead = (messageId) => {
        const userId = auth.currentUser.uid;
        const messageRef = ref(database, `groups/${groupId}/messages/${messageId}/read`);
        update(messageRef, { [userId]: true });
    };

    useEffect(() => {
        messages.forEach((msg) => {
            if (!msg.readByCurrentUser) {
                markMessageAsRead(msg.id);
            }
        });
    }, [messages]);

    const measureIcon = () => {
        iconRef.current.measure((fx, fy, width, height, px, py) => {
            setIconPosition({ x: px - 50, y: py - 50 });
        });
    };

    const toggleOverlay = () => {
        measureIcon();
        if (overlayVisible) {
            Animated.parallel([
                Animated.timing(overlayAnimation, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(blurAnimation, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: false,
                })
            ]).start(() => setOverlayVisible(false));
        } else {
            setOverlayVisible(true);
            Animated.parallel([
                Animated.timing(overlayAnimation, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(blurAnimation, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                })
            ]).start();
        }
    };

    const overlayScale = overlayAnimation.interpolate({
        inputRange: [-1, 1],
        outputRange: [0, 1],
    });

    const overlayTranslateY = overlayAnimation.interpolate({
        inputRange: [-30, 1],
        outputRange: [-30, -60],
    });

    const overlayTranslateX = overlayAnimation.interpolate({
        inputRange: [-30, 1],
        outputRange: [30, 30],
    });

    const overlayOpacity = overlayAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const blurIntensity = blurAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 10],
    });

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#0D0F15] p-4">
                <ActivityIndicator size="large" color="#4ade80" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#0D0F15]">
            <StatusBar barStyle="light-content" backgroundColor="#0D0F15" />
            <ChatHeader groupName={groupName} groupIcon={groupIcon} navigation={navigation} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 50}
                // style={{ paddingBottom: keyboardHeight }}
            >
                <MessageList
                    messages={messages}
                    groupMembers={groupMembers}
                    flatListRef={flatListRef}
                    groupId={groupId}
                />
                <View className="flex-row p-2 bg-[#333] justify-center items-center">
                    {isMember && !isCreator && (
                        <TouchableOpacity className="pr-2" onPress={toggleOverlay} ref={iconRef} onLayout={measureIcon}>
                            <Ionicons name="ellipsis-vertical-outline" size={24} color="#2354E9" />
                        </TouchableOpacity>
                    )}
                    <MessageInput groupId={groupId} flatListRef={flatListRef} />
                </View>
            </KeyboardAvoidingView>

            {overlayVisible && (
                <Modal transparent={true} animationType="none" visible={overlayVisible}>
                    <Animated.View 
                        className="flex-1 justify-end items-start"
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            opacity: overlayOpacity,
                        }}
                    >
                        <Pressable className="flex-1 w-full h-full" onPress={toggleOverlay}>
                            <Animated.View
                                className="bg-transparent rounded-lg p-5"
                                style={{
                                    opacity: overlayOpacity,
                                    transform: [
                                        { scale: overlayScale },
                                        { translateX: overlayTranslateX },
                                        { translateY: overlayTranslateY },
                                    ],
                                    position: 'absolute',
                                    left: iconPosition.x,
                                    top: iconPosition.y,
                                    overflow: 'hidden',
                                }}
                            >
                                <Animated.View
                                    style={{
                                        ...StyleSheet.absoluteFillObject,
                                        backdropFilter: `blur(${blurIntensity}px)`,
                                    }}
                                />
                                <View className="flex-row items-center justify-center">
                                    <PollCreationButton groupId={groupId} closeOverlay={toggleOverlay} />
                                    <Text className="ml-5 text-gray-300 text-xl font-normal">Poll</Text>
                                </View>
                            </Animated.View>
                        </Pressable>
                    </Animated.View>
                </Modal>
            )}
        </SafeAreaView>
    );
};

export default ChatScreen;