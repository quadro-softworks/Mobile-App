import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons'; // You can adjust icons as needed

import { HapticTab } from '@/components/HapticTab';

function CustomTabBarBackground() {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}>
      {Platform.OS === 'ios' && <BlurView intensity={30} style={{ flex: 1 }} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false, // No text under icons
        tabBarButton: HapticTab,
        tabBarBackground: CustomTabBarBackground,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarIcon: ({ color, focused }) => {
          let icon;
          switch (route.name) {
            case 'favorites':
              icon = <Ionicons name="heart-outline" size={28} color={color} style={{marginBottom: -10}}/>;
              break;
            case 'map':
              icon = <Ionicons name="location-outline" size={28} color={color} style={{marginBottom:-10}}/>;
              break;
            case 'index':
              icon = (
                <View
                  style={{
                    backgroundColor: focused ? '#007AFF' : 'transparent',
                    width: 45,
                    height: 45,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 12,
                    marginBottom: -10,
                  }}>
                  <Ionicons name="home-outline" size={28} color={focused ? 'white' : color}/>
                </View>
              );
              break;
            case 'profile':
              icon = <Ionicons name="person-outline" size={28} color={color} style={{marginBottom:-10}}/>;
              break;
            case 'wallet':
              icon = <Ionicons name="wallet-outline" size={28} color={color} style={{marginBottom:-10}}/>;
              break;
          }
          return icon;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#555',
      })}>
      <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} />
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
