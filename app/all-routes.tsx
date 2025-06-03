import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useBusStore } from '@/stores/busStore';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { Input } from '@/components/ui/Input';
import { Route } from '@/types';
import { Ionicons } from '@expo/vector-icons';

export default function AllRoutesScreen() {
  const router = useRouter();
  const { routes, fetchRoutes, isLoading } = useBusStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredRoutes, setFilteredRoutes] = React.useState<Route[]>([]);
  
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRoutes(routes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = routes.filter(
        route => 
          route.name.toLowerCase().includes(query) || 
          route.description.toLowerCase().includes(query) ||
          route.startPoint.toLowerCase().includes(query) ||
          route.endPoint.toLowerCase().includes(query)
      );
      setFilteredRoutes(filtered);
    }
  }, [routes, searchQuery]);
  
  const handleRoutePress = (route: Route) => {
    router.push(`/route/${route.id}`);
  };
  
  const renderRouteItem = ({ item }: { item: Route }) => (
    <TouchableOpacity 
      style={styles.routeItemContainer}
      onPress={() => handleRoutePress(item)}
      activeOpacity={0.7}
    >
      <Card style={[styles.routeCard, { borderLeftColor: item.color }]}>
        <View style={styles.routeHeader}>
          <Text style={styles.routeName}>{item.name}</Text>
          <Ionicons name="git-branch" size={20} color={colors.primary} />
        </View>
        
        <Text style={styles.routeDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
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
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
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
          title: "All Routes",
          headerBackTitle: "Map",
        }} 
      />
      
      <View style={styles.contentContainerPadded}>
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search routes by name"
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
            style={styles.searchInput}
          />
        </View>
        
        <FlatList
          data={filteredRoutes}
          keyExtractor={(item) => item.id}
          renderItem={renderRouteItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading 
                  ? 'Loading routes...' 
                  : searchQuery 
                    ? 'No routes match your search' 
                    : 'No routes available'}
              </Text>
            </View>
          }
        />
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
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingBottom: 20,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContent: {
    paddingBottom: 20,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  routeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  routeFrequency: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});