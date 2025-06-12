import React, { useState, useEffect } from 'react';
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
import { colors } from '@/constants/colors';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationItem } from '@/components/NotificationItem';
import { Notification } from '@/types';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ChatModal } from '@/components/ChatModal';
import { useWebSocketNotifications } from '@/hooks/useWebSocketNotifications';
import { WebSocketNotification } from '@/utils/socket';

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const { notifications, fetchNotifications, markNotificationAsRead, isLoading } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // WebSocket notifications
  const { isConnected, connectionStatus, sendChatMessage, sendIncidentReport } = useWebSocketNotifications({
    onNotificationReceived: (notification: WebSocketNotification) => {
      console.log('🔔 Driver received notification:', notification.title);
      // Could show a toast notification here if desired
    },
    onChatMessageReceived: (message: WebSocketNotification) => {
      console.log('💬 Driver received chat message:', message.title);
      // Could show a chat notification here if desired
    },
    onIncidentReported: (incident: WebSocketNotification) => {
      console.log('🚨 Driver received incident report:', incident.title);
      // Could show an incident alert here if desired
    },
    autoRefreshNotifications: true
  });

  // Real-time status display
  const getRealTimeStatus = () => {
    if (isConnected) return 'Connected';
    if (connectionStatus === 'connecting') return 'Connecting';
    return 'Disconnected';
  };

  const getRealTimeColor = () => {
    if (isConnected) return colors.success;
    if (connectionStatus === 'connecting') return colors.warning;
    return colors.error;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

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
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadNotificationsCount > 0 ? `${unreadNotificationsCount} unread notifications` : 'All notifications read'}
          </Text>
          <Text style={[styles.connectionStatus, { color: getRealTimeColor() }]}>
            📡 Real-time: {getRealTimeStatus()}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content List */}
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={handleNotificationPress} />
        )}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        contentContainerStyle={styles.notificationsContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
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

      {/* Floating Action Button for Chat */}
      <FloatingActionButton
        onPress={() => setIsChatModalVisible(true)}
        icon="chatbubbles"
      />

      {/* Chat Modal */}
      <ChatModal
        visible={isChatModalVisible}
        onClose={() => setIsChatModalVisible(false)}
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
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
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
  connectionStatus: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
