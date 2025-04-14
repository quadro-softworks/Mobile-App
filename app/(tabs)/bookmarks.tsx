import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Define bookmark category types
type BookmarkCategory = 'buses' | 'stops' | 'routes';

// Define bookmark types
type BusBookmark = {
  id: string;
  name: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type StopBookmark = {
  id: string;
  name: string;
  location: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type RouteBookmark = {
  id: string;
  name: string;
  distance: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function BookmarksScreen() {
  const [activeCategory, setActiveCategory] = useState<BookmarkCategory>('buses');

  // Mock bookmark data
  const busBookmarks: BusBookmark[] = [
    { id: '1', name: 'Sheger Bus', route: '4 Kilo → Mexico', icon: 'bus' },
    { id: '2', name: 'Anbessa Bus', route: 'Megenagna → Piassa', icon: 'bus' },
  ];

  const stopBookmarks: StopBookmark[] = [
    { id: '1', name: 'Mexico Square', location: 'Addis Ababa', icon: 'location' },
    { id: '2', name: '4 Kilo', location: 'Addis Ababa', icon: 'location' },
    { id: '3', name: 'Megenagna', location: 'Addis Ababa', icon: 'location' },
  ];

  const routeBookmarks: RouteBookmark[] = [
    { id: '1', name: '4 Kilo → Mexico', distance: '5.2 km', icon: 'map' },
    { id: '2', name: 'Megenagna → Piassa', distance: '8.7 km', icon: 'map' },
  ];

  // Function to get active bookmarks based on category
  const getActiveBookmarks = () => {
    switch (activeCategory) {
      case 'buses':
        return busBookmarks;
      case 'stops':
        return stopBookmarks;
      case 'routes':
        return routeBookmarks;
      default:
        return [];
    }
  };

  // Get icon color based on category
  const getIconColor = (category: BookmarkCategory) => {
    switch (category) {
      case 'buses':
        return '#3498db';
      case 'stops':
        return '#2ecc71';
      case 'routes':
        return '#9b59b6';
      default:
        return '#0a7ea4';
    }
  };

  // Get bookmark detail based on category
  const getBookmarkDetail = (bookmark: any) => {
    switch (activeCategory) {
      case 'buses':
        return (bookmark as BusBookmark).route;
      case 'stops':
        return (bookmark as StopBookmark).location;
      case 'routes':
        return (bookmark as RouteBookmark).distance;
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookmarks</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Category Selector */}
      <View style={styles.categorySelector}>
        {(['buses', 'stops', 'routes'] as BookmarkCategory[]).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              activeCategory === category && styles.activeCategoryButton,
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === category && styles.activeCategoryText,
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookmarks List */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {getActiveBookmarks().length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={48} color="#adb5bd" />
            <Text style={styles.emptyStateText}>No bookmarks in this category</Text>
          </View>
        ) : (
          getActiveBookmarks().map((bookmark) => (
            <TouchableOpacity key={bookmark.id} style={styles.bookmarkCard}>
              <View style={styles.bookmarkIconContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.iconGradient}
                >
                  <Ionicons 
                    name={bookmark.icon} 
                    size={22} 
                    color={getIconColor(activeCategory)} 
                  />
                </LinearGradient>
              </View>
              <View style={styles.bookmarkInfo}>
                <Text style={styles.bookmarkName}>{bookmark.name}</Text>
                <Text style={styles.bookmarkDetail}>{getBookmarkDetail(bookmark)}</Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#adb5bd" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c242f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categorySelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#28313f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeCategoryButton: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#adb5bd',
  },
  activeCategoryText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#adb5bd',
  },
  bookmarkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#28313f',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  bookmarkIconContainer: {
    marginRight: 14,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  bookmarkDetail: {
    fontSize: 14,
    color: '#adb5bd',
  },
  moreButton: {
    padding: 8,
  },
}); 