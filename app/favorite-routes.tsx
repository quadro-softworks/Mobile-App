import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useBusStore } from '@/stores/busStore';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Route } from '@/types';

export default function FavoriteRoutesScreen() {
  const router = useRouter();
  const { routes, fetchRoutes, isLoading } = useBusStore();
  const { user, updateProfile } = useAuthStore();
  const [favoriteRoutes, setFavoriteRoutes] = useState<Route[]>([]);
  
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);
  
  useEffect(() => {
    if (user && routes.length > 0) {
      const userFavorites = user.favoriteRoutes || [];
      const filteredRoutes = routes.filter(route => userFavorites.includes(route.id));
      setFavoriteRoutes(filteredRoutes);
    }
  }, [user, routes]);
  
  const handleRoutePress = (route: Route) => {
    router.push(`/route/${route.id}`);
  };
  
  const handleRemoveFavorite = async (routeId: string) => {
    if (!user) return;
    
    try {
      const updatedFavorites = (user.favoriteRoutes || []).filter(id => id !== routeId);
      await updateProfile({
        favoriteRoutes: updatedFavorites
      });
      
      // Update local state
      setFavoriteRoutes(prev => prev.filter(route => route.id !== routeId));
    } catch (error) {
      console.error('Failed to remove favorite route:', error);
    }
  };
  
  const renderRouteItem = ({ item }: { item: Route }) => (
    <TouchableOpacity 
      style={styles.routeItemContainer}
      onPress={() => handleRoutePress(item)}
      activeOpacity={0.7}
    >
      <Card style={[styles.routeCard, { borderLeftColor: item.color }]}>
        <View style={styles.routeHeader}>
          <View>
            <Text style={styles.routeName}>{item.name}</Text>
            <Text style={styles.routeDescription}>{item.description}</Text>
          </View>
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={(e) => {
              e.stopPropagation();
              handleRemoveFavorite(item.id);
            }}
          >
            <Ionicons name="close" size={16} color={colors.card} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.routeDetails}>
          <View style={styles.routeDetail}>
            <Text style={styles.routeDetailLabel}>From</Text>
            <Text style={styles.routeDetailValue}>{item.startPoint}</Text>
          </View>
          <View style={styles.routeDetail}>
            <Text style={styles.routeDetailLabel}>To</Text>
            <Text style={styles.routeDetailValue}>{item.endPoint}</Text>
          </View>
        </View>
        
        <View style={styles.routeFooter}>
          <Text style={styles.routeFrequency}>
            Every {item.frequency} • {item.activeHours}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <Stack.Screen 
        options={{
          title: "Favorite Routes",
          headerBackTitle: "Profile",
        }} 
      />
      
      <View style={styles.contentContainerPadded}>
        {favoriteRoutes.length > 0 ? (
          <FlatList
            data={favoriteRoutes}
            keyExtractor={(item) => item.id}
            renderItem={renderRouteItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome name="heart-o" size={60} color={colors.inactive} />
            <Text style={styles.emptyTitle}>No Favorite Routes</Text>
            <Text style={styles.emptyText}>
              {isLoading 
                ? 'Loading your favorite routes...' 
                : 'Add routes to your favorites for quick access'}
            </Text>
            <Button
              title="Browse Routes"
              onPress={() => router.push('/(tabs)')}
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
  routeItemContainer: {
    marginBottom: 16,
  },
  routeCard: {
    borderLeftWidth: 4,
    borderRadius: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  routeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  removeButton: {
    backgroundColor: colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  routeDetail: {
    flex: 1,
  },
  routeDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  routeDetailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  routeFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  routeFrequency: {
    fontSize: 12,
    color: colors.textSecondary,
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