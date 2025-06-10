import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, SafeAreaView, Platform } from 'react-native'; // Added SafeAreaView, Platform
import { Stack, useRouter } from 'expo-router';
import { useNotificationStore } from '@/stores/notificationStore';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { NotificationItem } from '@/components/NotificationItem';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import { Notification } from '@/types';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { notifications, fetchNotifications, markNotificationAsRead, markAllAsRead, isLoading } = useNotificationStore();
  const { user, updateNotificationSettings } = useAuthStore();
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  const handleClose = () => {
    router.back();
  };
  
  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read && !notification.is_read) {
      markNotificationAsRead(notification.id);
    }
  };
  
  const toggleAlertType = async (type: string, enabled: boolean) => {
    if (!user) return;
    
    const currentTypes = [...(user.notificationSettings.alertTypes || [])];
    let newTypes;
    
    if (enabled && !currentTypes.includes(type)) {
      newTypes = [...currentTypes, type];
    } else if (!enabled && currentTypes.includes(type)) {
      newTypes = currentTypes.filter(t => t !== type);
    } else {
      return; // No change needed
    }
    
    await updateNotificationSettings({
      alertTypes: newTypes,
    });
  };
  
  const isAlertTypeEnabled = (type: string): boolean => {
    return user?.notificationSettings?.alertTypes?.includes(type) || false;
  };
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}> {/* Use SafeAreaView */}
      <Stack.Screen 
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} /> {/* Use Ionicons close icon */}
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.contentContainerPadded} showsVerticalScrollIndicator={false}> {/* Apply padding here */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Types</Text>
          <Card>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Delays</Text>
              <Switch
                value={isAlertTypeEnabled('delay')}
                onValueChange={(value) => toggleAlertType('delay', value)}
                trackColor={{ false: colors.inactive, true: colors.primary }}
                thumbColor={colors.card}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Route Changes</Text>
              <Switch
                value={isAlertTypeEnabled('route-change')}
                onValueChange={(value) => toggleAlertType('route-change', value)}
                trackColor={{ false: colors.inactive, true: colors.primary }}
                thumbColor={colors.card}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Service Disruptions</Text>
              <Switch
                value={isAlertTypeEnabled('service-disruption')}
                onValueChange={(value) => toggleAlertType('service-disruption', value)}
                trackColor={{ false: colors.inactive, true: colors.primary }}
                thumbColor={colors.card}
              />
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            {notifications.length > 0 && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={markAllAsRead}
              >
                <Text style={styles.markAllText}>Mark All Read</Text>
              </TouchableOpacity>
            )}
          </View>

          {notifications.length > 0 ? (
            <Card style={styles.notificationsCard}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onPress={handleNotificationPress}
                />
              ))}
            </Card>
          ) : (
            <Card>
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {isLoading
                    ? 'Loading notifications...'
                    : 'No notifications available'}
                </Text>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: { // New style for SafeAreaView
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainerPadded: { // New style for padding content
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 20 : 0, // Adjusted paddingTop for Android, 0 for iOS as SafeAreaView handles it
    paddingHorizontal: 20,
    paddingBottom: 20, // Add paddingBottom
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // paddingHorizontal: 20, // Removed, handled by contentContainerPadded
    // marginTop: 20, // Removed, handled by contentContainerPadded
  },
  closeButton: {
    padding: 8,
  },
  section: {
    // paddingHorizontal: 20, // Removed, handled by contentContainerPadded
    // marginTop: 20, // Removed, handled by contentContainerPadded
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  notificationsCard: {
    padding: 0,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 14,
    color: colors.card,
    fontWeight: '500',
  },
});