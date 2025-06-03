import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { BusStop } from '@/types';
import { colors } from '@/constants/colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';

interface StopCardProps {
  stop: BusStop;
  onPress: (stop: BusStop) => void;
  showFavoriteButton?: boolean;
}

export const StopCard: React.FC<StopCardProps> = ({ 
  stop, 
  onPress,
  showFavoriteButton = false
}) => {
  const { user, updateProfile } = useAuthStore();
  const [isFavorite, setIsFavorite] = React.useState(false);
  
  React.useEffect(() => {
    if (user && showFavoriteButton) {
      const favorites = user.favoriteStops || [];
      setIsFavorite(favorites.includes(stop.id));
    }
  }, [user, stop.id, showFavoriteButton]);
  
  const toggleFavorite = async (e: any) => {
    e.stopPropagation();
    if (!user) return;
    
    try {
      const favorites = [...(user.favoriteStops || [])];
      
      if (isFavorite) {
        // Remove from favorites
        const updatedFavorites = favorites.filter(id => id !== stop.id);
        await updateProfile({ favoriteStops: updatedFavorites });
      } else {
        // Add to favorites
        favorites.push(stop.id);
        await updateProfile({ favoriteStops: favorites });
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };
  
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(stop)}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.stopName}>{stop.name}</Text>
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
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="location-sharp" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {stop.coordinates.latitude.toFixed(6)}, {stop.coordinates.longitude.toFixed(6)}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="bus" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {stop.routes.length} {stop.routes.length === 1 ? 'route' : 'routes'}
            </Text>
          </View>
        </View>
        
        {stop.routes.length > 0 && (
          <View style={styles.routesContainer}>
            {stop.routes.map((route, index) => (
              <View key={index} style={styles.routeTag}>
                <Text style={styles.routeText}>{route}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
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
  favoriteButton: {
    padding: 4,
  },
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