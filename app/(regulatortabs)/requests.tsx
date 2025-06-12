import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

// Removed incident reporting types - only bus reallocation needed

export default function RequestsScreen() {
  const { user, token } = useAuthStore();
  const { t } = useTranslation();

  // State management - only for bus reallocation
  const [isRequestingReallocation, setIsRequestingReallocation] = useState(false);

  // Removed incident types - only bus reallocation needed

  // No initialization needed for bus reallocation only

  const requestBusReallocation = async () => {
    if (!token) {
      Alert.alert('Error', 'Authentication required. Please log in again.');
      return;
    }

    Alert.alert(
      'Request Bus Reallocation',
      'Are you sure you want to request bus reallocation? This will notify the control center to reassign buses based on current demand.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Request',
          onPress: async () => {
            setIsRequestingReallocation(true);
            try {
              console.log('🚌 Requesting bus reallocation...');

              const response = await fetch('https://guzosync-fastapi.onrender.com/api/buses/reallocate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });

              console.log('API Response status:', response.status);

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

              const result = await response.text();
              console.log('✅ Bus reallocation requested successfully:', result);

              Alert.alert(
                'Success',
                'Bus reallocation request submitted successfully. The control center will review and process your request.',
                [{ text: 'OK' }]
              );

            } catch (error) {
              console.error('❌ Error requesting bus reallocation:', error);

              let errorMessage = 'Failed to request bus reallocation';

              if (error instanceof Error) {
                errorMessage = error.message;
              } else if (typeof error === 'string') {
                errorMessage = error;
              }

              Alert.alert('Error', errorMessage);
            } finally {
              setIsRequestingReallocation(false);
            }
          },
        },
      ]
    );
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
        

        {/* Bus Reallocation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bus Reallocation</Text>
          <Text style={styles.sectionSubtitle}>Request bus reallocation based on current demand</Text>

          <TouchableOpacity
            style={styles.reallocationButton}
            onPress={requestBusReallocation}
            disabled={isRequestingReallocation}
          >
            <View style={styles.reallocationButtonContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
                {isRequestingReallocation ? (
                  <ActivityIndicator size={24} color={colors.warning} />
                ) : (
                  <Ionicons name="swap-horizontal" size={24} color={colors.warning} />
                )}
              </View>
              <View style={styles.reallocationTextContainer}>
                <Text style={styles.reallocationTitle}>
                  {isRequestingReallocation ? 'Requesting...' : 'Request Bus Reallocation'}
                </Text>
                <Text style={styles.reallocationDescription}>
                  Notify control center to reassign buses based on current passenger demand
                </Text>
              </View>
              {!isRequestingReallocation && (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Removed reports history section - only bus reallocation needed */}
      </ScrollView>

      {/* Removed incident reporting modal - only bus reallocation needed */}
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
