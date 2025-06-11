import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useBusStore } from '@/stores/busStore';
import { useAlertStore } from '@/stores/alertStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { colors } from '@/constants/colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';

export default function TabLayout() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const setupBusWebSocketListeners = useBusStore((state) => state.setupWebSocketListeners);
  const setupAlertWebSocketListeners = useAlertStore((state) => state.setupWebSocketListeners);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  
  useEffect(() => {
    if (user) {
      // Setup WebSocket listeners
      const unsubscribeBus = setupBusWebSocketListeners();
      const unsubscribeAlert = setupAlertWebSocketListeners();
      
      // Fetch initial notifications
      fetchNotifications();
      
      return () => {
        unsubscribeBus();
        unsubscribeAlert();
      };
    }
  }, [user, setupBusWebSocketListeners, setupAlertWebSocketListeners, fetchNotifications]);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.card,
          height: 70,
          paddingTop: 12,
          paddingBottom: 28,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.map'),
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stops"
        options={{
          title: t('navigation.stops'),
          tabBarIcon: ({ color, size }) => <Ionicons name="location-sharp" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: t('navigation.tickets'),
          tabBarIcon: ({ color, size }) => <FontAwesome name="ticket" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t('navigation.alerts'),
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}