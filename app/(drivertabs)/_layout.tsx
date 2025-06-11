import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useBusStore } from '@/stores/busStore';
import { useAlertStore } from '@/stores/alertStore';
import { colors } from '@/constants/colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';

export default function DriverTabs() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const setupBusWebSocketListeners = useBusStore((state) => state.setupWebSocketListeners);
  const setupAlertWebSocketListeners = useAlertStore((state) => state.setupWebSocketListeners);

  useEffect(() => {
    if (user) {
      // Setup WebSocket listeners for real-time updates
      const unsubscribeBus = setupBusWebSocketListeners();
      const unsubscribeAlert = setupAlertWebSocketListeners();

      return () => {
        unsubscribeBus();
        unsubscribeAlert();
      };
    }
  }, [user, setupBusWebSocketListeners, setupAlertWebSocketListeners]);

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
          title: t('driver.dashboard'),
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: t('driver.report'),
          tabBarIcon: ({ color, size }) => <MaterialIcons name="report" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('driver.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
