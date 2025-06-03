import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Notification } from '@/types';
import { colors } from '@/constants/colors';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onPress 
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };
  
  const getIcon = () => {
    switch (notification.type) {
      case 'alert':
        return <Ionicons name="notifications" size={20} color={colors.primary} />;
      case 'info':
        return <Ionicons name="information-circle" size={20} color={colors.secondary} />;
      case 'promo':
        return <MaterialCommunityIcons name="gift-outline" size={20} color={colors.success} />;
      case 'system':
        return <Ionicons name="settings" size={20} color={colors.textSecondary} />;
      default:
        return <Ionicons name="notifications" size={20} color={colors.primary} />;
    }
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, notification.read ? null : styles.unread]} 
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.time}>{formatDate(notification.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unread: {
    backgroundColor: colors.highlight,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});