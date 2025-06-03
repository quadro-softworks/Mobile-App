import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';

export default function RegulatorProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const handleLogout = async () => {
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Logout',
              onPress: async () => {
                await logout();
                router.replace('/login');
              },
            },
          ]
        );
      };
      
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F6FF' }}>
      <Text style={{ fontSize: 24, color: '#2563EB', fontWeight: 'bold' }}>Regulator Profile</Text>
      <Text style={{ fontSize: 16, color: '#64748B', marginTop: 12 }}>This is the Regulator Profiles screen.</Text>
      <Button
        title="Logout"
        onPress={handleLogout}
        style={{ marginTop: 32, width: 200 }}
        variant="outline"
      />
    </View>
  );
}
