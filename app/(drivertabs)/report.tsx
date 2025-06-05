import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

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
  location?: string;
  timestamp: string;
  status: 'pending' | 'submitted' | 'resolved';
}

export default function ReportScreen() {
  const { user } = useAuthStore();
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [reportDescription, setReportDescription] = useState('');
  const [reportLocation, setReportLocation] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const reportTypes: ReportType[] = [
    {
      id: 'vehicle_issue',
      title: 'Vehicle Issue',
      description: 'Mechanical problems, maintenance needs',
      icon: 'car-sport',
      color: colors.error,
    },
    {
      id: 'route_problem',
      title: 'Route Problem',
      description: 'Road closures, traffic issues',
      icon: 'map',
      color: colors.warning,
    },
    {
      id: 'passenger_incident',
      title: 'Passenger Incident',
      description: 'Safety concerns, disputes',
      icon: 'people',
      color: colors.primary,
    },
    {
      id: 'safety_concern',
      title: 'Safety Concern',
      description: 'Hazards, security issues',
      icon: 'shield-checkmark',
      color: colors.error,
    },
    {
      id: 'schedule_delay',
      title: 'Schedule Delay',
      description: 'Unexpected delays, timing issues',
      icon: 'time',
      color: colors.warning,
    },
    {
      id: 'other',
      title: 'Other',
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

    try {
      const newReport: Report = {
        id: Date.now().toString(),
        type: selectedReportType.id,
        title: selectedReportType.title,
        description: reportDescription.trim(),
        location: reportLocation.trim() || undefined,
        timestamp: new Date().toISOString(),
        status: 'submitted',
      };

      setReports(prev => [newReport, ...prev]);
      
      // Reset form
      setSelectedReportType(null);
      setReportDescription('');
      setReportLocation('');
      setIsModalVisible(false);

      Alert.alert('Success', 'Report submitted successfully');
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report');
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

  const renderReport = (report: Report) => (
    <View key={report.id} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{report.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
          <Text style={styles.statusText}>{report.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.reportDescription}>{report.description}</Text>
      {report.location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={14} color={colors.textSecondary} />
          <Text style={styles.locationText}>{report.location}</Text>
        </View>
      )}
      <Text style={styles.reportTimestamp}>{formatDate(report.timestamp)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Submit incidents and issues</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report an Issue</Text>
          <Text style={styles.sectionSubtitle}>Select the type of issue you want to report</Text>
          
          <View style={styles.reportTypesContainer}>
            {reportTypes.map(renderReportType)}
          </View>
        </View>

        {reports.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <Text style={styles.sectionSubtitle}>Your submitted reports</Text>
            
            <View style={styles.reportsContainer}>
              {reports.map(renderReport)}
            </View>
          </View>
        )}
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
            <TouchableOpacity onPress={submitReport}>
              <Text style={styles.submitButton}>Submit</Text>
            </TouchableOpacity>
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
              <Text style={styles.inputLabel}>Location (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Specific location or landmark"
                value={reportLocation}
                onChangeText={setReportLocation}
                maxLength={100}
              />
            </View>

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
    color: colors.white,
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
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
