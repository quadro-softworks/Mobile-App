import React, { useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAlertStore } from '@/stores/alertStore';
import { AlertCard } from '@/components/AlertCard';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from '@/types';

export default function AlertsScreen() {
  const router = useRouter();
  const { alerts, fetchAlerts, markAlertAsRead, isLoading } = useAlertStore();
  
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);
  
  const handleAlertPress = (alert: Alert) => {
    // Mark alert as read when opened
    if (!alert.read) {
      markAlertAsRead(alert.id);
    }
    router.push(`/alert/${alert.id}`);
  };
  
  const handleCreateAlert = () => {
    // Navigate to create alert screen
    // This would be implemented in a real app
    alert('Create alert functionality would be implemented here');
  };
  
  const unreadCount = alerts.filter(alert => !alert.read).length;
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.contentContainerPadded}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Alerts</Text>
            <Text style={styles.subtitle}>
              {unreadCount > 0 
                ? `You have ${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` 
                : 'Stay updated with service alerts'}
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
        
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertCard alert={item} onPress={handleAlertPress} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading 
                  ? 'Loading alerts...' 
                  : 'No alerts available'}
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
});