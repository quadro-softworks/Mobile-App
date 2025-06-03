import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bus } from '@/types';
import { colors } from '@/constants/colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';

interface BusCardProps {
  bus: Bus;
  onPress: (bus: Bus) => void;
  showFavoriteButton?: boolean;
}

export const BusCard: React.FC<BusCardProps> = ({ 
  bus, 
  onPress,
  showFavoriteButton = false
}) => {
  const { user, updateProfile } = useAuthStore();
  const [isFavorite, setIsFavorite] = React.useState(false);
  
  React.useEffect(() => {
    if (user && showFavoriteButton) {
      const favorites = user.favoriteRoutes || [];
      setIsFavorite(favorites.includes(bus.routeId));
    }
  }, [user, bus.routeId, showFavoriteButton]);
  
  const toggleFavorite = async (e: any) => {
    e.stopPropagation();
    if (!user) return;
    
    try {
      const favorites = [...(user.favoriteRoutes || [])];
      
      if (isFavorite) {
        // Remove from favorites
        const updatedFavorites = favorites.filter(id => id !== bus.routeId);
        await updateProfile({ favoriteRoutes: updatedFavorites });
      } else {
        // Add to favorites
        favorites.push(bus.routeId);
        await updateProfile({ favoriteRoutes: favorites });
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };
  
  const getStatusVariant = (): 'success' | 'warning' | 'error' => {
    switch (bus.status) {
      case 'on-time':
        return 'success';
      case 'early':
        return 'warning';
      case 'delayed':
        return 'error';
      default:
        return 'success';
    }
  };

  const getCapacityVariant = (): 'success' | 'warning' | 'error' => {
    switch (bus.capacity) {
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

  const getCapacityText = (): string => {
    switch (bus.capacity) {
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

  const getStatusText = (): string => {
    switch (bus.status) {
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

  return (
    <Pressable 
      onPress={() => onPress(bus)}
      style={({ pressed }) => [
        pressed ? { opacity: 0.9, transform: [{ scale: 0.98 }] } : {}
      ]}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.busName}>{bus.name}</Text>
            <Text style={styles.routeName}>{bus.routeName}</Text>
          </View>
          <View style={styles.headerRight}>
            {showFavoriteButton && (
              <TouchableOpacity 
                onPress={toggleFavorite}
                style={styles.favoriteButton}
                activeOpacity={0.7}
              >
                <FontAwesome 
                  name={isFavorite ? 'heart' : 'heart-o'}
                  size={20}
                  color={isFavorite ? colors.error : colors.textSecondary}
                />
              </TouchableOpacity>
            )}
            <Badge 
              text={getStatusText()} 
              variant={getStatusVariant()} 
            />
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="location-sharp" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>Next: {bus.nextStop}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              ETA: {bus.eta === 0 ? 'Arriving' : `${bus.eta} min`}
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Badge 
            text={getCapacityText()} 
            variant={getCapacityVariant()} 
            size="sm"
          />
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  routeName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  favoriteButton: {
    marginRight: 12,
    padding: 4,
  },
  infoContainer: {
    marginBottom: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});