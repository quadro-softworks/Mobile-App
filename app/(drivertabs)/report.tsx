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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import * as Location from 'expo-location';
import { colors } from '@/constants/colors';
import { useIncidentStore } from '@/stores/incidentStore';
import { CreateIncidentRequest, IncidentLocation, incidentApi } from '@/services/incidentApi';
import { useWebSocketNotifications } from '@/hooks/useWebSocketNotifications';
// import { manualTest } from '@/utils/websocket-test';

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface Report {
  id: string;
  type: string;
  title: string;
  description: string;
  location?: IncidentLocation;
  timestamp: string;
  status: 'pending' | 'submitted' | 'resolved';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default function ReportScreen() {
  // Store hooks
  const { reportIncident, fetchUserIncidents, incidents, isLoading: incidentLoading, error: incidentError } = useIncidentStore();
  const { t } = useTranslation();

  // WebSocket for real-time incident reporting
  const { sendIncidentReport, isConnected, connectionStatus } = useWebSocketNotifications({
    onIncidentReported: (incident) => {
      console.log('🚨 Incident reported via WebSocket:', incident.title);
      // Refresh incidents list when new incident is reported
      fetchUserIncidents();
    }
  });

  // Additional connection status monitoring
  const [realTimeStatus, setRealTimeStatus] = useState<'Active' | 'Connecting' | 'Offline'>('Offline');

  useEffect(() => {
    const updateStatus = () => {
      if (isConnected) {
        setRealTimeStatus('Active');
      } else if (connectionStatus === 'connecting') {
        setRealTimeStatus('Connecting');
      } else {
        setRealTimeStatus('Offline');
      }
    };

    updateStatus();

    // Check status every 2 seconds
    const statusInterval = setInterval(updateStatus, 2000);

    return () => clearInterval(statusInterval);
  }, [isConnected, connectionStatus]);

  // Form state
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [reportDescription, setReportDescription] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [currentLocation, setCurrentLocation] = useState<IncidentLocation | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isRefreshingReports, setIsRefreshingReports] = useState(false);

  // Local state for display
  const [reports, setReports] = useState<Report[]>([]);

  // Load data on component mount
  useEffect(() => {
    fetchUserIncidents();
    getCurrentLocation();
  }, [fetchUserIncidents]);

  // Convert incidents to reports for display
  useEffect(() => {
    const convertedReports: Report[] = incidents.map(incident => ({
      id: incident.id,
      type: 'incident',
      title: 'Incident Report',
      description: incident.description,
      location: incident.location,
      timestamp: incident.created_at,
      status: incident.is_resolved ? 'resolved' : 'submitted',
      severity: incident.severity,
    }));
    setReports(convertedReports);
  }, [incidents]);

  // Show error if incident API fails
  useEffect(() => {
    if (incidentError) {
      Alert.alert('Error', incidentError);
    }
  }, [incidentError]);

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to report incidents.');
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
      Alert.alert('Location Error', 'Failed to get current location. Please try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const refreshReports = async () => {
    setIsRefreshingReports(true);
    try {
      await fetchUserIncidents();
    } catch (error) {
      console.error('Error refreshing reports:', error);
    } finally {
      setIsRefreshingReports(false);
    }
  };

  const debugAuth = async () => {
    try {
      await incidentApi.debugAuthToken();
    } catch (error) {
      console.error('Debug auth error:', error);
    }
  };

  const manualTest = () => {
    console.log('🧪 Manual WebSocket test triggered');
    if (isConnected) {
      // Send a test incident report via WebSocket
      sendIncidentReport({
        description: 'Test incident report from manual test',
        incident_type: 'VEHICLE_ISSUE',
        severity: 'LOW',
        location: currentLocation || { latitude: 9.032, longitude: 38.7469 },
      });
      Alert.alert('Test Sent', 'Test incident report sent via WebSocket');
    } else {
      Alert.alert('WebSocket Offline', 'WebSocket is not connected. Cannot send test.');
    }
  };

  const reportTypes: ReportType[] = [
    {
      id: 'vehicle_issue',
      title: t('driver.vehicleIssue'),
      description: 'Mechanical problems, maintenance needs',
      icon: 'car-sport',
      color: colors.error,
    },
    {
      id: 'safety_concern',
      title: 'Safety Concern',
      description: 'Hazards, security issues',
      icon: 'shield-checkmark',
      color: colors.error,
    },
    {
      id: 'other',
      title: t('driver.other'),
      description: 'General reports and feedback',
      icon: 'document-text',
      color: colors.textSecondary,
    },
  ];

  const handleReportTypeSelect = (reportType: ReportType) => {
    setSelectedReportType(reportType);
    setIsModalVisible(true);
  };

  const submitReport = async () => {
    if (!selectedReportType || !reportDescription.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Error', 'Location is required. Please enable location services and try again.');
      return;
    }

    try {
      const incidentData: CreateIncidentRequest = {
        description: reportDescription.trim(),
        incident_type: 'VEHICLE_ISSUE',
        location: currentLocation,
        severity: selectedSeverity,
      };

      // Submit via API
      await reportIncident(incidentData);

      // Also send via WebSocket for real-time notifications
      if (isConnected) {
        sendIncidentReport({
          description: reportDescription.trim(),
          incident_type: 'VEHICLE_ISSUE',
          severity: selectedSeverity,
          location: currentLocation,
        });
        console.log('🚨 Incident also sent via WebSocket for real-time notifications');
      }

      // Reset form
      setSelectedReportType(null);
      setReportDescription('');
      setSelectedSeverity('LOW');
      setIsModalVisible(false);

      Alert.alert('Success', 'Incident reported successfully');
    } catch (error) {
      console.error('Error submitting report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit report';
      Alert.alert('Error', errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'submitted': return colors.primary;
      case 'resolved': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderReportType = (reportType: ReportType) => (
    <TouchableOpacity
      key={reportType.id}
      style={styles.reportTypeCard}
      onPress={() => handleReportTypeSelect(reportType)}
    >
      <View style={[styles.iconContainer, { backgroundColor: reportType.color + '20' }]}>
        <Ionicons name={reportType.icon as any} size={24} color={reportType.color} />
      </View>
      <View style={styles.reportTypeContent}>
        <Text style={styles.reportTypeTitle}>{reportType.title}</Text>
        <Text style={styles.reportTypeDescription}>{reportType.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return colors.error;
      case 'MEDIUM': return colors.warning;
      case 'LOW': return colors.success;
      default: return colors.textSecondary;
    }
  };



  const renderReport = (report: Report) => (
    <View key={report.id} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleContainer}>
          <Text style={styles.reportTitle}>Vehicle Issue Report</Text>
          <View style={styles.reportBadges}>
            {report.severity && (
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(report.severity) }]}>
                <Text style={styles.severityText}>{report.severity}</Text>
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
              <Text style={styles.statusText}>{report.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.reportDescription}>{report.description}</Text>

      {/* Location */}
      {report.location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={14} color={colors.textSecondary} />
          <Text style={styles.locationText}>
            {typeof report.location === 'object'
              ? `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`
              : report.location
            }
          </Text>
        </View>
      )}

      <View style={styles.reportFooter}>
        <Text style={styles.reportTimestamp}>{formatDate(report.timestamp)}</Text>
        <Text style={styles.reportId}>ID: {report.id.slice(-8)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('driver.report')}</Text>
          <Text style={styles.subtitle}>{t('driver.reportIssue')}</Text>
          <Text style={[styles.connectionStatus, { color: realTimeStatus === 'Active' ? colors.success : realTimeStatus === 'Connecting' ? colors.warning : colors.error }]}>
            📡 Real-time reporting: {realTimeStatus}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report an Issue</Text>
          <Text style={styles.sectionSubtitle}>Select the type of issue you want to report</Text>
          
          <View style={styles.reportTypesContainer}>
            {reportTypes.map(renderReportType)}
          </View>
        </View>

        {/* Reports History Section */}
        <View style={styles.section}>
          <View style={styles.reportsHeader}>
            <View>
              <Text style={styles.sectionTitle}>Report History</Text>
              <Text style={styles.sectionSubtitle}>
                {reports.length > 0
                  ? `${reports.length} report${reports.length === 1 ? '' : 's'} submitted`
                  : 'No reports submitted yet'
                }
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => manualTest()}
              >
                <Text style={{ fontSize: 10, color: colors.primary }}>WS TEST</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => {
                  console.log('🔄 Force reconnecting WebSocket...');
                  const { busTrackingSocket } = require('@/utils/socket');
                  busTrackingSocket.forceReconnect();
                }}
              >
                <Text style={{ fontSize: 10, color: colors.primary }}>RECONNECT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={debugAuth}
              >
                <Text style={{ fontSize: 10, color: colors.primary }}>DEBUG</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={refreshReports}
                disabled={isRefreshingReports || incidentLoading}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={isRefreshingReports ? colors.textSecondary : colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {incidentLoading || isRefreshingReports ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading reports...</Text>
            </View>
          ) : reports.length > 0 ? (
            <View style={styles.reportsContainer}>
              {reports.map(renderReport)}
            </View>
          ) : (
            <View style={styles.emptyReportsContainer}>
              <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyReportsText}>No reports yet</Text>
              <Text style={styles.emptyReportsSubtext}>
                Your submitted incident reports will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Report Modal */}
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
            <Text style={styles.modalTitle}>Submit Report</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedReportType && (
              <View style={styles.selectedTypeContainer}>
                <View style={[styles.iconContainer, { backgroundColor: selectedReportType.color + '20' }]}>
                  <Ionicons name={selectedReportType.icon as any} size={24} color={selectedReportType.color} />
                </View>
                <View>
                  <Text style={styles.selectedTypeTitle}>{selectedReportType.title}</Text>
                  <Text style={styles.selectedTypeDescription}>{selectedReportType.description}</Text>
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe the issue in detail..."
                value={reportDescription}
                onChangeText={setReportDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.characterCount}>{reportDescription.length}/500</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Severity *</Text>
              <View style={styles.severityContainer}>
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((severity) => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.severityOption,
                      selectedSeverity === severity && styles.selectedSeverityOption
                    ]}
                    onPress={() => setSelectedSeverity(severity)}
                  >
                    <Text style={[
                      styles.severityOptionText,
                      selectedSeverity === severity && styles.selectedSeverityOptionText
                    ]}>
                      {severity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>



            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location</Text>
              <View style={styles.locationInfo}>
                {isGettingLocation ? (
                  <View style={styles.locationLoading}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.locationLoadingText}>Getting location...</Text>
                  </View>
                ) : currentLocation ? (
                  <View style={styles.locationDisplay}>
                    <Ionicons name="location" size={16} color={colors.success} />
                    <Text style={styles.locationText}>
                      {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.locationRetry} onPress={getCurrentLocation}>
                    <Ionicons name="refresh" size={16} color={colors.primary} />
                    <Text style={styles.locationRetryText}>Retry getting location</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButtonContainer,
                (incidentLoading || !currentLocation) && styles.submitButtonDisabled
              ]}
              onPress={submitReport}
              disabled={incidentLoading || !currentLocation}
            >
              {incidentLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Report</Text>
              )}
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                Your report will be sent to the dispatch center and relevant authorities for review.
              </Text>
            </View>
          </ScrollView>
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
  reportTypesContainer: {
    gap: 12,
  },
  reportTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportTypeContent: {
    flex: 1,
  },
  reportTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  reportTypeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reportsContainer: {
    gap: 12,
    
  },
  reportCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
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
    color: '#fff',
  },
  reportDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  reportTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reportTitleContainer: {
    flex: 1,
  },
  reportBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },

  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  reportId: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyReportsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyReportsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyReportsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
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
  cancelButton: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  submitButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  selectedTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
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
    marginBottom: 20,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.card,
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    marginBottom: 20
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  submitButtonContainer: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitButtonDisabled: {
    backgroundColor: colors.inactive,
    opacity: 0.6,
  },
  severityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  severityOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  selectedSeverityOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  severityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selectedSeverityOptionText: {
    color: '#fff',
  },

  locationInfo: {
    marginTop: 8,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.highlight,
    borderRadius: 8,
  },
  locationLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.success + '10',
    borderRadius: 8,
  },
  locationRetry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.highlight,
    borderRadius: 8,
  },
  locationRetryText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
  },
  connectionStatus: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
