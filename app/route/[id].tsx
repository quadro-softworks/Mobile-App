import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBusStore } from '@/stores/busStore';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { BusCard } from '@/components/BusCard';
import { colors } from '@/constants/colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Bus } from '@/types';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedRoute, fetchRouteById, buses, fetchBuses, isLoading, error } = useBusStore();
  const { user, updateProfile } = useAuthStore();
  const [routeBuses, setRouteBuses] = useState<Bus[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchRouteById(id);
      fetchBuses();
    }
  }, [id, fetchRouteById, fetchBuses]);
  
  useEffect(() => {
    if (selectedRoute && buses.length > 0) {
      const filteredBuses = buses.filter(bus => bus.routeId === selectedRoute.id);
      setRouteBuses(filteredBuses);
    }
  }, [selectedRoute, buses]);
  
  useEffect(() => {
    if (user && selectedRoute) {
      const favorites = user.favoriteRoutes || [];
      setIsFavorite(favorites.includes(selectedRoute.id));
    }
  }, [user, selectedRoute]);
  
  const handleBusPress = (bus: Bus) => {
    router.push(`/bus/${bus.id}`);
  };
  
  const toggleFavorite = async () => {
    if (!user || !selectedRoute) return;
    
    try {
      const favorites = [...(user.favoriteRoutes || [])];
      
      if (isFavorite) {
        // Remove from favorites
        const updatedFavorites = favorites.filter(id => id !== selectedRoute.id);
        await updateProfile({ favoriteRoutes: updatedFavorites });
      } else {
        // Add to favorites
        favorites.push(selectedRoute.id);
        await updateProfile({ favoriteRoutes: favorites });
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={[styles.centeredContainer, styles.contentContainerPadded]}>
          <Text style={styles.loadingText}>Loading route details...</Text>
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
  
  if (!selectedRoute) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={[styles.centeredContainer, styles.contentContainerPadded]}>
          <Text style={styles.errorText}>Route not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.contentContainerPadded}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.routeName}>{selectedRoute.name}</Text>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={toggleFavorite}
              activeOpacity={0.7}
            >
              <FontAwesome 
                name={isFavorite ? 'heart' : 'heart-o'}
                size={24}
                color={isFavorite ? colors.error : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.routeDescription}>{selectedRoute.description}</Text>
        </View>
        
        <View style={styles.section}>
          <Card style={[styles.routeInfoCard, { borderLeftColor: selectedRoute.color }]}>
            <View style={styles.routeInfoRow}>
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeInfoLabel}>From</Text>
                <Text style={styles.routeInfoValue}>{selectedRoute.startPoint}</Text>
              </View>
              <View style={styles.routeInfoItem}>
                <Text style={styles.routeInfoLabel}>To</Text>
                <Text style={styles.routeInfoValue}>{selectedRoute.endPoint}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.routeInfoRow}>
              <View style={styles.routeInfoItem}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.routeInfoText}>
                  Every {selectedRoute.frequency}
                </Text>
              </View>
              <View style={styles.routeInfoItem}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.routeInfoText}>
                  {selectedRoute.activeHours}
                </Text>
              </View>
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stops</Text>
          <Card>
            <View style={styles.stopsContainer}>
              {selectedRoute.stops.map((stop, index) => (
                <View key={index} style={styles.stopItem}>
                  <View style={styles.stopDot} />
                  <View style={styles.stopLine} />
                  <Text style={styles.stopName}>{stop}</Text>
                </View>
              ))}
              <View style={styles.stopItem}>
                <View style={styles.stopDot} />
                <Text style={styles.stopName}>{selectedRoute.stops[selectedRoute.stops.length - 1]}</Text>
              </View>
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Buses</Text>
          
          {routeBuses.length > 0 ? (
            <FlatList
              data={routeBuses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <BusCard bus={item} onPress={handleBusPress} />
              )}
              scrollEnabled={false}
            />
          ) : (
            <Card>
              <View style={styles.emptyBuses}>
                <Ionicons name="bus" size={24} color={colors.textSecondary} />
                <Text style={styles.emptyBusesText}>No active buses on this route</Text>
              </View>
            </Card>
          )}
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
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
  },
  routeDescription: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  routeInfoCard: {
    borderLeftWidth: 4,
  },
  routeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  routeInfoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  routeInfoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  stopsContainer: {
    paddingVertical: 8,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    position: 'relative',
  },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginRight: 12,
    marginTop: 4,
  },
  stopLine: {
    position: 'absolute',
    left: 5.5,
    top: 16,
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  stopName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  emptyBuses: {
    alignItems: 'center',
    padding: 24,
  },
  emptyBusesText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
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