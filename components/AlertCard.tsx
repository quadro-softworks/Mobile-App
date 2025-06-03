import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/types';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface AlertCardProps {
  alert: Alert;
  onPress: (alert: Alert) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress }) => {
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => onPress(alert)}
      style={[styles.container, alert.read ? null : styles.unread]}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons 
              name="alert-circle"
              size={18}
              color={
                getAlertVariant() === 'error' 
                  ? colors.error 
                  : getAlertVariant() === 'warning' 
                    ? colors.warning 
                    : colors.primary
              }
            />
            <Text style={styles.title}>{alert.title}</Text>
          </View>
          <Badge 
            text={getAlertTypeText()} 
            variant={getAlertVariant()} 
            size="sm"
          />
        </View>
        
        <Text style={styles.message}>{alert.message}</Text>
        
        {alert.routeName && (
          <View style={styles.routeContainer}>
            <Text style={styles.routeLabel}>Route:</Text>
            <Text style={styles.routeName}>{alert.routeName}</Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.time}>{formatDate(alert.createdAt)}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: 16,
  },
  card: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  routeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  routeName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});