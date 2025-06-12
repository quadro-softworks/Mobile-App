import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import * as Location from 'expo-location';

// API Types based on the endpoint schema
type IncidentType = 'VEHICLE_ISSUE' | 'ROUTE_DISRUPTION' | 'PASSENGER_INCIDENT' | 'INFRASTRUCTURE_ISSUE' | 'OVERCROWDING' | 'SAFETY_CONCERN';
type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Location {
  latitude: number;
  longitude: number;
}

interface IssueReport {
  description: string;
  incident_type: IncidentType;
  location: Location;
  related_bus_id?: string;
  related_route_id?: string;
  severity: SeverityLevel;
}

interface IssueResponse {
  created_at: string;
  updated_at: string;
  id: string;
  reported_by_user_id: string;
  description: string;
  incident_type: IncidentType;
  location: Location;
  related_bus_id?: string;
  related_route_id?: string;
  is_resolved: boolean;
  resolution_notes?: string;
  severity: SeverityLevel;
}

interface RequestType {
  id: IncidentType;
  title: string;
  description: string;
  icon: string;
  color: string;
  severity: SeverityLevel;
}

export default function RequestsScreen() {
  const { user, token } = useAuthStore();
  const { t } = useTranslation();

  const [requests, setRequests] = useState<IssueResponse[]>([]);
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [requestDescription, setRequestDescription] = useState('');
  const [passengerCount, setPassengerCount] = useState('');
  const [busId, setBusId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const requestTypes: RequestType[] = [
    {
      id: 'OVERCROWDING',
      title: 'Report Overcrowding',
      description: 'Report passenger overcrowding at your stop',
      icon: 'people',
      color: colors.warning,
      severity: 'MEDIUM',
    },
    {
      id: 'VEHICLE_ISSUE',
      title: 'Vehicle Problem',
      description: 'Report bus mechanical issues or breakdowns',
      icon: 'bus',
      color: colors.error,
      severity: 'HIGH',
    },
    {
      id: 'ROUTE_DISRUPTION',
      title: 'Route Disruption',
      description: 'Report road closures or route changes',
      icon: 'warning',
      color: colors.warning,
      severity: 'MEDIUM',
    },
    {
      id: 'SAFETY_CONCERN',
      title: 'Safety Issue',
      description: 'Report safety concerns or incidents',
      icon: 'shield',
      color: colors.error,
      severity: 'HIGH',
    },
    {
      id: 'INFRASTRUCTURE_ISSUE',
      title: 'Infrastructure Problem',
      description: 'Report bus stop or infrastructure issues',
      icon: 'construct',
      color: colors.warning,
      severity: 'MEDIUM',
    },
    {
      id: 'PASSENGER_INCIDENT',
      title: 'Passenger Incident',
      description: 'Report passenger-related incidents',
      icon: 'person',
      color: colors.error,
      severity: 'HIGH',
    },
  ];

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to report issues.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleRequestTypeSelect = (requestType: RequestType) => {
    setSelectedRequestType(requestType);
    setIsModalVisible(true);
  };

  const submitRequest = async () => {
    if (!selectedRequestType || !requestDescription.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Error', 'Location is required. Please enable location services.');
      return;
    }

    // Require passengerCount for overcrowding
    if (selectedRequestType.id === 'OVERCROWDING' && !passengerCount.trim()) {
      Alert.alert('Error', 'Estimated Passenger Count is required');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication required. Please log in again.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Always use 'VEHICLE_ISSUE' for API submission
      const apiIncidentType: IncidentType = 'VEHICLE_ISSUE';
      let description = requestDescription.trim();
      // Add original type to description for context
      if (selectedRequestType && selectedRequestType.id !== 'VEHICLE_ISSUE') {
        description = `[${selectedRequestType.title}] ${description}`;
      }

      const issueReport: IssueReport = {
        description,
        incident_type: apiIncidentType,
        location: currentLocation,
        severity: selectedRequestType.severity,
        ...(busId.trim() && { related_bus_id: busId.trim() }),
        ...(routeId.trim() && { related_route_id: routeId.trim() }),
      };

      console.log('Submitting issue report:', JSON.stringify(issueReport, null, 2));
      console.log('Auth token present:', !!token);
      console.log('Auth token length:', token?.length);

      // Validate the payload
      if (!issueReport.description || issueReport.description.length < 10) {
        throw new Error('Description must be at least 10 characters long');
      }

      if (!issueReport.location || typeof issueReport.location.latitude !== 'number' || typeof issueReport.location.longitude !== 'number') {
        throw new Error('Valid location is required');
      }

      if (!['VEHICLE_ISSUE', 'ROUTE_DISRUPTION', 'PASSENGER_INCIDENT', 'INFRASTRUCTURE_ISSUE', 'OVERCROWDING', 'SAFETY_CONCERN'].includes(issueReport.incident_type)) {
        throw new Error('Invalid incident type');
      }

      if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(issueReport.severity)) {
        throw new Error('Invalid severity level');
      }

      const response = await fetch('https://guzosync-fastapi.onrender.com/api/issues/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(issueReport),
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          console.log('Validation Error response:', errorData);

          if (errorData.detail && Array.isArray(errorData.detail)) {
            const validationErrors = errorData.detail
              .map((err: any) => `${err.loc?.join('.')} - ${err.msg}`)
              .join(', ');
            throw new Error(`Validation Error: ${validationErrors}`);
          }
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const newIssue: IssueResponse = await response.json();
      console.log('Issue submitted successfully:', newIssue);

      // Add to local state
      setRequests(prev => [newIssue, ...prev]);

      // Reset form
      setSelectedRequestType(null);
      setRequestDescription('');
      setPassengerCount('');
      setBusId('');
      setRouteId('');
      setIsModalVisible(false);

      Alert.alert('Success', 'Issue reported successfully. You will be notified when it is resolved.');
    } catch (error) {
      console.error('Error submitting request:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);

      let errorMessage = 'Failed to submit report';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        try {
          errorMessage = JSON.stringify(error);
        } catch {
          errorMessage = 'Unknown error occurred';
        }
      }

      console.error('Final error message:', errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (isResolved: boolean) => {
    return isResolved ? colors.success : colors.warning;
  };

  const getStatusText = (isResolved: boolean) => {
    return isResolved ? 'RESOLVED' : 'PENDING';
  };

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'LOW': return colors.success;
      case 'MEDIUM': return colors.warning;
      case 'HIGH': return colors.error;
      case 'CRITICAL': return '#8B0000'; // Dark red
      default: return colors.textSecondary;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getIncidentTypeTitle = (incidentType: IncidentType) => {
    const type = requestTypes.find(t => t.id === incidentType);
    return type?.title || incidentType.replace('_', ' ');
  };

  const renderRequestType = (requestType: RequestType) => (
    <TouchableOpacity
      key={requestType.id}
      style={styles.requestTypeCard}
      onPress={() => handleRequestTypeSelect(requestType)}
    >
      <View style={[styles.iconContainer, { backgroundColor: requestType.color + '20' }]}>
        <Ionicons name={requestType.icon as any} size={24} color={requestType.color} />
      </View>
      <View style={styles.requestTypeContent}>
        <Text style={styles.requestTypeTitle}>{requestType.title}</Text>
        <Text style={styles.requestTypeDescription}>{requestType.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderRequest = ({ item }: { item: IssueResponse }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.requestTitle}>{getIncidentTypeTitle(item.incident_type)}</Text>
          <View style={styles.severityContainer}>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
              <Text style={styles.severityText}>{item.severity}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.is_resolved) }]}>
          <Text style={styles.statusText}>{getStatusText(item.is_resolved)}</Text>
        </View>
      </View>
      <Text style={styles.requestDescription}>{item.description}</Text>

      {/* Location info */}
      <View style={styles.locationContainer}>
        <Ionicons name="location" size={14} color={colors.textSecondary} />
        <Text style={styles.locationText}>
          {item.location.latitude.toFixed(6)}, {item.location.longitude.toFixed(6)}
        </Text>
      </View>

      {/* Related bus/route info */}
      {(item.related_bus_id || item.related_route_id) && (
        <View style={styles.relatedInfoContainer}>
          {item.related_bus_id && (
            <View style={styles.relatedInfo}>
              <Ionicons name="bus" size={14} color={colors.textSecondary} />
              <Text style={styles.relatedInfoText}>Bus: {item.related_bus_id}</Text>
            </View>
          )}
          {item.related_route_id && (
            <View style={styles.relatedInfo}>
              <Ionicons name="map" size={14} color={colors.textSecondary} />
              <Text style={styles.relatedInfoText}>Route: {item.related_route_id}</Text>
            </View>
          )}
        </View>
      )}

      {/* Resolution notes */}
      {item.resolution_notes && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Resolution:</Text>
          <Text style={styles.responseText}>{item.resolution_notes}</Text>
        </View>
      )}

      <View style={styles.timestampContainer}>
        <Text style={styles.requestTimestamp}>
          Reported: {formatDate(item.created_at)}
        </Text>
        {item.updated_at !== item.created_at && (
          <Text style={styles.requestTimestamp}>
            Updated: {formatDate(item.updated_at)}
          </Text>
        )}
      </View>
    </View>
  );

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
            Location: {currentLocation ? '✓' : '✗'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overcrowding Reports Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submit Request</Text>
          <Text style={styles.sectionSubtitle}>Report passenger overcrowding at your stop</Text>

          <View style={styles.requestTypesContainer}>
            {requestTypes.map(renderRequestType)}
          </View>
        </View>

        {requests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Request History</Text>
            <Text style={styles.sectionSubtitle}>Your submitted reports and their status</Text>

            <FlatList
              data={requests}
              renderItem={renderRequest}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
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
            <Text style={styles.modalTitle}>Submit Request</Text>
            {/* Removed header submit button */}
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

            {/* Overcrowding specific fields */}
            {selectedRequestType?.id === 'OVERCROWDING' && (
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
            )}

            {/* Optional Bus ID field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Related Bus ID (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., BUS001"
                placeholderTextColor={colors.textSecondary + '80'}
                value={busId}
                onChangeText={setBusId}
                maxLength={20}
              />
            </View>

            {/* Optional Route ID field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Related Route ID (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., ROUTE001"
                placeholderTextColor={colors.textSecondary + '80'}
                value={routeId}
                onChangeText={setRouteId}
                maxLength={20}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe the situation in detail..."
                placeholderTextColor={colors.textSecondary + '80'}
                value={requestDescription}
                onChangeText={setRequestDescription}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.characterCount}>{requestDescription.length}/500</Text>
            </View>

            {/* Location status */}
            <View style={styles.infoContainer}>
              <Ionicons
                name={currentLocation ? "location" : "location-outline"}
                size={20}
                color={currentLocation ? colors.success : colors.warning}
              />
              <Text style={styles.infoText}>
                {currentLocation
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

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                Your report will be sent to the control center for review and response.
              </Text>
            </View>
          </ScrollView>

          {/* Fixed Submit Button */}
          <View style={styles.fixedSubmitButton}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  opacity: (requestDescription.trim() && currentLocation && !isSubmitting) ? 1 : 0.6
                }
              ]}
              onPress={submitRequest}
              disabled={!requestDescription.trim() || !currentLocation || isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Submit Report</Text>
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
});
