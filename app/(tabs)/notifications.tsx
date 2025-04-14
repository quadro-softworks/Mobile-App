import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Define notification type
type NotificationType = 'arrival' | 'delay' | 'update' | 'general';

// Define iconography type
type NotificationIcon = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: readonly [string, string];
};

// Define notification interface
interface Notification {
  id: string;
  type: NotificationType;
  busName: string;
  driverName: string;
  fermata: string;
  eta: string;
  time: string;
  read: boolean;
}

// Mock notification data
const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'arrival',
    busName: 'Sheger Bus',
    driverName: 'Abebe Kebede',
    fermata: 'Mexico Square',
    eta: '2 minutes',
    time: '10:30 AM',
    read: false,
  },
  {
    id: '2',
    type: 'delay',
    busName: 'Anbessa Bus',
    driverName: 'Samuel Tefera',
    fermata: 'Mexico Square',
    eta: '15 minutes',
    time: '10:15 AM',
    read: false,
  },
  {
    id: '3',
    type: 'arrival',
    busName: 'Sheger Bus',
    driverName: 'Daniel Alemu',
    fermata: '4 Kilo',
    eta: '5 minutes',
    time: '9:45 AM',
    read: true,
  },
  {
    id: '4',
    type: 'update',
    busName: 'Alliance Bus',
    driverName: 'Haile Gebrselassie',
    fermata: 'Megenagna',
    eta: '7 minutes',
    time: '9:30 AM',
    read: true,
  },
];

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();

  // Get notification icon and color
  const getNotificationIcon = (type: NotificationType): NotificationIcon => {
    switch (type) {
      case 'arrival':
        return { 
          icon: 'bus', 
          color: '#4caf50',
          gradient: ['#4caf50', '#2e7d32'] as const
        };
      case 'delay':
        return { 
          icon: 'time', 
          color: '#f44336',
          gradient: ['#f44336', '#c62828'] as const
        };
      case 'update':
        return { 
          icon: 'refresh', 
          color: '#2196f3',
          gradient: ['#2196f3', '#1565c0'] as const
        };
      default:
        return { 
          icon: 'notifications', 
          color: '#757575',
          gradient: ['#757575', '#424242'] as const
        };
    }
  };

  // Simplified notification title
  const getNotificationTitle = (item: Notification): string => {
    switch (item.type) {
      case 'arrival':
        return `${item.busName} Arriving Soon`;
      case 'delay':
        return `${item.busName} Delayed`;
      case 'update':
        return `ETA Updated for ${item.busName}`;
      default:
        return 'Notification';
    }
  };

  // Render a notification item
  const renderItem = ({ item }: { item: Notification }) => {
    const { icon, gradient } = getNotificationIcon(item.type);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { borderLeftColor: getNotificationIcon(item.type).color }
        ]}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={gradient}
            style={styles.iconBackground}
          >
            <Ionicons name={icon} size={20} color="white" />
          </LinearGradient>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.topRow}>
            <Text style={styles.notificationTitle}>{getNotificationTitle(item)}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          
          <Text style={styles.routeText}>
            {item.fermata}
          </Text>
          
          <View style={styles.bottomRow}>
            <Text style={styles.etaText}>ETA: {item.eta}</Text>
            <Text style={styles.driverText}>{item.driverName}</Text>
          </View>
        </View>
        
        {!item.read && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <TouchableOpacity style={styles.optionsButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c242f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  optionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#28313f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 16,
    alignSelf: 'center',
  },
  iconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  routeText: {
    fontSize: 14,
    color: '#adb5bd',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  driverText: {
    fontSize: 13,
    color: '#adb5bd',
    fontStyle: 'italic',
  },
  timeText: {
    fontSize: 12,
    color: '#adb5bd',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0a7ea4',
    position: 'absolute',
    top: 16,
    right: 16,
  },
}); 