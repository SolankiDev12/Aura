import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import BottomSheet from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import NewChat from '../assets/bottom_nav_icons/newchat';

const ChatDetail = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [userGroups, setUserGroups] = useState([]);
    const [noChatGroups, setNoChatGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const bottomSheetRef = React.useRef(null);
    const snapPoints = useMemo(() => ['80%'], []);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const groupsRef = ref(database, 'groups');

            const unsubscribeGroups = onValue(groupsRef, (snapshot) => {
                const chattedGroupsList = [];
                const noChatGroupsList = [];

                snapshot.forEach((childSnapshot) => {
                    const groupData = childSnapshot.val();
                    if (groupData.members && groupData.members[user.uid]) {
                        const groupId = childSnapshot.key;
                        const historyRef = ref(database, `groups/${groupId}/messages`);

                        onValue(historyRef, (historySnapshot) => {
                            const messages = historySnapshot.val() || {};
                            const sortedMessages = Object.values(messages).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                            const lastMessage = sortedMessages[0];
                            const unreadCount = sortedMessages.filter(m => m.read && !m.read[user.uid] && m.senderId !== user.uid).length;

                            const groupInfo = {
                                id: groupId,
                                ...groupData,
                                lastMessage: lastMessage ? lastMessage.text : '',
                                lastMessageTime: lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                                unreadCount,
                            };

                            if (sortedMessages.length > 0) {
                                chattedGroupsList.push(groupInfo);
                            } else {
                                noChatGroupsList.push(groupInfo);
                            }
                        });
                    }
                });

                setUserGroups(chattedGroupsList);
                setNoChatGroups(noChatGroupsList);
                setLoading(false);
            });

            return () => unsubscribeGroups();
        }
    }, []);

    const handleGroupPress = (group) => {
        navigation.navigate('ChatScreen', { 
            groupId: group.id,
            groupName: group.groupName,
            groupIcon: group.groupIcon,
        });
    };

    const handleCloseBottomSheet = () => {
        bottomSheetRef.current?.close();
        setIsBottomSheetVisible(false);
    };

    const renderGroupItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleGroupPress(item)}
            className="flex-row items-center bg-gray-800 border border-gray-700 rounded-lg p-4 mb-2"
        >
            <Image
                source={{ uri: item.groupIcon || 'https://via.placeholder.com/50' }}
                className="w-12 h-12 rounded-full mr-4"
            />
            <View className="flex-1">
                <Text className="text-white text-lg font-semibold">{item.groupName}</Text>
                <Text className="text-gray-400 text-sm">{item.lastMessage}</Text>
            </View>
            <View className="items-end">
                <Text className="text-gray-400 text-xs mb-1">{item.lastMessageTime}</Text>
                {item.unreadCount > 0 && (
                    <View className="bg-blue-500 rounded-full w-6 h-6 justify-center items-center">
                        <Text className="text-white text-xs">{item.unreadCount}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0F15', paddingTop: insets.top }}>
            <StatusBar barStyle="light-content" backgroundColor="#0D0F15" />
            <View className="px-4 py-3 border-b border-gray-700">
                <Text className="text-white text-2xl font-bold">Chats</Text>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#4ade80" className="flex-1 justify-center" />
            ) : (
                <FlatList
                    data={userGroups}
                    renderItem={renderGroupItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={() => (
                        <Text className="text-white text-center mt-4">No groups with chats available.</Text>
                    )}
                />
            )}
            <TouchableOpacity
                className="absolute bottom-5 right-5 bg-mainPrimary rounded-full w-14 h-14 justify-center items-center"
                onPress={() => {
                    setIsBottomSheetVisible(true);
                    bottomSheetRef.current?.expand();
                }}
            >
                <NewChat width={28} height={28} fill="#F3F4F6" />

                {/* <Ionicons name="add" size={28} color="white" /> */}
            </TouchableOpacity>
            <BottomSheet
                ref={bottomSheetRef}
                index={isBottomSheetVisible ? 0 : -1}
                snapPoints={snapPoints}
                onChange={(index) => setIsBottomSheetVisible(index !== -1)}
                enablePanDownToClose
                backgroundStyle={{ backgroundColor: '#18181b' }}
                handleIndicatorStyle={{ backgroundColor: '#71717a' }}
            >
                <View className="flex-1 p-4">
                    <View className="flex-row justify-between mb-10 items-center">
                        <Text className="text-white text-xl mb-2">New chat</Text>
                        <TouchableOpacity
                            onPress={handleCloseBottomSheet}
                            style={{ backgroundColor: '#3f3f46', borderRadius: 20, padding: 8 }}
                        >
                            <Ionicons name="close" size={18} color="white" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={noChatGroups}
                        renderItem={renderGroupItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                        ListEmptyComponent={() => (
                            <Text className="text-white text-center mt-4">No groups without chats.</Text>
                        )}
                    />
                </View>
            </BottomSheet>
        </SafeAreaView>
    );
};

export default ChatDetail;
