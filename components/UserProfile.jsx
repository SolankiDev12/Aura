import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, ActivityIndicator, SafeAreaView, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../firebase';
import { ref, set, get } from 'firebase/database';
import { getStorage, ref as storageRef, getDownloadURL, listAll } from 'firebase/storage';
import { MaterialIcons } from '@expo/vector-icons';

export default function UserProfile() {
    const navigation = useNavigation();
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [icons, setIcons] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchIcons = async () => {
        setLoading(true);
        const storage = getStorage();
        const iconsRef = storageRef(storage, 'userIcons'); // Adjust the path as needed
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
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        const user = auth.currentUser;
        if (user) {
            const userRef = ref(database, `users/${user.uid}`);
            const userSnapshot = await get(userRef);
            const userData = userSnapshot.val();
            if (userData && userData.profileIcon) {
                setSelectedIcon(userData.profileIcon);
            }
        }
    };

    const handleSaveProfile = async () => {
        const user = auth.currentUser;
        if (!user) {
            console.error('No authenticated user found');
            return;
        }

        try {
            const userRef = ref(database, `users/${user.uid}`);
            await set(userRef, {
                profileIcon: selectedIcon,
                // Add other user profile fields if needed
            });
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        }
    };

    const selectProfileIcon = () => {
        setModalVisible(true);
    };

    const handleIconSelect = (icon) => {
        setSelectedIcon(icon);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView className="flex-1 bg-[#0D0F15] p-10">
                <View className="m-5">
                    <Text className="text-3xl font-bold text-white mb-8">User Profile</Text>

                    <TouchableOpacity onPress={selectProfileIcon}>
                        <Image
                            source={selectedIcon ? { uri: selectedIcon } : require('../assets/profile/default_profile.png')}
                            className="w-32 h-32 rounded-full mb-4"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSaveProfile}
                        className="bg-[#2354E9] rounded-lg p-4 mt-4"
                    >
                        <Text className="text-white text-center text-lg font-semibold">Save Profile</Text>
                    </TouchableOpacity>

                    <Modal visible={modalVisible} transparent={true} animationType="slide">
                        <View className="flex-1 w-full bg-opacity-60 justify-end items-center">
                            <View className="bg-[#1E1E2D] p-4 rounded-2xl w-full">
                                <Text className="text-lg font-bold text-white mb-4">Select an Icon</Text>
                                {loading ? (
                                    <ActivityIndicator size="large" color="#2354E9" />
                                ) : (
                                    <ScrollView showsVerticalScrollIndicator={false}
                                                horizontal contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                        {icons.map((icon, index) => {
                                            const isSelected = selectedIcon === icon;
                                            const iconStyle = {
                                                transform: [{ scale: isSelected ? 1.1 : 1 }],
                                                opacity: isSelected ? 1 : 0.9,
                                                width: 60,
                                                height: 60,
                                                borderRadius: 100,
                                                padding: 10,
                                                margin: 10,
                                                borderColor: '#2354E9',
                                                borderWidth: isSelected ? 2 : 0,
                                            };

                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    onPress={() => handleIconSelect(icon)}
                                                    style={{ justifyContent: 'center', alignItems: 'center' }}
                                                >
                                                    <Image source={{ uri: icon }} style={iconStyle} />
                                                    {isSelected && (
                                                        <View className="absolute right-0 bottom-0 bg-[#2354E9] rounded-full p-1">
                                                            <MaterialIcons name="check" size={16} color="white" />
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                )}
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    className="my-6 bg-[#2354E9] rounded-lg py-4"
                                >
                                    <Text className="text-white text-center">Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}
