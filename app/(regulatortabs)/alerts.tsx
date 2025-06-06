import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

interface AlertItem {
  id: string;
  type: 'system' | 'route' | 'emergency' | 'maintenance' | 'event';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  requiresAcknowledgement: boolean;
  acknowledged: boolean;
  location?: string;
  affectedRoutes?: string[];
}

export default function AlertsScreen() {
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock alerts data
  const mockAlerts: AlertItem[] = [
    {
      id: '1',
      type: 'emergency',
      title: 'Emergency Alert',
      message: 'Medical emergency reported at Stadium stop. Emergency services dispatched.',
      priority: 'critical',
      timestamp: '2024-01-15T11:30:00Z',
      read: false,
      requiresAcknowledgement: true,
      acknowledged: false,
      location: 'Stadium Bus Stop',
      affectedRoutes: ['R12', 'R15'],
    },
    {
      id: '2',
      type: 'route',
      title: 'Route Delay',
      message: 'System-wide delay on Route R12 due to traffic congestion on Churchill Avenue. Expected delay: 15-20 minutes.',
      priority: 'high',
      timestamp: '2024-01-15T10:45:00Z',
      read: false,
      requiresAcknowledgement: true,
      acknowledged: false,
      affectedRoutes: ['R12'],
    },
    {
      id: '3',
      type: 'event',
      title: 'High Passenger Volume',
      message: 'Expect high passenger volume due to football match at Stadium. Additional buses deployed.',
      priority: 'medium',
      timestamp: '2024-01-15T09:30:00Z',
      read: true,
      requiresAcknowledgement: false,
      acknowledged: false,
      location: 'Stadium Area',
      affectedRoutes: ['R12', 'R15', 'R18'],
    },
    {
      id: '4',
      type: 'maintenance',
      title: 'Stop Maintenance',
      message: 'Scheduled maintenance at Mercato stop tomorrow 6:00 AM - 8:00 AM. Temporary stop relocation.',
      priority: 'medium',
      timestamp: '2024-01-15T08:15:00Z',
      read: true,
      requiresAcknowledgement: false,
      acknowledged: false,
      location: 'Mercato Bus Stop',
      affectedRoutes: ['R12', 'R20'],
    },
    {
      id: '5',
      type: 'system',
      title: 'System Update',
      message: 'Bus tracking system will undergo maintenance tonight 11:00 PM - 2:00 AM. Limited real-time updates.',
      priority: 'low',
      timestamp: '2024-01-14T16:00:00Z',
      read: true,
      requiresAcknowledgement: false,
      acknowledged: false,
    },
  ];

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      Alert.alert('Error', 'Failed to load alerts');
    } finally {
      setRefreshing(false);
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true, read: true } : alert
      )
    );
    Alert.alert('Acknowledged', 'Alert has been acknowledged and sent to control center.');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#DC2626'; // Red-600
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return 'medical';
      case 'route': return 'map';
      case 'event': return 'calendar';
      case 'maintenance': return 'construct';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderAlert = ({ item }: { item: AlertItem }) => (
    <View style={[
      styles.alertCard,
      !item.read && styles.unreadAlert,
      item.priority === 'critical' && styles.criticalAlert
    ]}>
      <TouchableOpacity onPress={() => markAsRead(item.id)}>
        <View style={styles.alertHeader}>
          <View style={styles.alertInfo}>
            <Ionicons
              name={getAlertIcon(item.type)}
              size={20}
              color={item.priority === 'critical' ? '#DC2626' : colors.primary}
              style={styles.alertIcon}
            />
            <View style={styles.alertTitleContainer}>
              <Text style={[
                styles.alertTitle,
                item.priority === 'critical' && styles.criticalTitle
              ]}>
                {item.title}
              </Text>
              <View style={styles.alertMeta}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                  <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
                </View>
                <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
              </View>
            </View>
          </View>
          {!item.read && <View style={styles.unreadIndicator} />}
        </View>

        <Text style={[
          styles.alertMessage,
          item.priority === 'critical' && styles.criticalMessage
        ]}>
          {item.message}
        </Text>

        {item.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color={colors.textSecondary} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}

        {item.affectedRoutes && item.affectedRoutes.length > 0 && (
          <View style={styles.routesContainer}>
            <Text style={styles.routesLabel}>Affected Routes:</Text>
            <View style={styles.routesList}>
              {item.affectedRoutes.map((route, index) => (
                <View key={index} style={styles.routeBadge}>
                  <Text style={styles.routeText}>{route}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Acknowledgement Button */}
      {item.requiresAcknowledgement && !item.acknowledged && (
        <TouchableOpacity 
          style={styles.acknowledgeButton}
          onPress={() => acknowledgeAlert(item.id)}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.card} />
          <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
        </TouchableOpacity>
      )}

      {item.acknowledged && (
        <View style={styles.acknowledgedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.acknowledgedText}>Acknowledged</Text>
        </View>
      )}
    </View>
  );

  const unreadCount = alerts.filter(alert => !alert.read).length;
  const criticalCount = alerts.filter(alert => alert.priority === 'critical' && !alert.read).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All alerts read'}
            {criticalCount > 0 && ` • ${criticalCount} critical`}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchAlerts}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Alerts List */}
      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        style={styles.alertsList}
        contentContainerStyle={styles.alertsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchAlerts} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No alerts</Text>
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
  alertCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  unreadAlert: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  criticalAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  alertIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  criticalTitle: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.card,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  criticalMessage: {
    fontWeight: '600',
    color: '#DC2626',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  routesContainer: {
    marginBottom: 8,
  },
  routesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  routesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  routeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  routeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.card,
  },
  acknowledgeButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 12,
    borderRadius: 8,
    gap: 8,
  },
  acknowledgeButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  acknowledgedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
    gap: 4,
  },
  acknowledgedText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '500',
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
