import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert('Error', 'Please verify your email before logging in');
        await auth.signOut();
        return;
      }

      // No need to navigate manually - App.js will handle it
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 bg-mainBackground p-8 justify-center">
      <Text className="text-4xl font-bold mb-8 text-mainText">Login</Text>
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
        onPress={handleLogin}
      >
        <Text className="text-mainText text-center font-bold">Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text className="text-mainText text-center">Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}