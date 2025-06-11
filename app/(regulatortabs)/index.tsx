import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { useBusStore } from '@/stores/busStore';

interface BusArrival {
  id: string;
  routeNumber: string;
  routeName: string;
  eta: number; // minutes
  busType: string;
  capacity: number;
  currentLoad: number; // percentage
  driverName: string;
  licensePlate: string;
  status: 'on-time' | 'delayed' | 'early';
  lastUpdate: string;
}

interface BusStop {
  id: string;
  name: string;
  location: string;
  queueStatus: 'light' | 'moderate' | 'heavy';
  waitingPassengers: number;
}

export default function ArrivalsScreen() {
  const { user } = useAuthStore();
  const { stops, fetchBusStops, isLoading } = useBusStore();
  const { t } = useTranslation();
  const [arrivals, setArrivals] = useState<BusArrival[]>([]);
  const [assignedStop, setAssignedStop] = useState<BusStop>({
    id: 'stop_001',
    name: 'Stadium Bus Stop',
    location: 'Stadium Area, Addis Ababa',
    queueStatus: 'moderate',
    waitingPassengers: 25
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusArrival | null>(null);
  const [showBusDetails, setShowBusDetails] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
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

  // Assigned stop coordinates (Stadium Bus Stop)
  const assignedStopCoords = { lat: 9.0120276, lng: 38.7570321 };

  // Mock arrivals data
  const mockArrivals: BusArrival[] = [
    {
      id: 'bus_001',
      routeNumber: 'R12',
      routeName: 'Stadium - 4 Kilo',
      eta: 3,
      busType: 'Standard',
      capacity: 45,
      currentLoad: 78,
      driverName: 'Alemayehu Tadesse',
      licensePlate: 'AA-123-456',
      status: 'on-time',
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'bus_002',
      routeNumber: 'R15',
      routeName: 'Stadium - Mercato',
      eta: 7,
      busType: 'Articulated',
      capacity: 80,
      currentLoad: 45,
      driverName: 'Tigist Bekele',
      licensePlate: 'AA-789-012',
      status: 'delayed',
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'bus_003',
      routeNumber: 'R12',
      routeName: 'Stadium - 4 Kilo',
      eta: 12,
      busType: 'Standard',
      capacity: 45,
      currentLoad: 23,
      driverName: 'Dawit Haile',
      licensePlate: 'AA-345-678',
      status: 'early',
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'bus_004',
      routeNumber: 'R18',
      routeName: 'Stadium - Bole',
      eta: 15,
      busType: 'Standard',
      capacity: 45,
      currentLoad: 67,
      driverName: 'Meron Girma',
      licensePlate: 'AA-901-234',
      status: 'on-time',
      lastUpdate: new Date().toISOString()
    }
  ];

  useEffect(() => {
    fetchArrivals();
  }, []);

  const fetchArrivals = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setArrivals(mockArrivals);
    } catch (error) {
      console.error('Error fetching arrivals:', error);
      Alert.alert('Error', 'Failed to load bus arrivals');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCheckInOut = () => {
    setIsCheckedIn(!isCheckedIn);
    const action = !isCheckedIn ? 'checked in' : 'checked out';
    Alert.alert('Attendance', `Successfully ${action} at ${assignedStop.name}`);
  };

  const updateQueueStatus = (status: 'light' | 'moderate' | 'heavy') => {
    setAssignedStop(prev => ({ ...prev, queueStatus: status }));
    Alert.alert('Queue Status Updated', `Queue status updated to ${status}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return colors.success;
      case 'delayed': return colors.error;
      case 'early': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 80) return colors.error;
    if (load >= 60) return colors.warning;
    return colors.success;
  };

  const getQueueColor = (status: string) => {
    switch (status) {
      case 'light': return colors.success;
      case 'moderate': return colors.warning;
      case 'heavy': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const formatTime = (eta: number) => {
    if (eta < 1) return 'Arriving';
    if (eta === 1) return '1 min';
    return `${eta} mins`;
  };

  const toggleMapFullScreen = () => {
    setMapFullScreen(!isMapFullScreen);
  };

  const renderBusArrival = ({ item }: { item: BusArrival }) => (
    <TouchableOpacity
      style={styles.busCard}
      onPress={() => {
        setSelectedBus(item);
        setShowBusDetails(true);
      }}
    >
      <View style={styles.busHeader}>
        <View style={styles.routeInfo}>
          <Text style={styles.routeNumber}>{item.routeNumber}</Text>
          <Text style={styles.routeName}>{item.routeName}</Text>
        </View>
        <View style={styles.etaContainer}>
          <Text style={styles.etaTime}>{formatTime(item.eta)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.busDetails}>
        <View style={styles.busInfo}>
          <Ionicons name="bus" size={16} color={colors.textSecondary} />
          <Text style={styles.busInfoText}>{item.busType} • {item.capacity} seats</Text>
        </View>
        <View style={styles.loadInfo}>
          <Text style={styles.loadLabel}>Load:</Text>
          <View style={styles.loadBar}>
            <View
              style={[
                styles.loadFill,
                {
                  width: `${item.currentLoad}%`,
                  backgroundColor: getLoadColor(item.currentLoad)
                }
              ]}
            />
          </View>
          <Text style={[styles.loadText, { color: getLoadColor(item.currentLoad) }]}>
            {item.currentLoad}%
          </Text>
        </View>
      </View>

      <View style={styles.driverInfo}>
        <Ionicons name="person" size={14} color={colors.textSecondary} />
        <Text style={styles.driverText}>{item.driverName} • {item.licensePlate}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('regulator.title')}</Text>
          <Text style={styles.subtitle}>{assignedStop.name}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkInButton, { backgroundColor: isCheckedIn ? colors.success : colors.primary }]}
          onPress={handleCheckInOut}
        >
          <Ionicons name={isCheckedIn ? "checkmark-circle" : "log-in"} size={20} color={colors.card} />
          <Text style={styles.checkInText}>
            {isCheckedIn ? 'Checked In' : 'Check In'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
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
                    center: [${assignedStopCoords.lng}, ${assignedStopCoords.lat}],
                    zoom: 15
                  });

                  // Add assigned stop marker (larger, special marker)
                  const assignedStopEl = document.createElement('div');
                  assignedStopEl.className = 'assigned-stop-marker';
                  assignedStopEl.style.backgroundImage = 'url(data:image/svg+xml;base64,' + btoa(\`
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="#DC2626" stroke="#ffffff" stroke-width="3"/>
                      <rect x="8" y="10" width="16" height="12" rx="2" fill="#ffffff"/>
                      <rect x="10" y="12" width="4" height="3" fill="#DC2626"/>
                      <rect x="18" y="12" width="4" height="3" fill="#DC2626"/>
                      <circle cx="12" cy="19" r="1.5" fill="#DC2626"/>
                      <circle cx="20" cy="19" r="1.5" fill="#DC2626"/>
                      <rect x="14" y="17" width="4" height="1" fill="#DC2626"/>
                      <path d="M16 6v4" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  \`) + ')';
                  assignedStopEl.style.width = '32px';
                  assignedStopEl.style.height = '32px';
                  assignedStopEl.style.backgroundSize = 'contain';
                  assignedStopEl.style.cursor = 'pointer';

                  // Create popup for assigned stop
                  const assignedPopup = new mapboxgl.Popup({
                    offset: 25,
                    closeButton: true,
                    closeOnClick: false
                  }).setHTML(\`
                    <div class="popup-title">📍 Your Assigned Stop</div>
                    <div class="popup-info">
                      <strong>${assignedStop.name}</strong><br>
                      ${assignedStop.location}<br>
                      Queue Status: <span style="color: \${assignedStop.queueStatus === 'light' ? '#10B981' : assignedStop.queueStatus === 'moderate' ? '#F59E0B' : '#EF4444'}">\${assignedStop.queueStatus.toUpperCase()}</span><br>
                      Waiting: ${assignedStop.waitingPassengers} passengers
                    </div>
                  \`);

                  // Add assigned stop marker
                  new mapboxgl.Marker(assignedStopEl)
                    .setLngLat([${assignedStopCoords.lng}, ${assignedStopCoords.lat}])
                    .setPopup(assignedPopup)
                    .addTo(map);

                  // Add other bus stops
                  const busStops = ${JSON.stringify(busStopsForMap)};
                  console.log('Regulator dashboard - Bus stops data:', busStops);
                  console.log('Regulator dashboard - Number of bus stops:', busStops.length);

                  busStops.forEach((stop, index) => {
                    console.log('Regulator dashboard - Processing stop', index + 1, ':', stop.name, 'at coordinates:', stop.coordinates);
                    // Skip if this is the assigned stop
                    if (stop.name === '${assignedStop.name}') return;

                    // Create a custom bus stop marker
                    const el = document.createElement('div');
                    el.className = 'bus-stop-marker';
                    el.style.backgroundImage = 'url(data:image/svg+xml;base64,' + btoa(\`
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="6" width="16" height="12" rx="2" fill="#2563EB" stroke="#ffffff" stroke-width="2"/>
                        <rect x="6" y="8" width="4" height="3" fill="#ffffff"/>
                        <rect x="14" y="8" width="4" height="3" fill="#ffffff"/>
                        <circle cx="8" cy="16" r="1.5" fill="#ffffff"/>
                        <circle cx="16" cy="16" r="1.5" fill="#ffffff"/>
                        <rect x="10" y="14" width="4" height="1" fill="#ffffff"/>
                        <path d="M12 4v2" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    \`) + ')';
                    el.style.width = '20px';
                    el.style.height = '20px';
                    el.style.backgroundSize = 'contain';
                    el.style.cursor = 'pointer';

                    // Create popup content
                    const popupContent = \`
                      <div class="popup-title">\${stop.name}</div>
                      <div class="popup-info">
                        \${stop.properties?.operator ? 'Operator: ' + stop.properties.operator + '<br>' : ''}
                        \${stop.properties?.['ref:AB'] ? 'Routes: ' + stop.properties['ref:AB'] + '<br>' : ''}
                        \${stop.properties?.network ? 'Network: ' + stop.properties.network : ''}
                      </div>
                    \`;

                    // Create popup
                    const popup = new mapboxgl.Popup({
                      offset: 25,
                      closeButton: true,
                      closeOnClick: false
                    }).setHTML(popupContent);

                    // Add marker to map
                    new mapboxgl.Marker(el)
                      .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
                      .setPopup(popup)
                      .addTo(map);
                  });
                </script>
              </body>
              </html>`
          }}
          style={styles.map}
          originWhitelist={["*"]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
        <TouchableOpacity onPress={toggleMapFullScreen} style={styles.fullScreenButton}>
          {isMapFullScreen ? <Ionicons name="contract" color={colors.primary} size={24}/> : <Ionicons name="expand" color={colors.primary} size={24}/>}
        </TouchableOpacity>
      </View>

      {/* Stop Status */}
      <View style={styles.stopStatus}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Queue Status</Text>
          <View style={styles.queueButtons}>
            {['light', 'moderate', 'heavy'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.queueButton,
                  { backgroundColor: assignedStop.queueStatus === status ? getQueueColor(status) : colors.border }
                ]}
                onPress={() => updateQueueStatus(status as any)}
              >
                <Text style={[
                  styles.queueButtonText,
                  { color: assignedStop.queueStatus === status ? colors.card : colors.text }
                ]}>
                  {status.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.waitingInfo}>
          <Ionicons name="people" size={20} color={colors.primary} />
          <Text style={styles.waitingText}>{assignedStop.waitingPassengers} waiting passengers</Text>
        </View>
      </View>

      {/* Bus Arrivals List */}
      <FlatList
        data={arrivals}
        renderItem={renderBusArrival}
        keyExtractor={(item) => item.id}
        style={styles.arrivalsList}
        contentContainerStyle={styles.arrivalsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchArrivals} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bus-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No buses arriving</Text>
            <Text style={styles.emptySubtext}>Pull to refresh for updates</Text>
          </View>
        }
      />

      {/* Bus Details Modal */}
      <Modal
        visible={showBusDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBusDetails(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBusDetails(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bus Details</Text>
            <View style={{ width: 60 }} />
          </View>

          {selectedBus && (
            <View style={styles.modalContent}>
              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Route Information</Text>
                <Text style={styles.detailText}>Route: {selectedBus.routeNumber}</Text>
                <Text style={styles.detailText}>Name: {selectedBus.routeName}</Text>
                <Text style={styles.detailText}>ETA: {formatTime(selectedBus.eta)}</Text>
                <Text style={styles.detailText}>Status: {selectedBus.status}</Text>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Bus Information</Text>
                <Text style={styles.detailText}>Type: {selectedBus.busType}</Text>
                <Text style={styles.detailText}>Capacity: {selectedBus.capacity} passengers</Text>
                <Text style={styles.detailText}>Current Load: {selectedBus.currentLoad}%</Text>
                <Text style={styles.detailText}>License Plate: {selectedBus.licensePlate}</Text>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Driver Information</Text>
                <Text style={styles.detailText}>Name: {selectedBus.driverName}</Text>
                <Text style={styles.detailText}>Last Update: {new Date(selectedBus.lastUpdate).toLocaleTimeString()}</Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  checkInText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  stopStatus: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusItem: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  queueButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  queueButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  queueButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  waitingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waitingText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  arrivalsList: {
    flex: 1,
  },
  arrivalsContent: {
    padding: 16,
  },
  busCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  busHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  routeName: {
    fontSize: 14,
    color: colors.text,
  },
  etaContainer: {
    alignItems: 'flex-end',
  },
  etaTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.card,
  },
  busDetails: {
    marginBottom: 12,
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  busInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  loadBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  loadFill: {
    height: '100%',
    borderRadius: 4,
  },
  loadText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    fontSize: 16,
    color: colors.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  // Map Styles
  mapContainer: {
    height: 200,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    flex: 1,
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
});
