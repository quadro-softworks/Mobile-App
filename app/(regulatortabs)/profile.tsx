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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Queue Regulator Information & Settings</Text>
        </View>

        {/* Regulator Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Regulator Details</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowEditModal(true)}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <View style={styles.regulatorInfo}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={colors.primary} />
              </View>
              <View style={styles.regulatorDetails}>
                <Text style={styles.regulatorName}>{user?.name || 'Regulator Name'}</Text>
                <Text style={styles.regulatorId}>Regulator ID: REG001</Text>
                <Text style={styles.regulatorEmail}>{user?.email || 'regulator@example.com'}</Text>
                <Text style={styles.regulatorPhone}>{user?.phone || 'No phone number'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Attendance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.attendanceButton} onPress={handleCheckInOut}>
              <Ionicons
                name={isCheckedIn ? "log-out" : "log-in"}
                size={24}
                color={colors.card}
              />
              <Text style={styles.attendanceButtonText}>
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewLogButton}
              onPress={() => setShowAttendanceModal(true)}
            >
              <Text style={styles.viewLogText}>View Attendance Log</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Assigned Stops */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Bus Stops</Text>
          <View style={styles.card}>
            {assignedStops.map((stop, index) => (
              <View key={stop.id} style={[styles.stopItem, index > 0 && styles.stopItemBorder]}>
                <View style={styles.stopInfo}>
                  <Ionicons name="location" size={24} color={colors.primary} />
                  <View style={styles.stopDetails}>
                    <Text style={styles.stopName}>{stop.name}</Text>
                    <Text style={styles.stopLocation}>{stop.location}</Text>
                    <View style={styles.routesContainer}>
                      <Text style={styles.routesLabel}>Routes: </Text>
                      {stop.routes.map((route, routeIndex) => (
                        <View key={routeIndex} style={styles.routeBadge}>
                          <Text style={styles.routeText}>{route}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            {renderProfileItem(
              'language',
              'Language',
              selectedLanguage,
              () => setShowLanguageModal(true)
            )}
            {renderProfileItem(
              'help-circle',
              'Help & Support',
              'Contact support team',
              () => Alert.alert('Support', 'Contact: +251-11-123-4567\nEmail: support@guzosync.com')
            )}
          </View>
        </View>

        {/* App Info & Logout */}
        <View style={styles.section}>
          <View style={styles.card}>
            {renderProfileItem(
              'information-circle',
              'App Version',
              'v1.0.0',
            )}
            {renderProfileItem(
              'log-out',
              'Logout',
              'Sign out of your account',
              handleLogout
            )}
          </View>
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
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
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regulatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  regulatorDetails: {
    flex: 1,
  },
  regulatorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  regulatorId: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  regulatorEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  attendanceButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  attendanceButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  viewLogText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  stopItem: {
    paddingVertical: 12,
  },
  stopItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stopInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stopDetails: {
    flex: 1,
    marginLeft: 12,
  },
  stopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  stopLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  routesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  routesLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
    marginRight: 4,
  },
  routeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  routeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.card,
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
