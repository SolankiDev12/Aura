import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, Switch, Alert } from 'react-native';
import { auth, storage, database } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { ref as dbRef, onValue, update } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AvatarSelector from '../components/AvatarSelector';
import Camera from '../assets/bottom_nav_icons/camera';
import { useUserDetails } from '../hooks/useUserDetails'; // Import the new hook

const SettingItem = ({ title, iconName, value, onPress, toggleSwitch }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="flex-row items-center justify-between p-4 bg-mainSurface rounded-xl mb-3"
  >
    <View className="flex-row items-center">
      <Ionicons name={iconName} size={24} color="#F3F4F6" className="mr-3" />
      <Text className="ml-3 text-base font-medium text-mainText">{title}</Text>
    </View>
    {typeof value === 'boolean' ? (
      <Switch
        trackColor={{ false: "#4B5563", true: "#2354E9" }}
        thumbColor={value ? "#F3F4F6" : "#A1A1AA"}
        ios_backgroundColor="#4B5563"
        onValueChange={toggleSwitch}
        value={value}
      />
    ) : (
      <Ionicons name="chevron-forward" size={24} color="#F3F4F6" />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { photoURL, username } = useUserDetails(auth.currentUser?.uid);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvatarBottomSheetVisible, setIsAvatarBottomSheetVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const avatarBottomSheetRef = React.useRef(null);
  const snapPoints = useMemo(() => ['90%'], []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigation.replace('Login');
      }
    });

    fetchAvatars();

    return unsubscribe;
  }, []);

  const fetchAvatars = async () => {
    setLoading(true);
    const avatarsRef = ref(storage, 'avatarIcons');
    const avatarsList = [];

    try {
      const result = await listAll(avatarsRef);
      for (const itemRef of result.items) {
        const url = await getDownloadURL(itemRef);
        avatarsList.push(url);
      }
      setAvatars(avatarsList);
    } catch (error) {
      console.error('Error fetching avatars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleEditProfile = async () => {
    avatarBottomSheetRef.current?.expand();
  };

  const handleAvatarSelect = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
  };

  const handleConfirmAvatarSelection = async () => {
    if (selectedAvatar) {
      try {
        await updateProfile(auth.currentUser, { photoURL: selectedAvatar });
        await update(dbRef(database, `users/${auth.currentUser.uid}`), { photoURL: selectedAvatar });
        avatarBottomSheetRef.current?.close();
        Alert.alert('Success', 'Profile picture updated successfully!');
      } catch (error) {
        console.error('Error updating profile picture:', error);
        Alert.alert('Error', 'Failed to update profile picture. Please try again.');
      }
    }
  };

  const handleSelectFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to update your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 500 } }],
        { format: 'jpeg', compress: 0.8 }
      );

      const response = await fetch(manipResult.uri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, blob);
      
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      await update(dbRef(database, `users/${auth.currentUser.uid}`), { photoURL: downloadURL });
      
      avatarBottomSheetRef.current?.close();
      Alert.alert('Success', 'Profile picture updated successfully!');
    }
  };

  const settingsItems = [
    { title: 'Push notifications', iconName: 'notifications', value: pushNotifications, toggleSwitch: () => setPushNotifications(previousState => !previousState) },
    { title: 'Support', iconName: 'help-circle' },
    { title: 'Privacy Policy', iconName: 'lock-closed' },
    { title: 'Terms of Service', iconName: 'document-text' },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-mainBackground">
        <ScrollView className="flex-1 px-4 py-6">
          <View className="items-center mb-8">
            <TouchableOpacity onPress={handleEditProfile} className="relative">
              {photoURL ? (
                <Image
                  source={{ uri: photoURL }}
                  className="w-28 h-28 rounded-full mb-3"
                />
              ) : (
                <View className="w-28 h-28 rounded-full bg-mainSurface justify-center items-center mb-3">
                  <Ionicons name="person" size={56} color="#F3F4F6" />
                </View>
              )}
              <View className="absolute right-0 bottom-0 bg-gray-200 rounded-full p-2">
                <Camera width={18} height={18} fill="#2354E9" />
              </View>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-mainText mb-1">{username}</Text>
            <Text className="text-gray-400">{auth.currentUser?.email}</Text>
          </View>

          <Text className="text-lg font-semibold mb-3 text-mainText">Settings</Text>
          <View className="mb-6">
            {settingsItems.map((item, index) => (
              <SettingItem key={index} {...item} />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            className="mt-4 mb-14 p-4 bg-mainError rounded-xl flex-row justify-center items-center"
          >
            <Ionicons name="log-out" size={24} color="#F3F4F6" className="mr-2" />
            <Text className="text-mainText font-semibold text-center text-lg">Logout</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomSheet
          ref={avatarBottomSheetRef}
          index={isAvatarBottomSheetVisible ? 0 : -1}
          snapPoints={snapPoints}
          onChange={(index) => setIsAvatarBottomSheetVisible(index !== -1)}
          enablePanDownToClose
          backgroundStyle={{ backgroundColor: '#18181B' }}
          handleIndicatorStyle={{ backgroundColor: '#71717A' }}
        >
          <View className="flex-1 p-5">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-mainText text-xl font-bold">Choose Your Avatar</Text>
              <TouchableOpacity
                onPress={() => avatarBottomSheetRef.current?.close()}
                className="bg-mainSurface rounded-full p-2"
              >
                <Ionicons name="close" size={20} color="#F3F4F6" />
              </TouchableOpacity>
            </View>
            
            <AvatarSelector
              icons={avatars}
              loading={loading}
              selectedIcon={selectedAvatar}
              onSelectIcon={handleAvatarSelect}
            />

            <Text className="text-md text-gray-400 text-center my-4">
              Or upload your own photo
            </Text>
            
            <TouchableOpacity
              onPress={handleSelectFromGallery}
              className="w-16 h-16 rounded-full border-2 border-gray-400 border-dashed justify-center items-center self-center mb-6"
            >
              <Ionicons name="add" size={24} color="#2354E9" />
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-2 ${selectedAvatar ? 'bg-mainPrimary' : 'bg-gray-600'} rounded-xl`}
              disabled={!selectedAvatar}
              onPress={handleConfirmAvatarSelection}
            >
              <Text className="text-center text-mainText font-semibold text-lg">
                Confirm Selection
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}