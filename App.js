import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth'; // Using initialized Firebase Auth
import { auth } from './firebase'; // Import initialized auth from firebase.js
import { View, ActivityIndicator } from 'react-native';

// Importing screen components
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import HistoryScreen from './screens/HistoryScreen';
import RulebookScreen from './screens/RulebookScreen';
import SettingsScreen from './screens/SettingsScreen';
import JoinGroup from './screens/JoinGroup';
import CreateGroup from './screens/CreateGroup';
import BottomNavBar from './components/BottomNavBar'; // Custom bottom navigation component
import GroupDetailsScreen from './screens/GroupDetailsScreen';
import NotificationScreen from './screens/NotificationScreen';
import RuleDetailScreen from './screens/RuleDetailScreen';
import ChatDetail from './screens/ChatDetail'; // Import ChatDetail screen
import ChatScreen from './screens/ChatScreen'; // Import ChatScreen

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack for handling group-related screens
const GroupStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="GroupHome" // Changed from "Home" to "GroupHome"
      component={HomeScreen} 
    />
    <Stack.Screen name="Notification" component={NotificationScreen} />
    <Stack.Screen name="JoinGroup" component={JoinGroup} />
    <Stack.Screen name="CreateGroup" component={CreateGroup} />
    <Stack.Screen name="RuleDetail" component={RuleDetailScreen} />
    <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
    <Stack.Screen name="ChatScreen" component={ChatScreen} /> 
    <Stack.Screen name="ChatDetail" component={ChatDetail} /> 
  </Stack.Navigator>
);

// Stack for handling rulebook screens
const RuleBookStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="RuleBook" component={RulebookScreen} />
    <Stack.Screen name="RuleDetail" component={RuleDetailScreen} />
  </Stack.Navigator>
);

// Main tabs with bottom navigation
const MainTabs = () => (
  <Tab.Navigator
      tabBarOptions={{
        tabBarHideOnKeyboard: true,
      }}
    tabBar={props => <BottomNavBar {...props} />}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Tab.Screen name="Home" component={GroupStack} options={{ gestureEnabled: false }} />
    <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Rulebook" component={RuleBookStack} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// Authentication stack for login/signup flow
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [user, setUser] = useState(null); // User state

  // Effect to monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set user state on authentication change
      setIsLoading(false); // Stop loading once auth state is known
    });

    // Cleanup subscription on component unmount
    return unsubscribe;
  }, []);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Return navigation based on authentication status
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainTabs" component={MainTabs} /> // Main app navigation if user is logged in
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} /> // Auth navigation (login/signup) if no user
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
