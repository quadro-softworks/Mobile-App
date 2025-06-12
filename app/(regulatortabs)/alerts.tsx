import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { colors } from '@/constants/colors';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationItem } from '@/components/NotificationItem';
import { Notification } from '@/types';
import { useAuthStore } from '@/stores/authStore';

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { notifications, fetchNotifications, markNotificationAsRead, isLoading } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read && !notification.is_read) {
      markNotificationAsRead(notification.id);
    }
  };

  const unreadNotificationsCount = notifications.filter(notification => !notification.read && !notification.is_read).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('notifications.title')}</Text>
          <Text style={styles.subtitle}>
            {unreadNotificationsCount > 0
              ? `${unreadNotificationsCount} unread notifications`
              : 'All notifications read'
            }
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={() => fetchNotifications()}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={handleNotificationPress} />
        )}
        keyExtractor={(item) => item.id}
        style={styles.alertsList}
        contentContainerStyle={styles.alertsContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchNotifications}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  refreshButton: {
    padding: 8,
  },
  alertsList: {
    flex: 1,
  },
  alertsContent: {
    padding: 16,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },

});
