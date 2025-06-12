import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { BusStop } from '@/types';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
// import { FontAwesome } from '@expo/vector-icons'; // Removed - heart icon not used
// import { useAuthStore } from '@/stores/authStore'; // Removed - favorites not used

interface StopCardProps {
  stop: BusStop;
  showFavoriteButton?: boolean; // Kept for compatibility but not used
}

export const StopCard: React.FC<StopCardProps> = ({
  stop
}) => {
  // Removed favorite functionality as heart icon is not needed
  
  return (
    <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.stopName}>{stop.name}</Text>
          {/* Heart icon removed as requested */}
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="location-sharp" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {(stop.location?.latitude || stop.coordinates?.latitude || 0).toFixed(6)}, {(stop.location?.longitude || stop.coordinates?.longitude || 0).toFixed(6)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="people" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              Capacity: {stop.capacity || 'Unknown'}
            </Text>
          </View>

          {stop.routes && stop.routes.length > 0 && (
            <View style={styles.infoItem}>
              <Ionicons name="bus" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {stop.routes.length} {stop.routes.length === 1 ? 'route' : 'routes'}
              </Text>
            </View>
          )}

          <View style={styles.infoItem}>
            <Ionicons name={stop.is_active ? 'checkmark-circle' : 'close-circle'} size={16} color={stop.is_active ? colors.success : colors.error} />
            <Text style={[styles.infoText, { color: stop.is_active ? colors.success : colors.error }]}>
              {stop.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        
        {stop.routes && stop.routes.length > 0 && (
          <View style={styles.routesContainer}>
            {stop.routes.map((route, index) => (
              <View key={index} style={styles.routeTag}>
                <Text style={styles.routeText}>{route}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stopName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  // favoriteButton style removed - not needed anymore
  infoContainer: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  routesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  routeTag: {
    backgroundColor: colors.highlight,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  routeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});