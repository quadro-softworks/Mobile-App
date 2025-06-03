import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useBusStore } from '@/stores/busStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function BusDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedBus, fetchBusById, isLoading, error } = useBusStore();
  
  useEffect(() => {
    if (id) {
      fetchBusById(id);
    }
  }, [id, fetchBusById]);
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={[styles.centeredContainer, styles.contentContainerPadded]}>
          <Text style={styles.loadingText}>Loading bus details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={[styles.centeredContainer, styles.contentContainerPadded]}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!selectedBus) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={[styles.centeredContainer, styles.contentContainerPadded]}>
          <Text style={styles.errorText}>Bus not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const getStatusVariant = (): 'success' | 'warning' | 'error' | 'primary' => {
    switch (selectedBus.status) {
      case 'on-time':
        return 'success';
      case 'early':
        return 'primary';
      case 'delayed':
        return 'error';
      default:
        return 'success';
    }
  };
  
  const getCapacityVariant = (): 'success' | 'warning' | 'error' => {
    switch (selectedBus.capacity) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'success';
    }
  };
  
  const getStatusText = (): string => {
    switch (selectedBus.status) {
      case 'on-time':
        return 'On Time';
      case 'early':
        return 'Early';
      case 'delayed':
        return 'Delayed';
      default:
        return 'Unknown';
    }
  };
  
  const getCapacityText = (): string => {
    switch (selectedBus.capacity) {
      case 'low':
        return 'Low Capacity';
      case 'medium':
        return 'Medium Capacity';
      case 'high':
        return 'High Capacity';
      default:
        return 'Unknown';
    }
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.contentContainerPadded}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.busName}>{selectedBus.name}</Text>
          <Badge 
            text={getStatusText()} 
            variant={getStatusVariant()} 
            size="md"
          />
        </View>
        
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>Bus Location Map</Text>
          <Text style={styles.coordinates}>
            {selectedBus.coordinates.latitude.toFixed(6)}, {selectedBus.coordinates.longitude.toFixed(6)}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Information</Text>
          <Card>
            <View style={styles.routeHeader}>
              <Text style={styles.routeName}>{selectedBus.routeName}</Text>
              <Ionicons name="git-branch" size={20} color={colors.primary} />
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="location-sharp" size={16} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>Next Stop</Text>
                <Text style={styles.infoValue}>{selectedBus.nextStop}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>ETA</Text>
                <Text style={styles.infoValue}>
                  {selectedBus.eta === 0 ? 'Arriving' : `${selectedBus.eta} min`}
                </Text>
              </View>
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <Card>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Status</Text>
                <Badge 
                  text={getStatusText()} 
                  variant={getStatusVariant()} 
                  size="sm"
                />
              </View>
              
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Capacity</Text>
                <Badge 
                  text={getCapacityText()} 
                  variant={getCapacityVariant()} 
                  size="sm"
                />
              </View>
            </View>
            
            <View style={styles.updateInfo}>
              <Ionicons name="information-circle" size={14} color={colors.textSecondary} />
              <Text style={styles.updateText}>
                Last updated: {formatDate(selectedBus.lastUpdated)}
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  busName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: colors.card,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  coordinates: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
});