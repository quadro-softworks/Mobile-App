import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useBusStore } from '@/stores/busStore';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { Bus } from '@/types';


export default function MapScreen() {
  const router = useRouter();
  const { buses, fetchBuses, stops, fetchBusStops } = useBusStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [isMapFullScreen, setMapFullScreen] = useState(false);

  // Transform API bus stops for map display
  const busStopsForMap = stops.map(stop => ({
    id: stop.id,
    name: stop.name,
    coordinates: {
      lng: stop.location.longitude,
      lat: stop.location.latitude
    },
    properties: {
      capacity: stop.capacity,
      is_active: stop.is_active,
      created_at: stop.created_at,
      updated_at: stop.updated_at
    }
  }));

  // Debug logging
  console.log('Bus stops count:', stops.length);
  console.log('Bus stops for map:', busStopsForMap.length);
  
  useEffect(() => {
    fetchBuses();
    fetchBusStops();
  }, [fetchBuses, fetchBusStops]);
  
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
            <Text style={styles.title}>{t('map.title')}</Text>
            <Text style={styles.subtitle}>{t('map.trackBuses')}</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              Bus stops loaded: {stops.length} | Map stops: {busStopsForMap.length}
            </Text>
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
                <style>
                  html, body, #map { height: 100%; margin: 0; padding: 0; }
                  .mapboxgl-popup-content {
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  }
                  .popup-title {
                    font-weight: bold;
                    margin-bottom: 4px;
                    color: #1f2937;
                  }
                  .popup-info {
                    font-size: 12px;
                    color: #6b7280;
                  }
                </style>
                <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
              </head>
              <body>
                <div id='map' style='width:100vw;height:100vh;'></div>
                <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
                <script>
                  mapboxgl.accessToken = 'pk.eyJ1IjoiYmFza2V0bzEyMyIsImEiOiJjbTlqZWVsdzQwZWs5MmtyMDN0b29jMjU1In0.CUIyg0uNKnAfe55aXJ0bBA';
                  const map = new mapboxgl.Map({
                    container: 'map',
                    style: 'mapbox://styles/mapbox/streets-v12',
                    center: [38.7578, 9.0301], // Addis Ababa
                    zoom: 12
                  });

                  // Add bus stops
                  const busStops = ${JSON.stringify(busStopsForMap)};
                  console.log('Bus stops data:', busStops);
                  console.log('Number of bus stops:', busStops.length);

                  busStops.forEach((stop, index) => {
                    console.log('Processing stop', index + 1, ':', stop.name, 'at coordinates:', stop.coordinates);
                    // Create a simple orange dot marker
                    const el = document.createElement('div');
                    el.className = 'bus-stop-marker';
                    el.style.background = '#FF8800'; // Orange color
                    el.style.width = '10px';
                    el.style.height = '10px';
                    el.style.borderRadius = '50%';
                    el.style.border = '2px solid #fff';
                    el.style.boxShadow = '0 0 4px rgba(0,0,0,0.15)';
                    el.style.cursor = 'pointer';

                    // Create popup content
                    const popupContent = \`
                      <div class="popup-title">\${stop.name}</div>
                      <div class="popup-info">
                        \${stop.properties?.capacity ? 'Capacity: ' + stop.properties.capacity + '<br>' : ''}
                        \${stop.properties?.is_active ? 'Status: Active<br>' : 'Status: Inactive<br>'}
                        \${stop.properties?.created_at ? 'Created: ' + new Date(stop.properties.created_at).toLocaleDateString() : ''}
                      </div>
                    \`;

                    // Create popup
                    const popup = new mapboxgl.Popup({
                      offset: 25,
                      closeButton: true,
                      closeOnClick: false
                    }).setHTML(popupContent);

                    // Add marker to map
                    const marker = new mapboxgl.Marker(el)
                      .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
                      .setPopup(popup)
                      .addTo(map);

                    console.log('Added marker for stop:', stop.name, 'at:', stop.coordinates);
                  });

                  console.log('Finished adding all', busStops.length, 'bus stops to map');
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
  mapContainer: {
    height: 620, // Default height for the map
    marginHorizontal: 8, // Add horizontal margin to match padding of other elements
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