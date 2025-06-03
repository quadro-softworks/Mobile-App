import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useBusStore } from '@/stores/busStore';
import { BusCard } from '@/components/BusCard';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Bus } from '@/types';

export default function MapScreen() {
  const router = useRouter();
  const { buses, fetchBuses, isLoading } = useBusStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [isMapFullScreen, setMapFullScreen] = useState(false);
  
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
  
  const toggleMapFullScreen = () => {
    setMapFullScreen(!isMapFullScreen);
  };
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {/* Header and Search are part of the normal view, overlaid by fullscreen map */}
      {!isMapFullScreen && (
        <View style={styles.headerSearchContainerPadded}>
          <View style={styles.header}>
            <Text style={styles.title}>Live Bus Tracking</Text>
            <Text style={styles.subtitle}>Find and track buses in real-time</Text>
          </View>
          <View style={styles.searchContainer}>
            <Ionicons name="search" color={colors.gray} size={20} style={styles.searchIcon} />
            <Input
              placeholder="Search for bus or route"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
        </View>
      )}
      
      {/* Map View - Now using WebView for Mapbox */}
      <View style={isMapFullScreen ? styles.mapContainerFullScreen : styles.mapContainer}>
        <WebView
          source={{
            html: `<!DOCTYPE html>
              <html>
              <head>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
                <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
              </head>
              <body>
                <div id='map' style='width:100vw;height:100vh;'></div>
                <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
                <script>
                  mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
                  const map = new mapboxgl.Map({
                    container: 'map',
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [38.7578, 9.0301], // Example: Addis Ababa
                    zoom: 12
                  });
                </script>
              </body>
              </html>`
          }}
          style={{ flex: 1 }}
          originWhitelist={["*"]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
        <TouchableOpacity onPress={toggleMapFullScreen} style={styles.fullScreenButton}>
          {isMapFullScreen ? <Ionicons name="contract" color={colors.primary} size={24}/> : <Ionicons name="expand" color={colors.primary} size={24}/>} 
        </TouchableOpacity>
      </View>
      
      {/* Bus List - Only shown when map is not fullscreen */}
      {!isMapFullScreen && (
        <View style={styles.listContainerPadded}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Buses</Text>
            <TouchableOpacity onPress={() => router.push('/all-buses')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading buses...</Text>
          ) : filteredBuses.length > 0 ? (
            <FlatList
              data={filteredBuses.slice(0, 3)} // Show only first 3 buses
              renderItem={({ item }) => (
                <BusCard bus={item} onPress={() => handleBusPress(item)} />
              )}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noBusesText}>No buses found matching your search.</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: { // New style for SafeAreaView
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSearchContainerPadded: { // New style for padding header and search
    paddingHorizontal: 16,
  },
  listContainerPadded: { // New style for padding list
    paddingHorizontal: 16,
    flex: 1, // Ensure list takes remaining space when map is not fullscreen
  },
  header: {
    paddingVertical: Platform.OS === 'ios' ? 20 : 24, // Adjusted padding for iOS/Android
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16, // Added margin bottom for spacing
    borderColor: colors.border, // Added border color
    borderWidth: 1, // Added border width
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48, // Increased height for better touch target
    fontSize: 16,
    color: colors.text, // Ensure text color is appropriate
  },
  mapContainer: {
    height: 250, // Default height for the map
    marginHorizontal: 16, // Add horizontal margin to match padding of other elements
    borderRadius: 12, // Rounded corners for the map container
    overflow: 'hidden', // Ensures the MapView respects the border radius
    marginBottom: 16, // Space below the map before the list starts
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapContainerFullScreen: {
    ...StyleSheet.absoluteFillObject, // Make map take up the whole screen
    zIndex: 10, // Ensure map is on top of other content when fullscreen
  },
  fullScreenButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
    padding: 8,
    borderRadius: 20, // Circular button
    zIndex: 11, // Ensure button is on top of the map
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20, // Increased top margin for better separation
    marginBottom: 12, // Increased bottom margin
  },
  sectionTitle: {
    fontSize: 20, // Slightly larger section title
    fontWeight: 'bold',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600', // Bolder view all text
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: colors.gray,
  },
  noBusesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: colors.gray,
  },
  routeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: colors.card, // Ensure card background is applied
    borderRadius: 8, // Ensure card has rounded corners
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeName: {
    fontSize: 16,
    marginLeft: 12,
    color: colors.text,
    fontWeight: '500',
  },
});