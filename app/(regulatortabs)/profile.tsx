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

interface AssignedStop {
  id: string;
  name: string;
  location: string;
  routes: string[];
}

export default function RegulatorProfileScreen() {
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const { t } = useTranslation();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
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
      setEmail(user.email || '');
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

  const handleLanguageSelect = (language: { code: string; name: string }) => {
    setSelectedLanguage(language.name);
    setShowLanguageModal(false);
    Alert.alert('Language Changed', `Language changed to ${language.name}`);
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return colors.success;
      case 'late': return colors.warning;
      case 'absent': return colors.error;
      default: return colors.textSecondary;
    }
  };

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
              <Text style={styles.userName}>{user?.name || 'Regulator Name'}</Text>
              <Text style={styles.userRole}>Queue Regulator</Text>
              <Text style={styles.userId}>ID: REG001</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="location" size={24} color={colors.primary} />
            <Text style={styles.statNumber}>{assignedStops.length}</Text>
            <Text style={styles.statLabel}>Assigned Stops</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={colors.success} />
            <Text style={styles.statNumber}>96%</Text>
            <Text style={styles.statLabel}>Efficiency</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color={colors.warning} />
            <Text style={styles.statNumber}>1.2k</Text>
            <Text style={styles.statLabel}>Daily Passengers</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="mail" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'regulator@example.com'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="call" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone || 'No phone number'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Assigned Stops */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Bus Stops</Text>
          {assignedStops.map((stop, index) => (
            <View key={stop.id} style={styles.stopCard}>
              <View style={styles.stopHeader}>
                <View style={styles.stopIconContainer}>
                  <Ionicons name="location" size={28} color={colors.card} />
                </View>
                <View style={styles.stopInfo}>
                  <Text style={styles.stopName}>{stop.name}</Text>
                  <Text style={styles.stopLocation}>{stop.location}</Text>
                </View>
              </View>
              <View style={styles.routesContainer}>
                <Text style={styles.routesLabel}>Active Routes:</Text>
                <View style={styles.routesList}>
                  {stop.routes.map((route, routeIndex) => (
                    <View key={routeIndex} style={styles.routeBadge}>
                      <Text style={styles.routeText}>{route}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Attendance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance</Text>
          <View style={styles.attendanceCard}>
            <TouchableOpacity
              style={styles.viewLogButton}
              onPress={() => setShowAttendanceModal(true)}
            >
              <View style={styles.attendanceInfo}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                <View style={styles.attendanceText}>
                  <Text style={styles.attendanceTitle}>View Attendance Log</Text>
                  <Text style={styles.attendanceSubtitle}>Check your attendance history</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            <LanguageSelector />
            {renderProfileItem(
              'help-circle',
              'Help & Support',
              'Contact support team',
              () => Alert.alert('Support', 'Contact: +251-11-123-4567\nEmail: support@guzosync.com')
            )}
            {renderProfileItem(
              'information-circle',
              'App Version',
              'v1.0.0',
            )}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color={colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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

            <Text style={styles.editFormLabel}>Email</Text>
            <TextInput
              style={styles.editFormInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  userId: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  stopCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stopIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 4,
  },
  stopLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  routesContainer: {
    gap: 8,
  },
  routesLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  routesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  routeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  routeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  attendanceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  attendanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attendanceText: {
    marginLeft: 16,
    flex: 1,
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  attendanceSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButton: {
    backgroundColor: colors.card,
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
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 12,
  },
  viewLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.highlight,
    borderRadius: 16,
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  regulatorPhone: {
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
  editFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  editFormButton: {
    flex: 1,
  },
});
