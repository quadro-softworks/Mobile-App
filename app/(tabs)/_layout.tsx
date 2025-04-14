import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons directly

import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

function CustomTabBarBackground() {
  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100%',
      backgroundColor: '#1c242f', // Dark background
    }}>
      {Platform.OS === 'ios' && <BlurView intensity={30} style={{ flex: 1 }} />}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#808080',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: CustomTabBarBackground,
        tabBarStyle: {
          position: 'absolute',
          height: 60,
          borderTopWidth: 1,
          borderTopColor: 'rgb(255, 255, 255)',
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: '#1c242f', // Set background color of tab bar
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} />, // Use Ionicons
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Ionicons name="map" size={26} color={color} />, // Use Ionicons
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Ionicons name="notifications" size={26} color={color} />, // Use Ionicons
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color }) => <Ionicons name="bookmark" size={26} color={color} />, // Use Ionicons
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} />, // Use Ionicons
        }}
      />
    </Tabs>
  );
}