import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAlertStore } from '@/stores/alertStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert } from '@/types';

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { alerts, markAlertAsRead, deleteAlert } = useAlertStore();
  const [alert, setAlert] = useState<Alert | null>(null);
  
  useEffect(() => {
    if (id && alerts.length > 0) {
      const foundAlert = alerts.find(a => a.id === id);
      if (foundAlert) {
        setAlert(foundAlert);
        
        // Mark as read if not already
        if (!foundAlert.read) {
          markAlertAsRead(id);
        }
      }
    }
  }, [id, alerts, markAlertAsRead]);
  
  const handleDeleteAlert = async () => {
    if (id) {
      await deleteAlert(id);
      // Go back after deletion
      // In a real app, we would use router.back()
    }
  };
  
  if (!alert) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={[styles.centeredContainer, styles.contentContainerPadded]}>
          <Text style={styles.loadingText}>Loading alert details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const getAlertVariant = (): 'primary' | 'warning' | 'error' => {
    switch (alert.type) {
      case 'delay':
        return 'warning';
      case 'route-change':
        return 'primary';
      case 'service-disruption':
        return 'error';
      default:
        return 'primary';
    }
  };
  
  const getAlertTypeText = (): string => {
    switch (alert.type) {
      case 'delay':
        return 'Delay';
      case 'route-change':
        return 'Route Change';
      case 'service-disruption':
        return 'Disruption';
      default:
        return 'Alert';
    }
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.contentContainerPadded}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="alert-circle" size={24} color={
              getAlertVariant() === 'error' 
                ? colors.error 
                : getAlertVariant() === 'warning' 
                  ? colors.warning 
                  : colors.primary
            } />
            <Text style={styles.title}>{alert.title}</Text>
          </View>
          <Badge 
            text={getAlertTypeText()} 
            variant={getAlertVariant()} 
          />
        </View>
        
        <View style={styles.section}>
          <Card>
            <Text style={styles.message}>{alert.message}</Text>
            
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.time}>{formatDate(alert.createdAt)}</Text>
            </View>
          </Card>
        </View>
        
        {alert.routeName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Affected Route</Text>
            <Card>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="bus" size={20} color={colors.primary} />
                <Text style={styles.detailLabel}>Route:</Text>
                <Text style={styles.detailValue}>{alert.routeName}</Text>
              </View>
            </Card>
          </View>
        )}
        
        {alert.busId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Affected Bus</Text>
            <Card>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="bus" size={20} color={colors.secondary} />
                <Text style={styles.detailLabel}>Bus ID:</Text>
                <Text style={styles.detailValue}>{alert.busId}</Text>
              </View>
            </Card>
          </View>
        )}
        
        {alert.stopId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Affected Stop</Text>
            <Card>
              <View style={styles.detailItem}>
                <Ionicons name="map-marker" size={20} color={colors.error} />
                <Text style={styles.detailLabel}>Stop ID:</Text>
                <Text style={styles.detailValue}>{alert.stopId}</Text>
              </View>
            </Card>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <Button
            title="Delete Alert"
            onPress={handleDeleteAlert}
            variant="outline"
            style={styles.deleteButton}
          />
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
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
  message: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    width: 80,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  buttonContainer: {
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: colors.error,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});