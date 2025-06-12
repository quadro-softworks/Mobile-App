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
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { LanguageSelector } from '@/components/LanguageSelector';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late';
}

interface AssignedBus {
  id: string;
  licensePlate: string;
  model: string;
  capacity: number;
  route: string;
}

export default function DriverProfileScreen() {
  const { user, logout, isLoading } = useAuthStore();
  const { t } = useTranslation();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'confirm'>('email');
  const [isResetting, setIsResetting] = useState(false);
  const [assignedBus] = useState<AssignedBus>({
    id: 'BUS001',
    licensePlate: 'AA-123-456',
    model: 'Mercedes Citaro',
    capacity: 45,
    route: 'Route 12 - Stadium to 4 Kilo'
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'am', name: 'አማርኛ (Amharic)' },
    { code: 'or', name: 'Afaan Oromoo' },
    { code: 'ti', name: 'ትግርኛ (Tigrinya)' },
  ];

  // Mock attendance data
  const mockAttendance: AttendanceRecord[] = [
    { id: '1', date: '2024-01-15', checkIn: '07:30', checkOut: '17:45', status: 'present' },
    { id: '2', date: '2024-01-14', checkIn: '07:35', checkOut: '17:50', status: 'late' },
    { id: '3', date: '2024-01-13', checkIn: '07:25', checkOut: '17:40', status: 'present' },
    { id: '4', date: '2024-01-12', checkIn: '07:30', checkOut: '17:45', status: 'present' },
    { id: '5', date: '2024-01-11', checkIn: '08:15', checkOut: '18:00', status: 'late' },
  ];

  useEffect(() => {
    setAttendanceRecords(mockAttendance);
    // Initialize form fields with user data
    if (user) {
      const nameParts = user.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleCheckInOut = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!isCheckedIn) {
      setIsCheckedIn(true);
      Alert.alert('Check-in Successful', `Checked in at ${timeString}`);
    } else {
      setIsCheckedIn(false);
      Alert.alert('Check-out Successful', `Checked out at ${timeString}`);
    }
  };

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
            onPress: () => {
              setShowPasswordResetModal(false);
              setResetStep('email');
              setResetEmail('');
              setResetToken('');
              setNewPassword('');
              setConfirmPassword('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLanguageSelect = (language: { code: string; name: string }) => {
    setSelectedLanguage(language.name);
    setShowLanguageModal(false);
    Alert.alert('Language Changed', `Language changed to ${language.name}`);
  };

  const handleSaveProfile = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    try {
      const { token } = useAuthStore.getState();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const response = await fetch('https://guzosync-fastapi.onrender.com/api/account/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          profile_image: '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }

      const updatedUser = await response.json();

      // Update the user in the auth store
      useAuthStore.setState({ user: updatedUser });

      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', (error as Error).message || 'Failed to update profile. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return colors.success;
      case 'late': return colors.warning;
      case 'absent': return colors.error;
      default: return colors.textSecondary;
    }
  };



  const renderAttendanceItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.attendanceItem}>
      <View style={styles.attendanceDate}>
        <Text style={styles.attendanceDateText}>{item.date}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.attendanceTimes}>
        <Text style={styles.timeText}>In: {item.checkIn}</Text>
        <Text style={styles.timeText}>Out: {item.checkOut || 'N/A'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color={colors.primary} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.userName}>{user?.name || 'Mr. John Doe'}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowEditModal(true)}
            >
              <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowEditModal(true)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
              </View>
              <Text style={styles.menuItemText}>User Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowPasswordResetModal(true)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              </View>
              <Text style={styles.menuItemText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowAttendanceModal(true)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              </View>
              <Text style={styles.menuItemText}>Attendance Log</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowFAQModal(true)}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
              </View>
              <Text style={styles.menuItemText}>FAQs</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Support Card */}
        <View style={styles.supportCard}>
          <Text style={styles.supportText}>
            If you have any other query you can reach out to us.
          </Text>
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={() => Alert.alert('WhatsApp', 'Opening WhatsApp support...')}
          >
            <Text style={styles.whatsappText}>WhatsApp Us</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Password Reset Modal */}
      <Modal visible={showPasswordResetModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowPasswordResetModal(false);
              setResetStep('email');
              setResetEmail('');
              setResetToken('');
              setNewPassword('');
              setConfirmPassword('');
            }}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {resetStep === 'email' ? 'Reset Password' : 'Confirm Reset'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.editModalContent}>
            {resetStep === 'email' ? (
              <>
                <Text style={styles.editFormLabel}>Email Address</Text>
                <TextInput
                  style={styles.editFormInput}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  style={[styles.logoutButton, { marginTop: 20, backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={handlePasswordResetRequest}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <ActivityIndicator size="small" color={colors.card} />
                  ) : (
                    <>
                      <Ionicons name="mail-outline" size={20} color={colors.card} />
                      <Text style={[styles.logoutText, { color: colors.card }]}>Send Reset Email</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.editFormLabel}>Reset Token</Text>
                <TextInput
                  style={styles.editFormInput}
                  value={resetToken}
                  onChangeText={setResetToken}
                  placeholder="Enter reset token from email"
                />

                <Text style={styles.editFormLabel}>New Password</Text>
                <TextInput
                  style={styles.editFormInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry
                />

                <Text style={styles.editFormLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.editFormInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry
                />

                <TouchableOpacity
                  style={[styles.logoutButton, { marginTop: 20, backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={handlePasswordResetConfirm}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <ActivityIndicator size="small" color={colors.card} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-outline" size={20} color={colors.card} />
                      <Text style={[styles.logoutText, { color: colors.card }]}>Reset Password</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* FAQ Modal */}
      <Modal visible={showFAQModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFAQModal(false)}>
              <Text style={styles.cancelButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.editModalContent}>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I update my profile?</Text>
              <Text style={styles.faqAnswer}>
                Tap on "User Profile" from the settings menu to edit your personal information including name, email, and phone number.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I reset my password?</Text>
              <Text style={styles.faqAnswer}>
                Tap on "Change Password" from the settings menu. Enter your email address to receive a reset token, then follow the instructions to set a new password.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I view my attendance?</Text>
              <Text style={styles.faqAnswer}>
                Tap on "Attendance Log" to view your complete attendance history including check-in and check-out times.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I contact support?</Text>
              <Text style={styles.faqAnswer}>
                You can contact our support team via WhatsApp using the "WhatsApp Us" button in the support section, or call us at +251-11-123-4567.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I change the app language?</Text>
              <Text style={styles.faqAnswer}>
                The language selector is available in the settings. Currently, the app supports English and Amharic languages.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Language</Text>
            <View style={{ width: 60 }} />
          </View>

          <FlatList
            data={languages}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.languageItem}
                onPress={() => handleLanguageSelect(item)}
              >
                <Text style={styles.languageName}>{item.name}</Text>
                {selectedLanguage === item.name && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.code}
          />
        </SafeAreaView>
      </Modal>

      {/* Attendance Log Modal */}
      <Modal
        visible={showAttendanceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAttendanceModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAttendanceModal(false)}>
              <Text style={styles.cancelButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Attendance Log</Text>
            <View style={{ width: 60 }} />
          </View>

          <FlatList
            data={attendanceRecords}
            renderItem={renderAttendanceItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.attendanceList}
          />
        </SafeAreaView>
      </Modal>

      {/* Edit Profile Modal */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileSection: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  editButton: {
    padding: 8,
  },
  menuContainer: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 56,
  },

  supportCard: {
    backgroundColor: '#f0f9ff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  supportText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  whatsappButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  whatsappText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoutButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
    marginLeft: 8,
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
    color: colors.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
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
  attendanceList: {
    padding: 16,
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
  faqItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
