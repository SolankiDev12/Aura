import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../firebase';
import { useNavigation } from '@react-navigation/native';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const validateInputs = () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;

    try {
      // Check if username is unique
      const usernameRef = ref(database, `usernames/${username}`);
      const usernameSnapshot = await get(usernameRef);
      if (usernameSnapshot.exists()) {
        Alert.alert('Error', 'Username is already taken');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Realtime Database
      await set(ref(database, `users/${user.uid}`), {
        username,
        email,
      });

      // Save username to prevent duplicates
      await set(usernameRef, user.uid);

      await sendEmailVerification(user);

      Alert.alert('Success', 'Registration successful. Please check your email to verify your account.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 bg-mainBackground p-8 justify-center">
      <Text className="text-4xl font-bold mb-8 text-mainText">Sign Up</Text>
      <TextInput
        className="bg-mainInputBg border-[1px] border-mainSurface text-mainText p-4 rounded-lg mb-4"
        placeholder="Username"
        placeholderTextColor="#9CA3AF"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        className="bg-mainInputBg border-[1px] border-mainSurface text-mainText p-4 rounded-lg mb-4"
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="bg-mainInputBg border-[1px] border-mainSurface text-mainText p-4 rounded-lg mb-8"
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className="bg-mainPrimary p-4 rounded-lg mb-14"
        onPress={handleSignup}
      >
        <Text className="text-mainText text-center font-bold">Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text className="text-mainText text-center">Already have an account ? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}
