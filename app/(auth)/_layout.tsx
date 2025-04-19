import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import AuthProvider from '@/providers/AuthProvider';

export default function AuthLayout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
        </Stack>
        <StatusBar style="light" />
      </View>
    </AuthProvider>
  );
} 