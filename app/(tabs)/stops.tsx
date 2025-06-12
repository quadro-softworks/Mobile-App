import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, Platform, SafeAreaView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useBusStore } from '@/stores/busStore';
import { StopCard } from '@/components/StopCard'; // Assuming this component exists
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { Input } from '@/components/ui/Input';
import { BusStop } from '@/types';

export default function StopsScreen() {
  const router = useRouter();
  const { stops, fetchBusStops, isLoading, error, searchParams } = useBusStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchBusStops({ pn: 1, search: searchQuery || undefined });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || isLoading) return;

    setLoadingMore(true);
    try {
      const nextPage = (searchParams?.pn || 1) + 1;
      // Use append=true to add new data to existing stops
      await fetchBusStops({
        pn: nextPage,
        search: searchQuery || undefined,
      }, true);
    } finally {
      setLoadingMore(false);
    }
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
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>{t('stops.title')}</Text>
              <Text style={styles.subtitle}>{t('stops.subtitle')}</Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={isLoading || refreshing}
            >
              <Ionicons
                name="refresh"
                size={24}
                color={isLoading || refreshing ? colors.textSecondary : colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder={t('stops.searchPlaceholder')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                leftIcon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(searchQuery)}>
              <Ionicons name="search" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={stops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StopCard
              stop={item}
              onPress={handleStopPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading
                  ? t('stops.loadingStops')
                  : searchQuery
                    ? t('stops.noStops')
                    : t('stops.noStops')}
              </Text>
            </View>
          }
          ListFooterComponent={
            <View>
              {/* Load More Button */}
              {stops.length > 0 && !isLoading && (
                <View style={styles.loadMoreContainer}>
                  <TouchableOpacity
                    style={[styles.loadMoreButton, loadingMore && styles.loadMoreButtonDisabled]}
                    onPress={handleLoadMore}
                    disabled={loadingMore}
                    activeOpacity={0.7}
                  >
                    <View style={styles.loadMoreContent}>
                      <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                      <Text style={styles.loadMoreText}>{t('common.loadMore')} {t('stops.title')}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Loading More Indicator */}
              {loadingMore && (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingMoreText}>{t('stops.loadingMoreStops')}</Text>
                </View>
              )}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
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
    borderRadius: 0
    
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
  loadingMore: {
    padding: 20,
    alignItems: 'center',
  },
  loadMoreContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 160,
    alignItems: 'center',
  },
  loadMoreButtonDisabled: {
    opacity: 0.6,
  },
  loadMoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});