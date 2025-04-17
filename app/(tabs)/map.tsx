import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, SafeAreaView, Alert, Keyboard } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import Icon from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import axios from 'axios';
import busStops from '../../constants/busStops.json';

const { width, height } = Dimensions.get('window');

const App = () => {
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef(null);

  const routeCoords = [
    { latitude: 51.510088, longitude: -0.113025 },
    { latitude: 51.508530, longitude: -0.113460 },
    { latitude: 51.506553, longitude: -0.112868 },
  ];

  const markers = [
    { id: 1, latitude: 51.510088, longitude: -0.113025 },
    { id: 2, latitude: 51.506553, longitude: -0.112868 },
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show your location.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      mapRef.current?.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
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
      {/* Top Input Section */}
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

      {/* Map Section */}
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
        {/* Route Line */}
        <Polyline coordinates={routeCoords} strokeColor="#007aff" strokeWidth={4} />

        {/* Static Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
          >
            <View style={styles.busStop}>
              <Icon name="bus" size={18} color="#fff" />
            </View>
          </Marker>
        ))}

        {/* GeoJSON Markers */}
        {busStops.features.map((stop, index) => {
          const [longitude, latitude] = stop.geometry.coordinates;
          return (
            <Marker
              key={`geojson-${index}`}
              coordinate={{ latitude, longitude }}
              pinColor="orange"
            />
          );
        })}

        {/* Your Current Location */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            pinColor="blue"
            title="You are here"
          />
        )}
      </MapView>

      {/* Bottom Transport Options */}
      <View style={styles.transportBar}>
        <TouchableOpacity style={styles.transportBtn}>
          <Icon name="bus" size={22} color="#007aff" />
          <Text style={styles.transportText}>Bus</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.transportBtn}>
          <Icon name="train" size={22} color="#aaa" />
          <Text style={styles.transportText}>Metro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.transportBtn}>
          <Icon name="car" size={22} color="#aaa" />
          <Text style={styles.transportText}>Tram</Text>
        </TouchableOpacity>
      </View>
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
  },
  switchBtn: {
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 10,
  },
  map: {
    flex: 1,
  },
  busStop: {
    backgroundColor: '#007aff',
    padding: 5,
    borderRadius: 15,
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
