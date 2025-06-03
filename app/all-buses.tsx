import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useBusStore } from '@/stores/busStore';
import { BusCard } from '@/components/BusCard';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Bus } from '@/types';

export default function AllBusesScreen() {
  const router = useRouter();
  const { buses, fetchBuses, isLoading } = useBusStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  
  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBuses(buses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = buses.filter(
        bus => 
          bus.name.toLowerCase().includes(query) || 
          bus.routeName.toLowerCase().includes(query)
      );
      setFilteredBuses(filtered);
    }
  }, [buses, searchQuery]);
  
  const handleBusPress = (bus: Bus) => {
    router.push(`/bus/${bus.id}`);
  };
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <Stack.Screen 
        options={{
          title: "All Buses",
          headerBackTitle: "Map",
        }} 
      />
      
      <View style={styles.contentContainerPadded}>
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search buses by name or route"
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
            style={styles.searchInput}
          />
        </View>
        
        <FlatList
          data={filteredBuses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BusCard 
              bus={item} 
              onPress={handleBusPress} 
              showFavoriteButton={true}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading 
                  ? 'Loading buses...' 
                  : searchQuery 
                    ? 'No buses match your search' 
                    : 'No buses available'}
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
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});