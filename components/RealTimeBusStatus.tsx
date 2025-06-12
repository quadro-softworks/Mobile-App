import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { useRealTimeBuses } from '@/hooks/useRealTimeBuses';

export const RealTimeBusStatus: React.FC = () => {
  const { 
    buses, 
    isConnected, 
    connectionStatus, 
    isUsingFallback 
  } = useRealTimeBuses();

  const getStatusColor = () => {
    if (isConnected) return '#10B981'; // Green
    if (isUsingFallback) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getStatusText = () => {
    if (isConnected) return 'Real-time Connected';
    if (isUsingFallback) return 'Using Fallback Data';
    return 'Disconnected';
  };

  const realTimeBusCount = buses.filter(bus => (bus as any).isRealTime).length;

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{buses.length}</Text>
          <Text style={styles.statLabel}>Total Buses</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{realTimeBusCount}</Text>
          <Text style={styles.statLabel}>Live Tracking</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{connectionStatus}</Text>
          <Text style={styles.statLabel}>Status</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
