import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

// Import icon components
import HomeIcon from '../assets/bottom_nav_icons/home';
import LeaderboardIcon from '../assets/bottom_nav_icons/leaderboard';
import HistoryIcon from '../assets/bottom_nav_icons/history';
import SettingsIcon from '../assets/bottom_nav_icons/settings';
import RulebookIcon from '../assets/bottom_nav_icons/rulebook';

const BottomNavBar = ({ state, descriptors, navigation }) => {
  const icons = {
    Home: HomeIcon,
    Leaderboard: LeaderboardIcon,
    History: HistoryIcon,
    Settings: SettingsIcon,
    Rulebook: RulebookIcon,
  };

  const renderIcon = (routeName, isFocused) => {
    const IconComponent = icons[routeName];
    if (!IconComponent) return null;

    return (
      <IconComponent
        width={28}
        height={28}
        // fill={isFocused ? '#FFFFFF' : '#F3F4F6'}
      />
    );
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={[
              styles.tabButton,
              isFocused && styles.activeTabButton, // Apply blue background when focused
            ]}
          >
            {renderIcon(route.name, isFocused)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#17191F', // Dark background
    height: 90,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    // borderTopWidth: 1,
    // borderTopColor: '#4B5563',
  },
  tabButton: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 38,
    height: 38,
    paddingVertical: 25,
    // backgroundColor: '#ff0000',
    paddingHorizontal: 25, // Adjust padding to prevent icons from being cut off
    borderRadius: 15, // Add some rounding to all buttons
  },
  activeTabButton: {
    backgroundColor: '#2354E9', // Blue background for active icon
    justifyContent: 'center',
    alignItems: 'center',
    width: 38,
    height: 38,
    paddingVertical: 25,
    paddingHorizontal: 25, // Adjust padding to prevent icons from being cut off
    borderRadius: 15, // Add some rounding to all buttons
  },
});

export default BottomNavBar;
