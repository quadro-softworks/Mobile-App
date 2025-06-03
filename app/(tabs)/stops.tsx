import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useBusStore } from '@/stores/busStore';
import { StopCard } from '@/components/StopCard';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { BusStop } from '@/types';

export default function StopsScreen() {
  const router = useRouter();
  const { stops, fetchBusStops, isLoading, error } = useBusStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchBusStops();
  }, [fetchBusStops]);
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      fetchBusStops({ search: text, pn: 1 });
    } else {
      fetchBusStops({ pn: 1 });
    }
  };
  
  const handleStopPress = (stop: BusStop) => {
    router.push(`/stop/${stop.id}`);
  };
  
  const handleEndReached = () => {
    // Load more stops when reaching the end of the list
    // This would typically increment the page number
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={[styles.centered, styles.contentContainerPadded]}>
          <Text style={styles.loadingText}>Loading stops...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={[styles.centered, styles.contentContainerPadded]}>
          <Text style={styles.errorText}>Error loading stops: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={[styles.contentContainer, styles.contentContainerPadded]}>
        <View style={styles.header}>
          <Text style={styles.title}>Bus Stops</Text>
          <Text style={styles.subtitle}>Find stops and check incoming buses</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search stops by name or route"
            value={searchQuery}
            onChangeText={handleSearch}
            leftIcon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
            style={styles.searchInput}
          />
        </View>
        
        <FlatList
          data={stops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StopCard 
              stop={item} 
              onPress={handleStopPress} 
              showFavoriteButton={true}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading 
                  ? 'Loading stops...' 
                  : searchQuery 
                    ? 'No stops match your search' 
                    : 'No stops available'}
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
  contentContainer: {
    flex: 1,
  },
  contentContainerPadded: {
    paddingTop: Platform.OS === 'android' ? 20 : 34,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    marginBottom: 16,
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
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
  },
});