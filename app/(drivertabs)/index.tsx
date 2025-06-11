import React, { useState, useEffect } from 'react';
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

export default function DriverMapScreen() {
  const {} = useAuthStore();
  const { stops, fetchBusStops, isLoading } = useBusStore();
  const { t } = useTranslation();
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 9.0301, lng: 38.7578 });
  const [locationSubscription, setLocationSubscription] = useState<any>(null);
  const [isMapFullScreen, setMapFullScreen] = useState(false);

  // Fetch bus stops from API on component mount
  useEffect(() => {
    fetchBusStops();
  }, [fetchBusStops]);

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
  

  const [webViewRef, setWebViewRef] = useState<any>(null);

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

      setCurrentLocation(newLocation);

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
            timeInterval: 2000,
            distanceInterval: 1,
          },
          (loc) => {
            const coords = loc.coords;
            setCurrentLocation({ lat: coords.latitude, lng: coords.longitude });
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
    setIsOnDuty(!isOnDuty);
    if (!isOnDuty) {
      Alert.alert('On Duty', 'You are now on duty. Your location will be shared with passengers.');
    } else {
      Alert.alert('Off Duty', 'You are now off duty. Location sharing has stopped.');
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
            Bus stops loaded: {stops.length} | Map stops: {busStopsForMap.length}
          </Text>
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
                    center: [${currentLocation.lng}, ${currentLocation.lat}],
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
                    .setLngLat([${currentLocation.lng}, ${currentLocation.lat}])
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
              </html>`
          }}
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
