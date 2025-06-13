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
import { userApi, UserProfile } from '@/services/userApi';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'confirm'>('email');
  const [isResetting, setIsResetting] = useState(false);

  // User profile data from API
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [assignedBus] = useState<AssignedBus>({
    id: 'BUS001',
    licensePlate: 'AA-123-456',
    model: 'Mercedes Citaro',
    capacity: 45,
    route: 'Route 12 - Stadium to 4 Kilo'
  });

  // Language selection is now handled by LanguageSelector component

  // Mock attendance data
  const mockAttendance: AttendanceRecord[] = [
    { id: '1', date: '2024-01-15', checkIn: '07:30', checkOut: '17:45', status: 'present' },
    { id: '2', date: '2024-01-14', checkIn: '07:35', checkOut: '17:50', status: 'late' },
    { id: '3', date: '2024-01-13', checkIn: '07:25', checkOut: '17:40', status: 'present' },
    { id: '4', date: '2024-01-12', checkIn: '07:30', checkOut: '17:45', status: 'present' },
    { id: '5', date: '2024-01-11', checkIn: '08:15', checkOut: '18:00', status: 'late' },
  ];

  // Fetch user profile from API
  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    setProfileError(null);
    try {
      const profile = await userApi.getCurrentUser();
      setUserProfile(profile);

      // Update form fields with API data
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone_number || '');

      console.log('✅ User profile fetched successfully:', {
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        role: profile.role
      });
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      setProfileError((error as Error).message);

      // Fallback to auth store data if API fails
      if (user) {
        const nameParts = user.name.split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setPhone(user.phone || '');
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    setAttendanceRecords(mockAttendance);

    // Fetch user profile when component mounts
    fetchUserProfile();
  }, []);

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

  // Language selection is now handled by LanguageSelector component

  const handleSaveProfile = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    try {
      // Use the userApi service for updating profile
      const updatedProfile = await userApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        profile_image: '',
      });

      // Update local state
      setUserProfile(updatedProfile);

      // Update the auth store with the new data
      if (user) {
        const updatedUser = {
          ...user,
          name: `${updatedProfile.first_name} ${updatedProfile.last_name}`,
          email: updatedProfile.email,
          phone: updatedProfile.phone_number || '',
        };
        useAuthStore.setState({ user: updatedUser });
      }

      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');

      console.log('✅ Profile updated successfully:', {
        name: `${updatedProfile.first_name} ${updatedProfile.last_name}`,
        email: updatedProfile.email,
        phone: updatedProfile.phone_number
      });
    } catch (error) {
      console.error('❌ Profile update error:', error);
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
          {profileError && (
            <TouchableOpacity
              style={styles.refreshHeaderButton}
              onPress={fetchUserProfile}
              disabled={isLoadingProfile}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={isLoadingProfile ? colors.textSecondary : colors.primary}
              />
              <Text style={[styles.refreshHeaderText, { color: isLoadingProfile ? colors.textSecondary : colors.primary }]}>
                Retry
              </Text>
            </TouchableOpacity>
          )}
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
              <Text style={styles.userName}>
                {userProfile
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : user?.name || 'Driver'
                }
              </Text>
              {isLoadingProfile && (
                <Text style={styles.loadingText}>Loading profile...</Text>
              )}
              {profileError && (
                <Text style={styles.errorText}>Failed to load profile</Text>
              )}
            </View>
            <View style={styles.profileActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setShowEditModal(true)}
              >
                <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editButton}
                onPress={fetchUserProfile}
                disabled={isLoadingProfile}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={isLoadingProfile ? colors.textSecondary : colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* User Credentials Display */}
          {userProfile && (
            <View style={styles.credentialsSection}>
              <View style={styles.credentialItem}>
                <View style={styles.credentialIcon}>
                  <Ionicons name="mail" size={16} color={colors.primary} />
                </View>
                <View style={styles.credentialInfo}>
                  <Text style={styles.credentialLabel}>Email</Text>
                  <Text style={styles.credentialValue}>{userProfile.email}</Text>
                </View>
              </View>

              <View style={styles.credentialItem}>
                <View style={styles.credentialIcon}>
                  <Ionicons name="call" size={16} color={colors.primary} />
                </View>
                <View style={styles.credentialInfo}>
                  <Text style={styles.credentialLabel}>Phone</Text>
                  <Text style={styles.credentialValue}>{userProfile.phone_number || 'Not set'}</Text>
                </View>
              </View>

              <View style={styles.credentialItem}>
                <View style={styles.credentialIcon}>
                  <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                </View>
                <View style={styles.credentialInfo}>
                  <Text style={styles.credentialLabel}>Role</Text>
                  <Text style={styles.credentialValue}>{userProfile.role.replace('_', ' ')}</Text>
                </View>
              </View>

              <View style={styles.credentialItem}>
                <View style={styles.credentialIcon}>
                  <Ionicons name="id-card" size={16} color={colors.primary} />
                </View>
                <View style={styles.credentialInfo}>
                  <Text style={styles.credentialLabel}>User ID</Text>
                  <Text style={styles.credentialValue}>{userProfile.id}</Text>
                </View>
              </View>

              <View style={styles.credentialItem}>
                <View style={styles.credentialIcon}>
                  <Ionicons name="checkmark-circle" size={16} color={userProfile.is_active ? colors.success : colors.error} />
                </View>
                <View style={styles.credentialInfo}>
                  <Text style={styles.credentialLabel}>Status</Text>
                  <Text style={[styles.credentialValue, { color: userProfile.is_active ? colors.success : colors.error }]}>
                    {userProfile.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>
          )}
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

          <View style={styles.divider} />

          {/* Language Selector */}
          <LanguageSelector />
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

      {/* Language Selection Modal removed - now using LanguageSelector component */}

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
            {userProfile && (
              <View style={styles.profileInfoCard}>
                <Text style={styles.profileInfoTitle}>Current Profile Information</Text>
                <Text style={styles.profileInfoText}>Email: {userProfile.email}</Text>
                <Text style={styles.profileInfoText}>Role: {userProfile.role}</Text>
                <Text style={styles.profileInfoText}>User ID: {userProfile.id}</Text>
                <Text style={styles.profileInfoText}>
                  Status: {userProfile.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  refreshHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
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
  profileActions: {
    flexDirection: 'row',
    gap: 8,
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

  // New styles for user credentials display
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    fontStyle: 'italic',
  },
  credentialsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  credentialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  credentialIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  credentialInfo: {
    flex: 1,
  },
  credentialLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  credentialValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },

  // Profile info card styles
  profileInfoCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  profileInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
