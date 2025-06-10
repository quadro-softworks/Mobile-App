import React, { useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationItem } from '@/components/NotificationItem';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@/types';

export default function AlertsScreen() {
  const { notifications, fetchNotifications, markNotificationAsRead, markAllAsRead, isLoading } = useNotificationStore();

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
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.contentContainerPadded}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              {unreadNotificationsCount > 0
                ? `You have ${unreadNotificationsCount} unread notifications`
                : 'Stay updated with notifications'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
            activeOpacity={0.7}
            disabled={notifications.length === 0}
          >
            <Ionicons name="checkmark-done" size={20} color={notifications.length === 0 ? colors.textSecondary : colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem notification={item} onPress={handleNotificationPress} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading
                  ? 'Loading notifications...'
                  : 'No notifications available'}
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
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
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
});