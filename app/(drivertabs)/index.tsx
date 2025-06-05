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
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

export default function DriverMapScreen() {
  const {} = useAuthStore();
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 9.0301, lng: 38.7578 });
  const [routeStatus, setRouteStatus] = useState<'on-time' | 'delayed' | 'early'>('on-time');
  const [passengerCount] = useState(0);
  const [isMapFullScreen, setMapFullScreen] = useState(false);
  

  useEffect(() => {
    // Simulate location updates when on duty
    if (isOnDuty) {
      const interval = setInterval(() => {
        // Simulate slight location changes
        setCurrentLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001,
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isOnDuty]);

  const toggleDutyStatus = () => {
    setIsOnDuty(!isOnDuty);
    if (!isOnDuty) {
      Alert.alert('On Duty', 'You are now on duty. Your location will be shared with passengers.');
    } else {
      Alert.alert('Off Duty', 'You are now off duty. Location sharing has stopped.');
    }
  };

  const updateRouteStatus = (status: 'on-time' | 'delayed' | 'early') => {
    setRouteStatus(status);
    Alert.alert('Status Updated', `Route status updated to ${status}`);
  };

  const sendEmergencyAlert = () => {
    Alert.alert(
      'Emergency Alert',
      'Are you sure you want to send an emergency alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Emergency Alert Sent', 'Dispatch has been notified of your emergency.');
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return colors.success;
      case 'delayed': return colors.error;
      case 'early': return colors.warning;
      default: return colors.textSecondary;
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
          <Text style={styles.title}>Driver Dashboard</Text>
          <Text style={styles.subtitle}>Route Management & Navigation</Text>
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
      <View style={styles.mapContainer}>
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
                  mapboxgl.accessToken = 'pk.eyJ1IjoiYmFza2V0bzEyMyIsImEiOiJjbTlqZWVsdzQwZWs5MmtyMDN0b29jMjU1In0.CUIyg0uNKnAfe55aXJ0bBA';
                  const map = new mapboxgl.Map({
                    container: 'map',
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [${currentLocation.lng}, ${currentLocation.lat}],
                    zoom: 15
                  });

                  // Add driver location marker
                  new mapboxgl.Marker({ color: '#2563EB' })
                    .setLngLat([${currentLocation.lng}, ${currentLocation.lat}])
                    .addTo(map);
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

      {/* Status Panel */}
      <View style={styles.statusPanel}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Route Status</Text>
            <View style={styles.statusButtons}>
              {['on-time', 'delayed', 'early'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    { backgroundColor: routeStatus === status ? getStatusColor(status) : colors.border }
                  ]}
                  onPress={() => updateRouteStatus(status as any)}
                >
                  <Text style={[
                    styles.statusButtonText,
                    { color: routeStatus === status ? colors.card : colors.text }
                  ]}>
                    {status.replace('-', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.emergencyButton} onPress={sendEmergencyAlert}>
            <Ionicons name="warning" size={20} color={colors.card} />
            <Text style={styles.emergencyButtonText}>Emergency</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="people" size={20} color={colors.primary} />
            <Text style={styles.actionButtonText}>Passengers: {passengerCount}</Text>
          </TouchableOpacity>
        </View>
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
  backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
  padding: 8,
  borderRadius: 20, // Circular button
  zIndex: 11, // Ensure button is on top of the map
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
  statusPanel: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
  },
  statusRow: {
    marginBottom: 16,
  },
  statusItem: {
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  emergencyButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  emergencyButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.highlight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
