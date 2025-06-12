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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

interface Request {
  id: string;
  type: 'overcrowding';
  title: string;
  description: string;
  status: 'pending' | 'accepted' | 'denied';
  timestamp: string;
  response?: string;
}

interface RequestType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export default function RequestsScreen() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [requestDescription, setRequestDescription] = useState('');
  const [passengerCount, setPassengerCount] = useState('');

  const requestTypes: RequestType[] = [
    {
      id: 'overcrowding',
      title: 'Report Overcrowding',
      description: 'Report passenger overcrowding at your stop',
      icon: 'people',
      color: colors.warning,
    },
  ];

  // Mock requests data for demonstration
  React.useEffect(() => {
    const mockRequests: Request[] = [
      {
        id: '1',
        type: 'overcrowding',
        title: 'Overcrowding Report',
        description: 'Heavy passenger queue at Stadium stop - approximately 40 waiting passengers',
        status: 'accepted',
        timestamp: '2024-01-15T09:15:00Z',
        response: 'Additional bus dispatched to your location. ETA: 5 minutes.',
      },
    ];
    setRequests(mockRequests);
  }, []);

  const handleRequestTypeSelect = (requestType: RequestType) => {
    setSelectedRequestType(requestType);
    setIsModalVisible(true);
  };

  const submitRequest = async () => {
    if (!selectedRequestType || !requestDescription.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      let description = requestDescription.trim();

      // Add specific fields based on request type
      if (selectedRequestType.id === 'overcrowding') {
        if (passengerCount.trim()) {
          description = `Estimated passengers: ${passengerCount}. ${description}`;
        }
      }

      const newRequest: Request = {
        id: Date.now().toString(),
        type: selectedRequestType.id as any,
        title: selectedRequestType.title,
        description: description,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };

      setRequests(prev => [newRequest, ...prev]);

      // Reset form
      setSelectedRequestType(null);
      setRequestDescription('');
      setPassengerCount('');
      setIsModalVisible(false);

      Alert.alert('Success', 'Request submitted successfully');
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Error', 'Failed to submit request');
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'accepted': return colors.success;
      case 'denied': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const renderRequest = ({ item }: { item: Request }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.requestDescription}>{item.description}</Text>
      {item.response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Response:</Text>
          <Text style={styles.responseText}>{item.response}</Text>
        </View>
      )}
      <Text style={styles.requestTimestamp}>{formatDate(item.timestamp)}</Text>
    </View>
  );



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('regulator.requests')}</Text>
        <Text style={styles.subtitle}>Control Center Communication</Text>
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
            <TouchableOpacity onPress={submitRequest}>
              <Text style={styles.submitButton}>Submit</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedRequestType && (
              <View style={styles.selectedTypeContainer}>
                <View style={[styles.iconContainer, { backgroundColor: selectedRequestType.color + '20' }]}>
                  <Ionicons name={selectedRequestType.icon as any} size={24} color={selectedRequestType.color} />
                </View>
                <View>
                  <Text style={styles.selectedTypeTitle}>{selectedRequestType.title}</Text>
                  <Text style={styles.selectedTypeDescription}>{selectedRequestType.description}</Text>
                </View>
              </View>
            )}



            {/* Overcrowding specific fields */}
            {selectedRequestType?.id === 'overcrowding' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Estimated Passenger Count</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 25"
                  value={passengerCount}
                  onChangeText={setPassengerCount}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe the situation in detail..."
                value={requestDescription}
                onChangeText={setRequestDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.characterCount}>{requestDescription.length}/500</Text>
            </View>

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                Your request will be sent to the control center for review and response.
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
  requestTypesContainer: {
    gap: 12,
  },
  requestTypeCard: {
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
  requestTypeContent: {
    flex: 1,
  },
  requestTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  requestTypeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
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
