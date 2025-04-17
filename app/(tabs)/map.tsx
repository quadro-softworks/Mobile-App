import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, Image } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import Icon from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const App = () => {
  const routeCoords = [
    { latitude: 51.510088, longitude: -0.113025 }, // Temple
    { latitude: 51.508530, longitude: -0.113460 },
    { latitude: 51.506553, longitude: -0.112868 }, // Waterloo
  ];

  const markers = [
    { id: 1, latitude: 51.510088, longitude: -0.113025 }, // Temple
    { id: 2, latitude: 51.506553, longitude: -0.112868 }, // Theed St
  ];

  return (
    <View style={styles.container}>
      {/* Top Input Section */}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Temple" placeholderTextColor="#333" />
        <TouchableOpacity style={styles.switchBtn}>
          <Icon name="swap-vertical" size={24} color="#fff" />
        </TouchableOpacity>
        <TextInput style={styles.input} placeholder="Theed St." placeholderTextColor="#333" />
      </View>

      {/* Map Section */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 51.5074,
          longitude: -0.1278,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Route Line */}
        <Polyline
          coordinates={routeCoords}
          strokeColor="#007aff"
          strokeWidth={4}
        />

        {/* Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
          >
            <View style={styles.busStop}>
              <Icon name="bus-stop" size={18} color="#fff" />
            </View>
          </Marker>
        ))}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    marginVertical: 4,
    paddingLeft: 10,
    fontSize: 14,
  },
  switchBtn: {
    position: 'absolute',
    top: 35,
    right: 10,
    backgroundColor: '#007aff',
    padding: 6,
    borderRadius: 8,
    zIndex: 2,
  },
  map: {
    flex: 1,
  },
  busStop: {
    backgroundColor: '#007aff',
    padding: 6,
    borderRadius: 20,
  },
  transportBar: {
    position: 'absolute',
    bottom: 45,
    backgroundColor: '#fff',
    width,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  transportBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 123, 255, 0.14)',
    paddingHorizontal: 30,
    paddingVertical: 2,
    borderRadius: 5,
  },
  transportText: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
  },
});

export default App;
