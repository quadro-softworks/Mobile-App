import React from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';

export default function DriverTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
