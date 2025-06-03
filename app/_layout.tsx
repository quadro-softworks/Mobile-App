import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/stores/authStore";
import { View, Text } from "react-native";
import { useRouter } from 'expo-router';

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Check if user is authenticated
      checkAuth();
      SplashScreen.hideAsync();
    }
  }, [loaded, checkAuth]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  // Redirect to the correct tab group based on role
  useEffect(() => {
    if (user?.role === 'DRIVE') {
      router.replace('/(drivertabs)');
    } else if (user?.role === 'QUEUE_REGULATOR') {
      router.replace('/(regulatortabs)');
    }
    // PASSENGER and others stay in (tabs)
  }, [user, router]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(drivertabs)" />
        <Stack.Screen name="(regulatortabs)" />
        <Stack.Screen 
          name="bus/[id]" 
          options={{ 
            headerShown: false, 
          }} 
        />
        <Stack.Screen 
          name="stop/[id]" 
          options={{ 
            headerShown: false, 
          }} 
        />
        <Stack.Screen 
          name="route/[id]" 
          options={{ 
            headerShown: false, 
          }} 
        />
        <Stack.Screen 
          name="alert/[id]" 
          options={{ 
            headerShown: false, 
          }} 
        />
        <Stack.Screen 
          name="feedback" 
          options={{ 
            headerShown: false, 
          }} 
        />
        <Stack.Screen 
          name="notification-settings" 
          options={{ 
            headerShown: false, 
          }} 
        />
        <Stack.Screen 
          name="favorite-stops" 
          options={{ 
            headerShown: false, 
          }} 
        />
        <Stack.Screen 
          name="favorite-routes" 
          options={{ 
            headerShown: false, 
          }} 
        />
        <Stack.Screen 
          name="language-settings" 
          options={{ 
            headerShown: false, 
          }} 
        />
        <Stack.Screen 
          name="help-center" 
          options={{ 
            headerShown: false, 
          }} 
        />
      </Stack>
    </>
  );
}