import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Mock data (simplified)
const BUSES = [{ id: '1', name: 'Bus', latitude: 9.01, longitude: 38.75, color: '#3498db' }];
const BUS_STOPS = [{ id: '1', name: 'Stop', latitude: 9.02, longitude: 38.76 }];
const initialRegion = { latitude: 9.02, longitude: 38.75, latitudeDelta: 0.05, longitudeDelta: 0.05 };

// Simplified Header
const MapHeader = ({ onReset }) => (
  <View style={styles.header}>
    <View style={styles.searchBar}><Text style={styles.searchText}>Search</Text></View>
    <TouchableOpacity style={styles.mapControlButton} onPress={onReset}><Ionicons name="locate-outline" size={22} color="white" /></TouchableOpacity>
  </View>
);

// Bus Marker
const BusMarker = ({ bus, onPress }) => (
  <Marker coordinate={{ latitude: bus.latitude, longitude: bus.longitude }} onPress={() => onPress(bus)}>
    <View style={[styles.busMarker, { backgroundColor: bus.color }]}><Ionicons name="bus" size={20} color="white" /></View>
    <Callout><View style={styles.calloutContainer}><Text style={styles.calloutTitle}>{bus.name}</Text></View></Callout>
  </Marker>
);

// Bus Stop Marker
const BusStopMarker = ({ stop }) => (
  <Marker coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}>
    <View style={styles.stopMarker}><View style={styles.stopInner}><Ionicons name="flag" size={12} color="white" /></View></View>
    <Callout><View style={styles.calloutContainer}><Text style={styles.calloutTitle}>{stop.name}</Text></View></Callout>
  </Marker>
);

// Bus Detail Modal (Simplified)
const BusDetailModal = ({ bus, visible, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <BlurView intensity={80} style={styles.modalBlur}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}><TouchableOpacity onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={24} color="white" /></TouchableOpacity><Text style={styles.modalTitle}>Details</Text></View>
          {bus && <Text style={styles.busName}>{bus.name}</Text>}
        </View>
      </BlurView>
    </View>
  </Modal>
);

export default function MapScreen() {
  const [selectedBus, setSelectedBus] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

  const handleBusPress = useCallback((bus: Bus) => {
    setSelectedBus(bus);
    setDetailModalVisible(true);
    mapRef.current?.animateToRegion({ latitude: bus.latitude, longitude: bus.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
  }, []);

  const resetMapRegion = useCallback(() => {
    mapRef.current?.animateToRegion(initialRegion, 1000);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModalVisible(false);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} showsUserLocation showsMyLocationButton={false} showsCompass={false} >
        {BUSES.map(bus => <BusMarker key={bus.id} bus={bus} onPress={handleBusPress} />)}
        {BUS_STOPS.map(stop => <BusStopMarker key={stop.id} stop={stop} />)}
      </MapView>
      <MapHeader onReset={resetMapRegion} />
      <BusDetailModal bus={selectedBus} visible={detailModalVisible} onClose={closeDetailModal} />
      <TouchableOpacity style={[styles.fab, { bottom: 70 + insets.bottom }]}><Ionicons name="options-outline" size={24} color="white" /></TouchableOpacity>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c242f' },
  map: { ...StyleSheet.absoluteFillObject },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 8, zIndex: 1 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(40, 49, 63, 0.9)', paddingHorizontal: 16, height: 46, borderRadius: 23, marginRight: 12 },
  searchText: { color: '#999', marginLeft: 8, fontSize: 15 },
  mapControlButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(40, 49, 63, 0.9)', justifyContent: 'center', alignItems: 'center' },
  busMarker: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
  stopMarker: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(40, 49, 63, 0.9)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
  stopInner: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#F44336', justifyContent: 'center', alignItems: 'center' },
  calloutContainer: { width: 160, backgroundColor: 'rgba(40, 49, 63, 0.95)', borderRadius: 10, padding: 12, },
  calloutTitle: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  fab: { position: 'absolute', right: 16, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0a7ea4', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalBlur: { width: width * 0.9, height: 'auto', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, backgroundColor: '#28313f', borderRadius: 16, padding: 0,  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  closeButton: { marginRight: 12 },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  busName: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 4 },
});