import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBusStore } from '@/stores/busStore';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { BusCard } from '@/components/BusCard';
import { colors } from '@/constants/colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Bus } from '@/types';

export default function StopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedStop, fetchBusStopById, isLoading, error } = useBusStore();
  const { user, updateProfile } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchBusStopById(id);
    }
  }, [id, fetchBusStopById]);
  
  useEffect(() => {
    if (user && selectedStop) {
      const favorites = user.favoriteStops || [];
      setIsFavorite(favorites.includes(selectedStop.id));
    }
  }, [user, selectedStop]);
  
  const handleBusPress = (bus: Bus) => {
    router.push(`/bus/${bus.id}`);
  };
  
  const toggleFavorite = async () => {
    if (!user || !selectedStop) return;
    
    try {
      const favorites = [...(user.favoriteStops || [])];
      
      if (isFavorite) {
        // Remove from favorites
        const updatedFavorites = favorites.filter(id => id !== selectedStop.id);
        await updateProfile({ favoriteStops: updatedFavorites });
      } else {
        // Add to favorites
        favorites.push(selectedStop.id);
        await updateProfile({ favoriteStops: favorites });
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };
  
  const handleRoutePress = (routeId: string) => {
    router.push(`/route/${routeId}`);
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={[styles.centeredContainer, styles.contentContainerPadded]}>
          <Text style={styles.loadingText}>Loading stop details...</Text>
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
  
  if (!selectedStop) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={[styles.centeredContainer, styles.contentContainerPadded]}>
          <Text style={styles.errorText}>Stop not found</Text>
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
            <Text style={styles.stopName}>{selectedStop.name}</Text>
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
        </View>
        
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>Stop Location Map</Text>
          <Text style={styles.coordinates}>
            {selectedStop.coordinates.latitude.toFixed(6)}, {selectedStop.coordinates.longitude.toFixed(6)}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Routes</Text>
          <Card>
            <View style={styles.routesContainer}>
              {selectedStop.routes.map((route, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.routeTag}
                  onPress={() => handleRoutePress(route)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.routeText}>{route}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Approaching Buses</Text>
          
          {selectedStop.approachingBuses && selectedStop.approachingBuses.length > 0 ? (
            <FlatList
              data={selectedStop.approachingBuses}
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
                <Text style={styles.emptyBusesText}>No buses approaching at this time</Text>
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
  },
  stopName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 8,
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
  routesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  routeTag: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    marginBottom: 12,
  },
  routeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
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