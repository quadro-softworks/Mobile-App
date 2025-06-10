import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, SafeAreaView, Platform, SectionList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAlertStore } from '@/stores/alertStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { AlertCard } from '@/components/AlertCard';
import { NotificationItem } from '@/components/NotificationItem';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Notification } from '@/types';

export default function AlertsScreen() {
  const router = useRouter();
  const { alerts, fetchAlerts, markAlertAsRead, isLoading: alertsLoading } = useAlertStore();
  const { notifications, fetchNotifications, markNotificationAsRead, isLoading: notificationsLoading } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<'alerts' | 'notifications'>('alerts');

  useEffect(() => {
    fetchAlerts();
    fetchNotifications();
  }, [fetchAlerts, fetchNotifications]);
  
  const handleAlertPress = (alert: Alert) => {
    // Mark alert as read when opened
    if (!alert.read) {
      markAlertAsRead(alert.id);
    }
    router.push(`/alert/${alert.id}`);
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read && !notification.is_read) {
      markNotificationAsRead(notification.id);
    }
  };

  const handleCreateAlert = () => {
    // Navigate to create alert screen
    // This would be implemented in a real app
    alert('Create alert functionality would be implemented here');
  };

  const unreadAlertsCount = alerts.filter(alert => !alert.read).length;
  const unreadNotificationsCount = notifications.filter(notification => !notification.read && !notification.is_read).length;
  
  const currentData = activeTab === 'alerts' ? alerts : notifications;
  const currentLoading = activeTab === 'alerts' ? alertsLoading : notificationsLoading;
  const currentUnreadCount = activeTab === 'alerts' ? unreadAlertsCount : unreadNotificationsCount;

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.contentContainerPadded}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Alerts & Notifications</Text>
            <Text style={styles.subtitle}>
              {currentUnreadCount > 0
                ? `You have ${currentUnreadCount} unread ${activeTab}`
                : `Stay updated with ${activeTab}`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateAlert}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={colors.card} />
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'alerts' && styles.activeTab]}
            onPress={() => setActiveTab('alerts')}
          >
            <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>
              Alerts {unreadAlertsCount > 0 && `(${unreadAlertsCount})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
            onPress={() => setActiveTab('notifications')}
          >
            <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
              Notifications {unreadNotificationsCount > 0 && `(${unreadNotificationsCount})`}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            activeTab === 'alerts'
              ? <AlertCard alert={item as Alert} onPress={handleAlertPress} />
              : <NotificationItem notification={item as Notification} onPress={handleNotificationPress} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {currentLoading
                  ? `Loading ${activeTab}...`
                  : `No ${activeTab} available`}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainerPadded: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 20 : 34,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.card,
  },
});