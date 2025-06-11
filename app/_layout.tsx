import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/stores/authStore";

import { useRouter } from 'expo-router';

export const unstable_settings = {
  initialRouteName: "(auth)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });



  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Don't call checkAuth here - let the navigation logic handle it
      // after the store is hydrated
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();
  const hasNavigated = useRef(false);
  const navigationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Handle authentication and role-based navigation
  useEffect(() => {
    console.log('Navigation check:', {
      isLoading,
      hasHydrated,
      user: user?.role,
      hasToken: !!token,
      hasNavigated: hasNavigated.current
    });

    // Wait for both loading to finish AND store to be hydrated
    // Also prevent multiple navigation calls
    if (!isLoading && hasHydrated && !hasNavigated.current) {
      // Clear any existing navigation timeout
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }

      // Debounce navigation to prevent double-clicks
      navigationTimeout.current = setTimeout(() => {
        if (hasNavigated.current) {
          console.log('⚠️ Navigation already completed, skipping');
          return;
        }

        hasNavigated.current = true;
        console.log('🚀 Executing navigation...');

        if (!user || !token) {
          // No user or token, redirect to login
          console.log('Redirecting to login - no user or token');
          router.replace('/(auth)/login');
        } else {
          // User is authenticated, redirect based on role
          console.log('User authenticated, role:', user.role);
          if (user.role === 'BUS_DRIVER' || user.role === 'DRIVE') {
            console.log('Redirecting to driver tabs');
            router.replace('/(drivertabs)');
          } else if (user.role === 'QUEUE_REGULATOR') {
            console.log('Redirecting to regulator tabs');
            router.replace('/(regulatortabs)');
          } else {
            // PASSENGER and others go to main tabs
            console.log('Redirecting to main tabs');
            router.replace('/(tabs)');
          }
        }
      }, 100); // 100ms debounce
    }

    // Cleanup timeout on unmount
    return () => {
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }
    };
  }, [user, token, isLoading, hasHydrated, router]);

  // Reset navigation flag only when user logs out (token becomes null)
  useEffect(() => {
    if (!token) {
      console.log('🔄 Token cleared - resetting navigation flag for logout');
      hasNavigated.current = false;
    }
  }, [token]);

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