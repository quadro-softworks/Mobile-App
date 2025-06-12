import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { useBusStore } from '@/stores/busStore';
import Constants from 'expo-constants';
import { busTrackingSocket } from '@/utils/socket';

export default function DriverMapScreen() {
  const { user, token } = useAuthStore();
  const { stops, fetchBusStops } = useBusStore();
  const { t } = useTranslation();

  console.log('🚌 DriverMapScreen loaded - User:', user ? { role: user.role, email: user.email } : 'No user');
  console.log('🚌 DriverMapScreen - Bus stops count:', stops.length);

  const [isOnDuty, setIsOnDuty] = useState(false);
  const [initialLocation] = useState({ lat: 9.0301, lng: 38.7578 }); // Static initial location for map
  const [locationSubscription, setLocationSubscription] = useState<any>(null);
  const [isMapFullScreen, setMapFullScreen] = useState(false);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const currentLocationRef = useRef({ lat: 9.0301, lng: 38.7578 }); // Use ref to avoid re-renders

  // Mock bus ID - in a real app, this would come from the driver's profile/assignment
  const assignedBusId = "64ebb1d5-24c1-4d86-9768-89f9f64707ed";

  // WebSocket connection setup
  useEffect(() => {
    if (isOnDuty && token) {
      const ws = new WebSocket(`wss://guzosync-fastapi.onrender.com/ws/connect?token=${encodeURIComponent(token)}`);

      ws.onopen = () => {
        console.log('🔗 WebSocket connected for driver location updates');
        setWebsocket(ws);
      };

      ws.onerror = (error) => {
        console.error('🚨 WebSocket connection error:', error);
      };

      ws.onclose = () => {
        console.log('❌ WebSocket connection closed');
        setWebsocket(null);
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    }
  }, [isOnDuty, token]);

  // Send location updates every 5 seconds when on duty
  useEffect(() => {
    if (isOnDuty && websocket && websocket.readyState === WebSocket.OPEN) {
      const sendLocationUpdate = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') return;

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const locationData = {
            type: "bus_location_update",
            data: {
              bus_id: assignedBusId,
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              heading: location.coords.heading || 0,
              speed: location.coords.speed ? location.coords.speed * 3.6 : 0, // Convert m/s to km/h
            }
          };

          websocket.send(JSON.stringify(locationData));
          console.log('📍 Sent location update:', locationData);
        } catch (error) {
          console.error('❌ Error sending location update:', error);
        }
      };

      // Send initial location update
      sendLocationUpdate();

      // Set up interval for regular updates
      locationUpdateInterval.current = setInterval(sendLocationUpdate, 5000);

      return () => {
        if (locationUpdateInterval.current) {
          clearInterval(locationUpdateInterval.current);
          locationUpdateInterval.current = null;
        }
      };
    }
  }, [isOnDuty, websocket, assignedBusId]);

  // Fetch bus stops from API on component mount
  useEffect(() => {
    // Fetch ALL bus stops (set very high page size to get all)
    fetchBusStops({ ps: 1000 });
  }, [fetchBusStops]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (websocket) {
        websocket.close();
      }
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, [websocket]);

  // Transform API bus stops for map display with null checks
  const busStopsForMap = stops
    .filter(stop => {
      // Filter out stops without valid location data
      const hasLocation = stop.location &&
        typeof stop.location.longitude === 'number' &&
        typeof stop.location.latitude === 'number';

      const hasCoordinates = stop.coordinates &&
        typeof stop.coordinates.longitude === 'number' &&
        typeof stop.coordinates.latitude === 'number';

      if (!hasLocation && !hasCoordinates) {
        console.warn('Skipping bus stop without valid coordinates:', stop.name, stop);
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
  

  const [webViewRef, setWebViewRef] = useState<any>(null);

  // Memoize the WebView HTML to prevent re-renders when location changes
  const mapHTML = useMemo(() => `<!DOCTYPE html>
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
          center: [${initialLocation.lng}, ${initialLocation.lat}],
          zoom: 13
        });

        // Add driver location marker (map pin icon)
        const driverMarkerEl = document.createElement('div');
        driverMarkerEl.className = 'driver-marker';
        driverMarkerEl.style.width = '28px';
        driverMarkerEl.style.height = '28px';
        driverMarkerEl.style.backgroundSize = 'contain';
        driverMarkerEl.style.backgroundRepeat = 'no-repeat';
        driverMarkerEl.style.backgroundPosition = 'center';
        driverMarkerEl.style.backgroundImage = 'url(data:image/svg+xml;base64,' + btoa(\`
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2C8.477 2 4 6.477 4 12c0 6.075 7.25 13.25 9.293 15.207a1 1 0 0 0 1.414 0C16.75 25.25 24 18.075 24 12c0-5.523-4.477-10-10-10zm0 13.5A3.5 3.5 0 1 1 14 8a3.5 3.5 0 0 1 0 7z" fill="#2563EB"/>
            <circle cx="14" cy="12" r="2" fill="#fff"/>
          </svg>
        \`) + ')';

        const driverMarker = new mapboxgl.Marker(driverMarkerEl)
          .setLngLat([${initialLocation.lng}, ${initialLocation.lat}])
          .addTo(map);

        // Add bus stops
        const busStops = ${JSON.stringify(busStopsForMap)};
        console.log('Driver dashboard - Bus stops data:', busStops);
        console.log('Driver dashboard - Number of bus stops:', busStops.length);

        busStops.forEach((stop, index) => {
          console.log('Driver dashboard - Processing stop', index + 1, ':', stop.name, 'at coordinates:', stop.coordinates);
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

          console.log('Driver dashboard - Added marker for stop:', stop.name, 'at:', stop.coordinates);
        });

        console.log('Driver dashboard - Finished adding all', busStops.length, 'bus stops to map');

        // Handle messages from React Native
        window.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'updateLocation') {
              driverMarker.setLngLat([data.lng, data.lat]);
            } else if (data.type === 'centerOnLocation') {
              driverMarker.setLngLat([data.lng, data.lat]);
              map.flyTo({
                center: [data.lng, data.lat],
                zoom: 16,
                duration: 1000
              });
            }
          } catch (e) {
            console.log('Error parsing message:', e);
          }
        });

        // For React Native WebView
        document.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'updateLocation') {
              driverMarker.setLngLat([data.lng, data.lat]);
            } else if (data.type === 'centerOnLocation') {
              driverMarker.setLngLat([data.lng, data.lat]);
              map.flyTo({
                center: [data.lng, data.lat],
                zoom: 16,
                duration: 1000
              });
            }
          } catch (e) {
            console.log('Error parsing message:', e);
          }
        });
      </script>
    </body>
    </html>`, [busStopsForMap, initialLocation]);

  // Center map on user location
  const centerOnUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to center on your location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      currentLocationRef.current = newLocation;

      // Update map center and driver marker
      if (webViewRef) {
        webViewRef.postMessage(JSON.stringify({
          type: 'centerOnLocation',
          lat: newLocation.lat,
          lng: newLocation.lng
        }));
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Location Error', 'Unable to get current location. Please try again.');
    }
  };

  // Real-time location tracking for map display (separate from WebSocket updates)
  useEffect(() => {
    let subscription: any;
    if (isOnDuty) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to show your position on the map.');
          return;
        }
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 2000, // Update map every 2 seconds for smooth movement
            distanceInterval: 1,
          },
          (loc) => {
            const coords = loc.coords;
            currentLocationRef.current = { lat: coords.latitude, lng: coords.longitude };
            if (webViewRef) {
              webViewRef.postMessage(
                JSON.stringify({
                  type: 'updateLocation',
                  lat: coords.latitude,
                  lng: coords.longitude,
                })
              );
            }
          }
        );
        setLocationSubscription(subscription);
      })();
    } else if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    return () => {
      if (subscription) subscription.remove();
    };
  }, [isOnDuty, webViewRef]);

  const toggleDutyStatus = () => {
    const newDutyStatus = !isOnDuty;
    setIsOnDuty(newDutyStatus);

    if (newDutyStatus) {
      Alert.alert('On Duty', 'You are now on duty. Your location will be shared with passengers every 5 seconds.');
    } else {
      Alert.alert('Off Duty', 'You are now off duty. Location sharing has stopped.');

      // Clean up WebSocket connection and location updates
      if (websocket) {
        websocket.close();
        setWebsocket(null);
      }

      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
        locationUpdateInterval.current = null;
      }
    }
  };



  const toggleMapFullScreen = () => {
    setMapFullScreen(!isMapFullScreen);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('driver.title')}</Text>
          <Text style={styles.subtitle}>{t('driver.subtitle')}</Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            Bus stops: {busStopsForMap.length} | Bus ID: {assignedBusId.slice(-8)}
          </Text>
          {isOnDuty && (
            <Text style={{ fontSize: 11, color: websocket ? colors.success : colors.warning, marginTop: 2 }}>
              📍 Location updates: {websocket ? 'Active (every 5s)' : 'Connecting...'}
            </Text>
          )}
        </View>
        <View style={styles.dutyToggle}>
          <Text style={[styles.dutyText, { color: isOnDuty ? colors.success : colors.textSecondary }]}>
            {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
          </Text>
          <Switch
            value={isOnDuty}
            onValueChange={toggleDutyStatus}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={colors.card}
          />
        </View>
      </View>

      {/* Map View */}
      <View style={isMapFullScreen ? styles.mapContainerFullScreen : styles.mapContainer}>
        <WebView
          source={{ html: mapHTML }}
          ref={setWebViewRef}
          style={styles.map}
          originWhitelist={["*"]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(event) => {
            // Handle messages from WebView if needed
            console.log('Message from WebView:', event.nativeEvent.data);
          }}
        />

        {/* Map Control Buttons */}
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  dutyToggle: {
    alignItems: 'center',
  },
  dutyText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  fullScreenButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
    zIndex: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapContainerFullScreen: {
    ...StyleSheet.absoluteFillObject, // Make map take up the whole screen
    zIndex: 10, // Ensure map is on top of other content when fullscreen

    // uncomment bellow if more space is needed on the top 

    // paddingTop: Constants.statusBarHeight, // Add space for status bar
  },
  locationButton: {
    position: 'absolute',
    top: 60, // Below the fullscreen button
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
    zIndex: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    flex: 1,
  },
});
