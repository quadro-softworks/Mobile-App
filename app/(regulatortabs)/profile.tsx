import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { LanguageSelector } from '@/components/LanguageSelector';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';

interface AssignedStop {
  id: string;
  name: string;
  location: string;
  routes: string[];
}

export default function RegulatorProfileScreen() {
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedStops] = useState<AssignedStop[]>([
    {
      id: 'stop_001',
      name: 'Stadium Bus Stop',
      location: 'Stadium Area, Addis Ababa',
      routes: ['R12', 'R15', 'R18']
    },
    {
      id: 'stop_002',
      name: 'Piazza Terminal',
      location: 'Piazza, Addis Ababa',
      routes: ['R12', 'R20']
    }
  ]);

  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'confirm'>('email');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Initialize form fields with user data
    if (user) {
      const nameParts = user.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  // Language selection is now handled by LanguageSelector component

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phone,
        profile_image: '',
      });
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  // Removed unused status color function

  const renderProfileItem = (icon: string, title: string, subtitle: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          <Text style={styles.profileItemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  // Removed unused attendance functionality

  const handlePasswordResetRequest = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch('https://guzosync-fastapi.onrender.com/api/accounts/password/reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send reset email');
      }

      Alert.alert(
        'Reset Email Sent',
        'Please check your email for password reset instructions',
        [
          {
            text: 'OK',
            onPress: () => setResetStep('confirm'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setIsResetting(false);
    }
  };

  const handlePasswordResetConfirm = async () => {
    if (!resetToken || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch('https://guzosync-fastapi.onrender.com/api/accounts/password/reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reset password');
      }

      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. Please login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => setShowPasswordResetModal(false),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setIsResetting(false);
    }
  };

  const renderFAQModal = () => (
    <Modal
      visible={showFAQModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFAQModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
          {/* Add FAQ content here */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowFAQModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPasswordResetModal = () => (
    <Modal
      visible={showPasswordResetModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPasswordResetModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Reset Password</Text>
          {resetStep === 'email' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
              />
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handlePasswordResetRequest}
                disabled={isResetting}
              >
                {isResetting ? (
                  <Text>Loading...</Text>
                ) : (
                  <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Reset Token"
                value={resetToken}
                onChangeText={setResetToken}
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handlePasswordResetConfirm}
                disabled={isResetting}
              >
                {isResetting ? (
                  <Text>Loading...</Text>
                ) : (
                  <Text style={styles.primaryButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowPasswordResetModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Language selection is now handled by LanguageSelector component

  const renderEditProfileModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEditModal(false)}
    >
      <SafeAreaView style={styles.editModalContainer}>
        <View style={styles.editModalHeader}>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.editModalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSaveProfile} disabled={isLoading}>
            <Text style={[styles.cancelButton, { color: colors.primary }]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.editModalContent}>
          <Text style={styles.editFormLabel}>First Name</Text>
          <TextInput
            style={styles.editFormInput}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
          />

          <Text style={styles.editFormLabel}>Last Name</Text>
          <TextInput
            style={styles.editFormInput}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
          />

          <Text style={styles.editFormLabel}>Phone Number</Text>
          <TextInput
            style={styles.editFormInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient Background */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Ionicons name="shield-checkmark" size={50} color={colors.card} />
              </View>
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => setShowEditModal(true)}
              >
                <Ionicons name="pencil" size={16} color={colors.card} />
              </TouchableOpacity>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.profileName}>{`${firstName} ${lastName}`}</Text>
              <Text style={styles.profileRole}>Regulator</Text>
            </View>
          </View>
        </View>

          {/* Use the proper LanguageSelector component */}
          <LanguageSelector />
        {/* Profile Actions */}
        <View style={styles.profileActions}>
          {renderProfileItem('person', 'Personal Information', `${firstName} ${lastName}`, () => setShowEditModal(true))}
          {renderProfileItem('mail', 'Email', email)}
          {renderProfileItem('call', 'Phone', phone)}


          {renderProfileItem('help-circle', 'FAQ', 'Get Help', () => setShowFAQModal(true))}
          {renderProfileItem('lock-closed', 'Reset Password', 'Change your password', () => setShowPasswordResetModal(true))}
          {renderProfileItem('log-out', 'Logout', 'Sign out of your account', handleLogout)}
        </View>
        {/* Modals */}
        {renderEditProfileModal()}
        {renderPasswordResetModal()}
        {renderFAQModal()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  headerInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  profileActions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemText: {
    marginLeft: 12,
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  assignedStopItem: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  assignedStopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  assignedStopDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  assignedStopRoutes: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  attendanceItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attendanceDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  attendanceDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
  attendanceTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkInOutButton: {
    backgroundColor: colors.success,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.success,
  },
  checkInOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 100,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
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
    color: colors.primary,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  languageName: {
    fontSize: 16,
    color: colors.text,
  },
  editModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  editModalContent: {
    flex: 1,
    padding: 16,
  },
  editFormLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    marginTop: 16,
  },
  editFormInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
});
