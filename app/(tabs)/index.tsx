import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, Platform, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useBusStore } from '@/stores/busStore';
import { useRealTimeBuses } from '@/hooks/useRealTimeBuses';
import { RealTimeBusStatus } from '@/components/RealTimeBusStatus';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { Bus } from '@/types';
import * as Location from 'expo-location';


export default function MapScreen() {
  const router = useRouter();
  const { buses, fetchBuses, stops, fetchBusStops } = useBusStore();
  const {
    buses: realTimeBuses,
    isConnected: isRealTimeConnected,
    connectionStatus,
    isUsingFallback,
    joinAreaTracking
  } = useRealTimeBuses();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [isMapFullScreen, setMapFullScreen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const webViewRef = useRef<WebView>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [lastBusUpdate, setLastBusUpdate] = useState(0);

  // Memoize bus stops data to prevent unnecessary re-renders
  const busStopsForMap = useMemo(() => {
    return stops
      .filter(stop => {
        // Filter out stops without valid location data
        const hasLocation = stop.location &&
          typeof stop.location.longitude === 'number' &&
          typeof stop.location.latitude === 'number';

        const hasCoordinates = stop.coordinates &&
          typeof stop.coordinates.longitude === 'number' &&
          typeof stop.coordinates.latitude === 'number';

        if (!hasLocation && !hasCoordinates) {
          return false;
        }

        return true;
      })
      .map(stop => {
        // Use location first, fallback to coordinates
        const location = stop.location || stop.coordinates;

        return {
          id: stop.id,
          name: stop.name,
          coordinates: {
            lng: location.longitude,
            lat: location.latitude
          },
          properties: {
            capacity: stop.capacity,
            is_active: stop.is_active,
            created_at: stop.created_at,
            updated_at: stop.updated_at
          }
        };
      });
  }, [stops]);

  // Memoize bus data to prevent unnecessary re-renders
  const busesForMap = useMemo(() => {
    return realTimeBuses
      .filter(bus => {
        // Filter out buses without valid coordinates
        return bus.coordinates &&
          typeof bus.coordinates.longitude === 'number' &&
          typeof bus.coordinates.latitude === 'number';
      })
      .map(bus => ({
        id: bus.id,
        name: bus.name,
        routeName: bus.routeName,
        coordinates: {
          lng: bus.coordinates.longitude,
          lat: bus.coordinates.latitude
        },
        status: bus.status,
        capacity: bus.capacity,
        nextStop: bus.nextStop,
        eta: bus.eta,
        heading: (bus as any).heading || 0,
        speed: (bus as any).speed || 0,
        isRealTime: (bus as any).isRealTime || false,
        lastUpdated: bus.lastUpdated
      }));
  }, [realTimeBuses]);

  // Debug logging (reduced frequency) - only log when significant changes occur
  useEffect(() => {
    // Only log when bus stops count changes significantly or connection status changes
    const shouldLog = stops.length > 0 && (stops.length % 500 === 0 || stops.length === busStopsForMap.length);
    if (shouldLog || connectionStatus === 'connected') {
      console.log('📊 Map Data Summary:');
      console.log('  - Bus stops:', stops.length, '| Displaying:', busStopsForMap.length);
      console.log('  - Real-time buses:', realTimeBuses.length, '| Displaying:', busesForMap.length);
      console.log('  - Connection status:', connectionStatus, '| Connected:', isRealTimeConnected);
      if (stops.length > 100) {
        console.log('  ✅ Successfully loaded ALL bus stops');
      }
    }
  }, [stops.length, connectionStatus]); // Removed frequently changing dependencies
  
  // Request location permission and get user location
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermission(true);
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude
          });
        } else {
          setLocationPermission(false);
          Alert.alert(
            'Location Permission',
            'Location permission is required to show your position on the map.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
        setLocationPermission(false);
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    fetchBuses();
    // Fetch ALL bus stops (set very high page size to get all)
    fetchBusStops({ ps: 1000 });
  }, [fetchBuses, fetchBusStops]);

  // Join area tracking for Addis Ababa region when component mounts
  useEffect(() => {
    // Define bounds for Addis Ababa area
    const addisAbabaBounds = {
      north: 9.1,
      south: 8.9,
      east: 38.9,
      west: 38.6
    };

    console.log('🗺️ Joining area tracking for Addis Ababa region');
    joinAreaTracking(addisAbabaBounds);
  }, [joinAreaTracking]);

  // Update bus positions without recreating the map (throttled)
  useEffect(() => {
    if (mapInitialized && webViewRef.current && busesForMap.length > 0) {
      const now = Date.now();
      // Throttle updates to maximum once every 2 seconds
      if (now - lastBusUpdate > 2000) {
        const updateScript = `
          if (window.updateBusPositions) {
            window.updateBusPositions(${JSON.stringify(busesForMap)});
          }
          true; // Return true to prevent console warnings
        `;

        webViewRef.current.injectJavaScript(updateScript);
        setLastBusUpdate(now);
      }
    }
  }, [busesForMap, mapInitialized, lastBusUpdate]);
  
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

  const centerOnUserLocation = async () => {
    if (!locationPermission) {
      Alert.alert(
        'Location Permission Required',
        'Please enable location permission to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };
      setUserLocation(newLocation);

      // You could also send a message to the WebView to center the map
      // webViewRef?.postMessage(JSON.stringify({
      //   type: 'centerOnLocation',
      //   lat: newLocation.lat,
      //   lng: newLocation.lng
      // }));
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Unable to get your current location.');
    }
  };

  // Memoize the HTML to prevent WebView from re-rendering constantly
  // Only recreate when bus stops or user location changes, NOT when bus positions change
  const mapHtml = useMemo(() => {
    const mapCenter = userLocation ? [userLocation.lng, userLocation.lat] : [38.7578, 9.0301];
    const mapZoom = userLocation ? 14 : 12;

    return `<!DOCTYPE html>
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
                  .bus-marker {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    color: white;
                    position: relative;
                  }
                  .bus-marker.on-time { background-color: #10B981; }
                  .bus-marker.delayed { background-color: #EF4444; }
                  .bus-marker.early { background-color: #3B82F6; }
                  .bus-marker.real-time::after {
                    content: '';
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 6px;
                    height: 6px;
                    background-color: #10B981;
                    border-radius: 50%;
                    border: 1px solid #fff;
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
                    center: [${mapCenter[0]}, ${mapCenter[1]}],
                    zoom: ${mapZoom}
                  });

                  // Add user location marker if available
                  ${userLocation ? `
                    const userMarkerEl = document.createElement('div');
                    userMarkerEl.style.width = '20px';
                    userMarkerEl.style.height = '20px';
                    userMarkerEl.style.borderRadius = '50%';
                    userMarkerEl.style.backgroundColor = '#007AFF';
                    userMarkerEl.style.border = '3px solid #fff';
                    userMarkerEl.style.boxShadow = '0 0 10px rgba(0,122,255,0.5)';
                    userMarkerEl.style.animation = 'pulse 2s infinite';

                    const style = document.createElement('style');
                    style.textContent = \`@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(0, 122, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 122, 255, 0); } }\`;
                    document.head.appendChild(style);

                    new mapboxgl.Marker(userMarkerEl)
                      .setLngLat([${userLocation.lng}, ${userLocation.lat}])
                      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<div style="font-weight: bold;">Your Location</div>'))
                      .addTo(map);
                  ` : ''}

                  // Add bus stops (limit console output)
                  const busStops = ${JSON.stringify(busStopsForMap)};
                  console.log('Adding', busStops.length, 'bus stops to map');

                  busStops.forEach((stop) => {
                    const el = document.createElement('div');
                    el.style.background = '#FF8800';
                    el.style.width = '10px';
                    el.style.height = '10px';
                    el.style.borderRadius = '50%';
                    el.style.border = '2px solid #fff';
                    el.style.boxShadow = '0 0 4px rgba(0,0,0,0.15)';
                    el.style.cursor = 'pointer';

                    const popupContent = \`<div class="popup-title">\${stop.name}</div><div class="popup-info">\${stop.properties?.capacity ? 'Capacity: ' + stop.properties.capacity + '<br>' : ''}\${stop.properties?.is_active ? 'Status: Active' : 'Status: Inactive'}</div>\`;

                    new mapboxgl.Marker(el)
                      .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
                      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
                      .addTo(map);
                  });

                  // Initialize empty bus markers container
                  window.busMarkers = new Map();

                  // Function to update bus positions
                  window.updateBusPositions = function(buses) {
                    console.log('Updating bus positions:', buses.length, 'buses');

                    // Clear existing bus markers
                    window.busMarkers.forEach(marker => marker.remove());
                    window.busMarkers.clear();

                    // Add updated bus markers
                    buses.forEach((bus) => {
                      const busEl = document.createElement('div');
                      busEl.className = \`bus-marker \${bus.status} \${bus.isRealTime ? 'real-time' : ''}\`;
                      busEl.innerHTML = '🚌';

                      if (bus.heading) {
                        busEl.style.transform = \`rotate(\${bus.heading}deg)\`;
                      }

                      const busPopupContent = \`<div class="popup-title">\${bus.name}</div><div class="popup-info">Route: \${bus.routeName}<br>Status: \${bus.status}<br>Next Stop: \${bus.nextStop}<br>ETA: \${bus.eta === 0 ? 'Arriving' : bus.eta + ' min'}<br>\${bus.isRealTime ? '<strong>🔴 Live Tracking</strong><br>' : ''}Last Updated: \${new Date(bus.lastUpdated).toLocaleTimeString()}</div>\`;

                      const busMarker = new mapboxgl.Marker(busEl)
                        .setLngLat([bus.coordinates.lng, bus.coordinates.lat])
                        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(busPopupContent))
                        .addTo(map);

                      window.busMarkers.set(bus.id, busMarker);
                    });
                  };

                  console.log('Map initialization complete');
                </script>
              </body>
              </html>`;
  }, [userLocation, busStopsForMap]); // Removed busesForMap from dependencies

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {/* Header and Search are part of the normal view, overlaid by fullscreen map */}
      {!isMapFullScreen && (
        <View style={styles.headerSearchContainerPadded}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('map.title')}</Text>
            <Text style={styles.subtitle}>{t('map.trackBuses')}</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              Bus stops: {busStopsForMap.length} | Real-time buses: {busesForMap.length}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isRealTimeConnected ? '#10B981' : isUsingFallback ? '#F59E0B' : '#EF4444',
                marginRight: 6
              }} />
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                {isRealTimeConnected ? 'Real-time connected' :
                 isUsingFallback ? 'Using fallback data' :
                 'Real-time disconnected'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Real-time Bus Status */}
      {!isMapFullScreen && <RealTimeBusStatus />}

      {/* Map View - Now using WebView for Mapbox */}
      <View style={isMapFullScreen ? styles.mapContainerFullScreen : styles.mapContainer}>
        <WebView
          ref={webViewRef}
          key="main-map-webview" // Add stable key to prevent unnecessary re-mounts
          source={{
            html: mapHtml
          }}
          style={{ flex: 1 }}
          originWhitelist={["*"]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onLoadEnd={() => {
            if (!mapInitialized) { // Only log once
              setMapInitialized(true);
              console.log('🗺️ Map initialized successfully');
            }
          }}
        />
        <TouchableOpacity onPress={toggleMapFullScreen} style={styles.fullScreenButton}>
          {isMapFullScreen ? <Ionicons name="contract" color={colors.primary} size={24}/> : <Ionicons name="expand" color={colors.primary} size={24}/>}
        </TouchableOpacity>

        <TouchableOpacity onPress={centerOnUserLocation} style={styles.locationButton}>
          <Ionicons name="locate" color={colors.primary} size={24}/>
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
    height: 600, // Default height for the map
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
  locationButton: {
    position: 'absolute',
    top: 60, // Below the fullscreen button
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 20,
    zIndex: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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