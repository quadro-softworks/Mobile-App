import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert,
  Keyboard,
} from 'react-native';
import MapView, { Polyline, Marker, AnimatedRegion } from 'react-native-maps';
import Icon from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import axios from 'axios';
import busStops from '../../constants/busStops.json';

const { width, height } = Dimensions.get('window');

const busRoute = [
  { latitude: 9.0111213, longitude: 38.7447798 },
  { latitude: 9.01225, longitude: 38.7496507 },
  { latitude: 9.0135729, longitude: 38.749269 },
  { latitude: 9.0094789, longitude: 38.7461849 },
];

const App = () => {
  const animationIndex = useRef(0);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const animatedCoordinate = useRef(
    new AnimatedRegion({
      latitude: busRoute[0].latitude,
      longitude: busRoute[0].longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show your location.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      mapRef.current?.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      animationIndex.current = (animationIndex.current + 1) % busRoute.length;
      const nextCoord = busRoute[animationIndex.current];

      animatedCoordinate.timing({
        latitude: nextCoord.latitude,
        longitude: nextCoord.longitude,
        duration: 3000,
        useNativeDriver: false,
      }).start();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      );
      if (res.data.length > 0) {
        const { lat, lon } = res.data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        Keyboard.dismiss();
      } else {
        Alert.alert('Not Found', 'No location found for that query.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to search location.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search a location..."
          placeholderTextColor="#333"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.switchBtn} onPress={handleSearch}>
          <Icon name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Single MapView */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 9.0111213,
          longitude: 38.7447798,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Simulated Bus Marker */}
        <Marker.Animated
          ref={markerRef}
          coordinate={animatedCoordinate}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.busIcon}>
            <Icon name="bus" size={20} color="white" />
          </View>
        </Marker.Animated>

        {/* Bus Route Line */}
        <Polyline coordinates={busRoute} strokeColor="#007aff" strokeWidth={4} />

        {/* Bus Stop Markers from GeoJSON */}
        {busStops.features.map((stop, index) => {
          const [longitude, latitude] = stop.geometry.coordinates;
          return (
            <Marker
              key={`stop-${index}`}
              coordinate={{ latitude, longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.busStopMarker}>
                <Icon name="ellipse" size={14} color="#fff" />
              </View>
            </Marker>
          );
        })}

        {/* Your Location Marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
            pinColor="blue"
          />
        )}
      </MapView>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
    marginTop: 30,
  },
  switchBtn: {
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 10,
    marginTop: 30,
  },
  map: {
    flex: 1,
  },
  busStopMarker: {
    backgroundColor: 'orange',
    borderRadius: 10,
    padding: 5,
  },
  busIcon: {
    backgroundColor: '#007aff',
    borderRadius: 20,
    padding: 6,
  },
  transportBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    height: 110,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  transportBtn: {
    alignItems: 'center',
  },
  transportText: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
  },
});
