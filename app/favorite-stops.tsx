import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useBusStore } from '@/stores/busStore';
import { useAuthStore } from '@/stores/authStore';
import { StopCard } from '@/components/StopCard';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { BusStop } from '@/types';

export default function FavoriteStopsScreen() {
  const router = useRouter();
  const { stops, fetchBusStops, isLoading } = useBusStore();
  const { user, updateProfile } = useAuthStore();
  const [favoriteStops, setFavoriteStops] = useState<BusStop[]>([]);
  
  useEffect(() => {
    fetchBusStops();
  }, [fetchBusStops]);
  
  useEffect(() => {
    if (user && stops.length > 0) {
      const userFavorites = user.favoriteStops || [];
      const filteredStops = stops.filter(stop => userFavorites.includes(stop.id));
      setFavoriteStops(filteredStops);
    }
  }, [user, stops]);
  
  const handleStopPress = (stop: BusStop) => {
    router.push(`/stop/${stop.id}`);
  };
  
  const handleRemoveFavorite = async (stopId: string) => {
    if (!user) return;
    
    try {
      const updatedFavorites = (user.favoriteStops || []).filter(id => id !== stopId);
      await updateProfile({
        favoriteStops: updatedFavorites
      });
      
      // Update local state
      setFavoriteStops(prev => prev.filter(stop => stop.id !== stopId));
    } catch (error) {
      console.error('Failed to remove favorite stop:', error);
    }
  };
  
  const renderStopItem = ({ item }: { item: BusStop }) => (
    <View style={styles.stopItemContainer}>
      <StopCard stop={item} onPress={handleStopPress} />
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <Ionicons name="close" size={16} color={colors.card} />
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <Stack.Screen 
        options={{
          title: "Favorite Stops",
          headerBackTitle: "Profile",
        }} 
      />
      
      <View style={styles.contentContainerPadded}>
        {favoriteStops.length > 0 ? (
          <FlatList
            data={favoriteStops}
            keyExtractor={(item) => item.id}
            renderItem={renderStopItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome name="heart-o" size={60} color={colors.inactive} />
            <Text style={styles.emptyTitle}>No Favorite Stops</Text>
            <Text style={styles.emptyText}>
              {isLoading 
                ? 'Loading your favorite stops...' 
                : 'Add stops to your favorites for quick access'}
            </Text>
            <Button
              title="Browse Stops"
              onPress={() => router.push('/(tabs)/stops')}
              style={styles.browseButton}
            />
          </View>
        )}
      </View>
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
    paddingBottom: 20, 
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
  },
  stopItemContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    width: '80%',
  },
});