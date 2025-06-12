import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { useBusStore } from '@/stores/busStore';
import * as Location from 'expo-location';

// API Types for Regulator Endpoints
type ReallocationReason = 'OVERCROWDING' | 'ROUTE_DISRUPTION' | 'MAINTENANCE_REQUIRED' | 'EMERGENCY' | 'SCHEDULE_OPTIMIZATION' | 'OTHER';
type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Location {
  latitude: number;
  longitude: number;
}

interface BusReallocationRequest {
  bus_id: string;
  current_route_id: string;
  requested_route_id: string;
  reason: ReallocationReason;
  description: string;
  priority: Priority;
}

interface OvercrowdingReport {
  bus_stop_id: string;
  bus_id?: string;
  route_id?: string;
  severity: SeverityLevel;
  passenger_count: number;
  description: string;
  location: Location;
}

interface RequestType {
  id: 'REALLOCATION' | 'OVERCROWDING';
  title: string;
  description: string;
  icon: string;
  color: string;
}

export default function RequestsScreen() {
  const { user, token } = useAuthStore();
  const { buses, routes, fetchBuses, fetchRoutes } = useBusStore();
  const { t } = useTranslation();

  // State management
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Bus Reallocation Form State
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [selectedCurrentRoute, setSelectedCurrentRoute] = useState<any>(null);
  const [selectedRequestedRoute, setSelectedRequestedRoute] = useState<any>(null);
  const [reallocationReason, setReallocationReason] = useState<ReallocationReason>('OVERCROWDING');
  const [reallocationDescription, setReallocationDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('NORMAL');

  // Overcrowding Report Form State
  const [selectedBusStop, setSelectedBusStop] = useState<any>(null);
  const [overcrowdingBus, setOvercrowdingBus] = useState<any>(null);
  const [overcrowdingRoute, setOvercrowdingRoute] = useState<any>(null);
  const [severity, setSeverity] = useState<SeverityLevel>('MEDIUM');
  const [passengerCount, setPassengerCount] = useState('');
  const [overcrowdingDescription, setOvercrowdingDescription] = useState('');

  const requestTypes: RequestType[] = [
    {
      id: 'REALLOCATION',
      title: 'Request Bus Reallocation',
      description: 'Request to move a bus from one route to another',
      icon: 'swap-horizontal',
      color: colors.primary,
    },
    {
      id: 'OVERCROWDING',
      title: 'Report Overcrowding',
      description: 'Report overcrowding at a bus stop',
      icon: 'people',
      color: colors.warning,
    },
  ];

  useEffect(() => {
    fetchBuses();
    fetchRoutes();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to submit reports.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleRequestTypeSelect = (requestType: RequestType) => {
    setSelectedRequestType(requestType);
    setIsModalVisible(true);
    if (requestType.id === 'OVERCROWDING') {
      getCurrentLocation();
    }
  };

  const submitBusReallocation = async () => {
    if (!selectedBus || !selectedCurrentRoute || !selectedRequestedRoute || !reallocationDescription.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!selectedBus.id || !selectedCurrentRoute.id || !selectedRequestedRoute.id) {
      Alert.alert('Error', 'Selected items are missing required IDs. Please reselect and try again.');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication required. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: BusReallocationRequest = {
        bus_id: selectedBus.id,
        current_route_id: selectedCurrentRoute.id,
        requested_route_id: selectedRequestedRoute.id,
        reason: reallocationReason,
        description: reallocationDescription,
        priority: priority,
      };

      console.log('🚌 Submitting bus reallocation request:', JSON.stringify(requestData, null, 2));
      console.log('🔑 Using token:', token ? 'Present' : 'Missing');
      console.log('📋 Request validation:');
      console.log('  - Bus ID:', requestData.bus_id);
      console.log('  - Current Route ID:', requestData.current_route_id);
      console.log('  - Requested Route ID:', requestData.requested_route_id);
      console.log('  - Reason:', requestData.reason);
      console.log('  - Priority:', requestData.priority);
      console.log('  - Description length:', requestData.description.length);

      const response = await fetch('https://guzosync-fastapi.onrender.com/api/regulators/request-reallocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.log('API Error response:', errorData);

          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              const validationErrors = errorData.detail.map((err: any) =>
                `${err.loc?.join('.')} - ${err.msg}`
              ).join(', ');
              errorMessage = `Validation Error: ${validationErrors}`;
            } else {
              errorMessage = JSON.stringify(errorData.detail);
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Bus reallocation request submitted:', result);

      Alert.alert(
        'Success',
        'Bus reallocation request submitted successfully. The control center will review your request.',
        [{ text: 'OK', onPress: () => setIsModalVisible(false) }]
      );

      // Reset form
      setSelectedBus(null);
      setSelectedCurrentRoute(null);
      setSelectedRequestedRoute(null);
      setReallocationDescription('');
      setReallocationReason('OVERCROWDING');
      setPriority('NORMAL');

    } catch (error) {
      console.error('❌ Error submitting reallocation request:', error);

      let errorMessage = 'Failed to submit reallocation request';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        console.error('Unknown error type:', typeof error, error);
        errorMessage = 'An unexpected error occurred. Please try again.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOvercrowdingReport = async () => {
    if (!selectedBusStop || !passengerCount || !overcrowdingDescription.trim() || !currentLocation) {
      Alert.alert('Error', 'Please fill in all required fields and ensure location is available');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication required. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reportData: OvercrowdingReport = {
        bus_stop_id: selectedBusStop.id,
        bus_id: overcrowdingBus?.id,
        route_id: overcrowdingRoute?.id,
        severity: severity,
        passenger_count: parseInt(passengerCount),
        description: overcrowdingDescription,
        location: currentLocation,
      };

      const response = await fetch('https://guzosync-fastapi.onrender.com/api/regulators/report-overcrowding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.log('API Error response:', errorData);

          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              const validationErrors = errorData.detail.map((err: any) =>
                `${err.loc?.join('.')} - ${err.msg}`
              ).join(', ');
              errorMessage = `Validation Error: ${validationErrors}`;
            } else {
              errorMessage = JSON.stringify(errorData.detail);
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Overcrowding report submitted:', result);

      Alert.alert(
        'Success',
        'Overcrowding report submitted successfully. The control center has been notified.',
        [{ text: 'OK', onPress: () => setIsModalVisible(false) }]
      );

      // Reset form
      setSelectedBusStop(null);
      setOvercrowdingBus(null);
      setOvercrowdingRoute(null);
      setPassengerCount('');
      setOvercrowdingDescription('');
      setSeverity('MEDIUM');

    } catch (error) {
      console.error('❌ Error submitting overcrowding report:', error);

      let errorMessage = 'Failed to submit overcrowding report';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        console.error('Unknown error type:', typeof error, error);
        errorMessage = 'An unexpected error occurred. Please try again.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (selectedRequestType?.id === 'REALLOCATION') {
      submitBusReallocation();
    } else if (selectedRequestType?.id === 'OVERCROWDING') {
      submitOvercrowdingReport();
    }
  };

  // Removed incident reporting functions - only bus reallocation needed

  // Removed incident reporting helper functions - only bus reallocation needed

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('regulator.requests')}</Text>
          <Text style={styles.subtitle}>Control Center Communication</Text>
        </View>

        {/* Debug info */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 10, color: colors.textSecondary }}>
            Auth: {token ? '✓' : '✗'}
          </Text>
          <Text style={{ fontSize: 10, color: colors.textSecondary }}>
            User: {user?.email || 'None'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Request Types Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regulator Requests</Text>
          <Text style={styles.sectionSubtitle}>Submit requests and reports to the control center</Text>

          <View style={styles.requestTypesContainer}>
            {requestTypes.map((requestType) => (
              <TouchableOpacity
                key={requestType.id}
                style={styles.requestTypeCard}
                onPress={() => handleRequestTypeSelect(requestType)}
              >
                <View style={[styles.iconContainer, { backgroundColor: requestType.color + '20' }]}>
                  <Ionicons
                    name={requestType.icon as any}
                    size={24}
                    color={requestType.color}
                  />
                </View>
                <View style={styles.requestTypeContent}>
                  <Text style={styles.requestTypeTitle}>{requestType.title}</Text>
                  <Text style={styles.requestTypeDescription}>{requestType.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Request Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedRequestType?.title || 'Submit Request'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollView}
            keyboardShouldPersistTaps="handled"
          >
            {selectedRequestType && (
              <View style={styles.selectedTypeContainer}>
                <View style={[styles.iconContainer, { backgroundColor: selectedRequestType.color + '20' }]}>
                  <Ionicons
                    name={selectedRequestType.icon as any}
                    size={24}
                    color={selectedRequestType.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectedTypeTitle}>{selectedRequestType.title}</Text>
                  <Text style={styles.selectedTypeDescription}>{selectedRequestType.description}</Text>
                </View>
              </View>
            )}

            {/* Render form based on request type */}
            {selectedRequestType?.id === 'REALLOCATION' && (
              <>
                {/* Bus Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Select Bus *</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => {
                      if (buses.length > 0) {
                        Alert.alert(
                          'Select Bus',
                          'Choose a bus to reallocate',
                          [
                            ...buses.slice(0, 10).map(bus => ({
                              text: `${bus.name || bus.id} (${bus.id})`,
                              onPress: () => {
                                console.log('Selected bus:', bus);
                                setSelectedBus(bus);
                              }
                            })),
                            { text: 'Cancel', style: 'cancel' as const }
                          ]
                        );
                      } else {
                        Alert.alert('No Buses', 'No buses available. Please try again later.');
                      }
                    }}
                  >
                    <Text style={{ color: selectedBus ? colors.text : colors.textSecondary }}>
                      {selectedBus ? `${selectedBus.name || selectedBus.id} (${selectedBus.id})` : 'Select a bus...'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Current Route Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Current Route *</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => {
                      if (routes.length > 0) {
                        Alert.alert(
                          'Select Current Route',
                          'Choose the current route',
                          [
                            ...routes.slice(0, 10).map(route => ({
                              text: `${route.name || route.id} (${route.id})`,
                              onPress: () => {
                                console.log('Selected current route:', route);
                                setSelectedCurrentRoute(route);
                              }
                            })),
                            { text: 'Cancel', style: 'cancel' as const }
                          ]
                        );
                      } else {
                        Alert.alert('No Routes', 'No routes available. Please try again later.');
                      }
                    }}
                  >
                    <Text style={{ color: selectedCurrentRoute ? colors.text : colors.textSecondary }}>
                      {selectedCurrentRoute ? `${selectedCurrentRoute.name || selectedCurrentRoute.id} (${selectedCurrentRoute.id})` : 'Select current route...'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Requested Route Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Requested Route *</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => {
                      if (routes.length > 0) {
                        Alert.alert(
                          'Select Requested Route',
                          'Choose the destination route',
                          [
                            ...routes.slice(0, 10).map(route => ({
                              text: `${route.name || route.id} (${route.id})`,
                              onPress: () => {
                                console.log('Selected requested route:', route);
                                setSelectedRequestedRoute(route);
                              }
                            })),
                            { text: 'Cancel', style: 'cancel' as const }
                          ]
                        );
                      } else {
                        Alert.alert('No Routes', 'No routes available. Please try again later.');
                      }
                    }}
                  >
                    <Text style={{ color: selectedRequestedRoute ? colors.text : colors.textSecondary }}>
                      {selectedRequestedRoute ? `${selectedRequestedRoute.name || selectedRequestedRoute.id} (${selectedRequestedRoute.id})` : 'Select destination route...'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Reason Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Reason *</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => {
                      const reasons: ReallocationReason[] = ['OVERCROWDING', 'ROUTE_DISRUPTION', 'MAINTENANCE_REQUIRED', 'EMERGENCY', 'SCHEDULE_OPTIMIZATION', 'OTHER'];
                      Alert.alert(
                        'Select Reason',
                        'Choose the reason for reallocation',
                        [
                          ...reasons.map(reason => ({
                            text: reason.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
                            onPress: () => setReallocationReason(reason)
                          })),
                          { text: 'Cancel', style: 'cancel' as const }
                        ]
                      );
                    }}
                  >
                    <Text style={{ color: colors.text }}>
                      {reallocationReason.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Priority Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Priority *</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => {
                      const priorities: Priority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
                      Alert.alert(
                        'Select Priority',
                        'Choose the priority level',
                        [
                          ...priorities.map(p => ({
                            text: p,
                            onPress: () => setPriority(p)
                          })),
                          { text: 'Cancel', style: 'cancel' as const }
                        ]
                      );
                    }}
                  >
                    <Text style={{ color: colors.text }}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Description */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description *</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe the reason for reallocation..."
                    placeholderTextColor={colors.textSecondary + '80'}
                    value={reallocationDescription}
                    onChangeText={setReallocationDescription}
                    multiline
                    textAlignVertical="top"
                    maxLength={500}
                  />
                  <Text style={styles.characterCount}>{reallocationDescription.length}/500</Text>
                </View>
              </>
            )}

            {selectedRequestType?.id === 'OVERCROWDING' && (
              <>
                {/* Bus Stop Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Bus Stop *</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => {
                      // For now, use a simple input. In a real app, you'd have a bus stop selector
                      Alert.prompt(
                        'Bus Stop ID',
                        'Enter the bus stop ID',
                        (text) => {
                          if (text) {
                            setSelectedBusStop({ id: text, name: `Bus Stop ${text}` });
                          }
                        }
                      );
                    }}
                  >
                    <Text style={{ color: selectedBusStop ? colors.text : colors.textSecondary }}>
                      {selectedBusStop ? `${selectedBusStop.name} (${selectedBusStop.id})` : 'Select bus stop...'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Optional Bus Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Related Bus (Optional)</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => {
                      if (buses.length > 0) {
                        Alert.alert(
                          'Select Bus',
                          'Choose a related bus',
                          [
                            ...buses.slice(0, 10).map(bus => ({
                              text: `${bus.name} (${bus.id})`,
                              onPress: () => setOvercrowdingBus(bus)
                            })),
                            { text: 'None', onPress: () => setOvercrowdingBus(null) },
                            { text: 'Cancel', style: 'cancel' as const }
                          ]
                        );
                      }
                    }}
                  >
                    <Text style={{ color: overcrowdingBus ? colors.text : colors.textSecondary }}>
                      {overcrowdingBus ? `${overcrowdingBus.name} (${overcrowdingBus.id})` : 'Select a bus...'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Optional Route Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Related Route (Optional)</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => {
                      if (routes.length > 0) {
                        Alert.alert(
                          'Select Route',
                          'Choose a related route',
                          [
                            ...routes.slice(0, 10).map(route => ({
                              text: `${route.name} (${route.id})`,
                              onPress: () => setOvercrowdingRoute(route)
                            })),
                            { text: 'None', onPress: () => setOvercrowdingRoute(null) },
                            { text: 'Cancel', style: 'cancel' as const }
                          ]
                        );
                      }
                    }}
                  >
                    <Text style={{ color: overcrowdingRoute ? colors.text : colors.textSecondary }}>
                      {overcrowdingRoute ? `${overcrowdingRoute.name} (${overcrowdingRoute.id})` : 'Select a route...'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Severity Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Severity *</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => {
                      const severities: SeverityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
                      Alert.alert(
                        'Select Severity',
                        'Choose the severity level',
                        [
                          ...severities.map(s => ({
                            text: s,
                            onPress: () => setSeverity(s)
                          })),
                          { text: 'Cancel', style: 'cancel' as const }
                        ]
                      );
                    }}
                  >
                    <Text style={{ color: colors.text }}>
                      {severity}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Passenger Count */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Estimated Passenger Count *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., 25"
                    placeholderTextColor={colors.textSecondary + '80'}
                    value={passengerCount}
                    onChangeText={setPassengerCount}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>

                {/* Description */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description *</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe the overcrowding situation..."
                    placeholderTextColor={colors.textSecondary + '80'}
                    value={overcrowdingDescription}
                    onChangeText={setOvercrowdingDescription}
                    multiline
                    textAlignVertical="top"
                    maxLength={500}
                  />
                  <Text style={styles.characterCount}>{overcrowdingDescription.length}/500</Text>
                </View>

                {/* Location status */}
                <View style={styles.infoContainer}>
                  <Ionicons
                    name={currentLocation ? "location" : "location-outline"}
                    size={20}
                    color={currentLocation ? colors.success : colors.warning}
                  />
                  <Text style={styles.infoText}>
                    {currentLocation && currentLocation.latitude && currentLocation.longitude
                      ? `Location: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                      : isLoadingLocation
                        ? 'Getting your location...'
                        : 'Location required - tap to retry'
                    }
                  </Text>
                  {!currentLocation && !isLoadingLocation && (
                    <TouchableOpacity onPress={getCurrentLocation} style={styles.retryButton}>
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                Your request will be sent to the control center for review and response.
              </Text>
            </View>
          </ScrollView>

          {/* Fixed Submit Button */}
          <View style={styles.fixedSubmitButton}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  opacity: (
                    (selectedRequestType?.id === 'REALLOCATION' && selectedBus && selectedCurrentRoute && selectedRequestedRoute && reallocationDescription.trim()) ||
                    (selectedRequestType?.id === 'OVERCROWDING' && selectedBusStop && passengerCount && overcrowdingDescription.trim() && currentLocation)
                  ) && !isSubmitting ? 1 : 0.6
                }
              ]}
              onPress={handleSubmit}
              disabled={
                !(
                  (selectedRequestType?.id === 'REALLOCATION' && selectedBus && selectedCurrentRoute && selectedRequestedRoute && reallocationDescription.trim()) ||
                  (selectedRequestType?.id === 'OVERCROWDING' && selectedBusStop && passengerCount && overcrowdingDescription.trim() && currentLocation)
                ) || isSubmitting
              }
            >
              {isSubmitting ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  requestTypesContainer: {
    gap: 12,
  },
  requestTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: colors.primary + '15',
  },
  requestTypeContent: {
    flex: 1,
  },
  requestTypeTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  requestTypeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  requestCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.card,
  },
  requestDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  responseContainer: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  requestTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalScrollView: {
    paddingBottom: 100, // Extra space for the fixed submit button
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    padding: 8,
    marginLeft: -8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fixedSubmitButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 100, // Space for the fixed submit button
  },
  selectedTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  selectedTypeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.card,
    height: 50,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.card,
    height: 150,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '08',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 21,
  },
  // New styles for the updated UI
  severityContainer: {
    marginTop: 4,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.card,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  relatedInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 8,
  },
  relatedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  relatedInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  timestampContainer: {
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Additional styles for WebSocket functionality
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  connectionStatus: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    minWidth: 60,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // Bus Reallocation Button Styles
  reallocationButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  reallocationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reallocationTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  reallocationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  reallocationDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
