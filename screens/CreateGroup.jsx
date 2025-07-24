import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, Keyboard, TouchableWithoutFeedback, Alert, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../firebase';
import { ref, push, set, get } from 'firebase/database';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { getStorage, ref as storageRef, getDownloadURL, listAll } from 'firebase/storage';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PointsDial from '../components/PointsDial';
import AvatarSelection from '../components/AvatarSelector'; // Import the new AvatarSelection component

export default function CreateGroup() {
    const navigation = useNavigation();
    const [groupName, setGroupName] = useState('');
    const [initialPoints, setInitialPoints] = useState(1000);
    const [groupIcon, setGroupIcon] = useState(null);
    const [icons, setIcons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [membername, setMembername] = useState('');
    const [isIconBottomSheetVisible, setIsIconBottomSheetVisible] = useState(false);
    const [isPointsBottomSheetVisible, setIsPointsBottomSheetVisible] = useState(false);

    const { height } = useWindowDimensions();
    const isSmallDevice = height < 700;
    const isTallDevice = height > 800;

    const iconBottomSheetHeight = isSmallDevice ? '35%' : isTallDevice ? '25%' : '30%';
    const pointBottomSheetHeight = isSmallDevice ? '65%' : isTallDevice ? '62%' : '60%';

    const iconBottomSheetRef = React.useRef(null);
    const pointsBottomSheetRef = React.useRef(null);

    const snapPoints = useMemo(() => ['30%'], []);

    const handleIconCloseBottomSheet = useCallback(() => {
        iconBottomSheetRef.current?.close();
        setIsIconBottomSheetVisible(false);
    }, []);

    const handlePointCloseBottomSheet = useCallback(() => {
        pointsBottomSheetRef.current?.close();
        setIsPointsBottomSheetVisible(false);
    }, []);

    const fetchIcons = async () => {
        setLoading(true);
        const storage = getStorage();
        const iconsRef = storageRef(storage, 'groupIcons');
        const iconsList = [];

        try {
            const result = await listAll(iconsRef);
            for (const itemRef of result.items) {
                const url = await getDownloadURL(itemRef);
                iconsList.push(url);
            }
            setIcons(iconsList);
        } catch (error) {
            console.error('Error fetching icons:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIcons();
        fetchUsername();
    }, []);

    const fetchUsername = async () => {
        const user = auth.currentUser;
        if (user) {
            const userRef = ref(database, `users/${user.uid}`);
            const userSnapshot = await get(userRef);
            const userData = userSnapshot.val();
            if (userData && userData.username) {
                setMembername(userData.username);
            }
        }
    };

    const handleCreateGroup = async () => {
        if (groupName.trim().length === 0 || groupName.length > 30) {
            Alert.alert('Invalid Group Name', 'Group name must be between 1 and 30 characters.');
            return;
        }

        if (!groupIcon) {
            Alert.alert('Group Icon Required', 'Please select a group icon.');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            console.error('No authenticated user found');
            return;
        }

        if (!membername) {
            Alert.alert('Error', 'Unable to retrieve username. Please try again or log out and log back in.');
            return;
        }

        try {
            const groupsRef = ref(database, 'groups');
            const newGroupRef = push(groupsRef);
            const groupId = newGroupRef.key;
            const inviteCode = Math.floor(10000 + Math.random() * 90000);

            const groupData = {
                id: groupId,
                groupName,
                creatorId: user.uid,
                initialPoints,
                inviteCode,
                members: { 
                    [user.uid]: {
                        name: membername,
                        joinedAt: new Date().toISOString()
                    }
                },
                memberPoints: { [user.uid]: initialPoints },
                groupIcon,
                createdAt: new Date().toISOString(),
                history: {}
            };

            await set(newGroupRef, groupData);
            Alert.alert(
                'Success',
                'Group created successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Home')
                    }
                ]
            );
        } catch (error) {
            console.error('Error creating group:', error);
            Alert.alert('Error', 'Failed to create group. Please try again.');
        }
    };

    const selectGroupIcon = useCallback(() => {
        iconBottomSheetRef.current?.expand();
        handlePointCloseBottomSheet();
    }, []);

    const handleIconSelect = useCallback((icon) => {
        setGroupIcon(icon);
        // iconBottomSheetRef.current?.close();
    }, []);

    const openPointsSelector = useCallback(() => {
        handleIconCloseBottomSheet();
        pointsBottomSheetRef.current?.expand();
    }, []);

    const handlePointsChange = useCallback((points) => {
        setInitialPoints(points);
    }, []);

    const onClose = useCallback(()=>{
        pointsBottomSheetRef.current?.close();
        setIsPointsBottomSheetVisible(false);
        Keyboard.dismiss();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0F15', padding: 0 }}>
                    <View style={{ flex: 1 }}>
                        <View style={{ margin: 10}}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 32 }}>Create New Group</Text>
                            <View style={{ backgroundColor: '#1E1E2D', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <TouchableOpacity style={{marginRight: 12}} onPress={selectGroupIcon}>
                                        <Image
                                            source={groupIcon ? { uri: groupIcon } : require('../assets/profile/default_profile.png')}
                                            style={{ width: 64, height: 64, borderRadius: 32, marginRight: 12 }}
                                        />
                                        <View style={{ position: 'absolute', right: 0, bottom: 0, backgroundColor: '#2354E9', borderRadius: 12, padding: 4 }}>
                                            <MaterialIcons name="edit" size={16} color="white" />
                                        </View>
                                    </TouchableOpacity>
                                    
                                    <TextInput
                                        placeholder="Group Name"
                                        value={groupName}
                                        onChangeText={setGroupName}
                                        style={{ flex: 1, fontSize: 18, color: 'white' }}
                                        placeholderTextColor="#6B7280"
                                        maxLength={30}
                                    />
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={openPointsSelector}
                                style={{ backgroundColor: '#1E1E2D', borderRadius: 12, padding: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <Text style={{ color: 'white', fontSize: 18 }}>Initial Points</Text>
                                <View style={{ backgroundColor: '#2354E9', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 }}>
                                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>{initialPoints}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCreateGroup}
                                style={{ backgroundColor: '#2354E9', borderRadius: 12, padding: 16, marginTop: 16 }}
                            >
                                <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Create Group</Text>
                            </TouchableOpacity>
                        </View>

                        <BottomSheet
                            ref={iconBottomSheetRef}
                            index={isIconBottomSheetVisible ? 0 : -1}
                            snapPoints={[iconBottomSheetHeight]}
                            onChange={(index) => setIsIconBottomSheetVisible(index !== -1)}
                            enablePanDownToClose
                            backgroundStyle={{
                              backgroundColor: '#18181b',
                            }}
                            handleIndicatorStyle={{
                              width: 50,
                              height: 5,
                              backgroundColor: '#71717a',
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 14 }}>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>Select an Icon</Text>
                                    <TouchableOpacity
                                        onPress={handleIconCloseBottomSheet}
                                        style={{ backgroundColor: '#3f3f46', borderRadius: 20, padding: 8 }}
                                    >
                                        <Ionicons name="close" size={18} color="white" />
                                    </TouchableOpacity>
                                </View>
                                <AvatarSelection
                                    icons={icons}
                                    loading={loading}
                                    selectedIcon={groupIcon}
                                    onSelectIcon={handleIconSelect}
                                />
                            </View>
                        </BottomSheet>

                        <BottomSheet
                            ref={pointsBottomSheetRef}
                            index={isPointsBottomSheetVisible ? 0 : -1}
                            snapPoints={[pointBottomSheetHeight]}
                            onChange={(index) => setIsPointsBottomSheetVisible(index !== -1)}
                            enablePanDownToClose
                            backgroundStyle={{
                              backgroundColor: '#18181b',
                            }}
                            handleIndicatorStyle={{
                              width: 50,
                              height: 5,
                              backgroundColor: '#71717a',
                            }}
                        >
                            <View className="flex-row justify-between items-center w-full px-6 ">
                                <Text className="text-[20px] text-white">Set Points</Text>
                                <TouchableOpacity className="bg-[#3f3f46] rounded-full p-[4px]" onPress={onClose}>
                                <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            <PointsDial
                                initialPoints={initialPoints}
                                onPointsChange={handlePointsChange}
                                onClose={handlePointCloseBottomSheet}
                                allowNegative={false}
                                minPoints={0}
                                maxPoints={10000}
                            />
                        </BottomSheet>
                    </View>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
    );
}