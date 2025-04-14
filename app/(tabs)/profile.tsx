import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Define setting item props
type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  
  // Mock user data
  const [user, setUser] = useState({
    name: 'Kidanu Teshome',
    email: 'kidanu.t@example.com',
    phone: '+251 91 234 5678',
    profileImage: null, // Will use a placeholder for now
    notificationsEnabled: true,
    locationEnabled: true,
    darkModeEnabled: colorScheme === 'dark',
  });

  // Toggle handler
  const handleToggle = (setting: keyof typeof user) => (value: boolean) => {
    setUser(prev => ({ ...prev, [setting]: value }));
  };

  // Setting item component
  const SettingItem = ({
    icon,
    title,
    subtitle,
    hasToggle = false,
    toggleValue = false,
    onToggle,
    onPress
  }: SettingItemProps) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={22} color="#0a7ea4" />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {hasToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#3a4356', true: '#0a7ea480' }}
          thumbColor={toggleValue ? '#0a7ea4' : '#f0f0f0'}
          ios_backgroundColor="#3a4356"
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#adb5bd" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#0a7ea4', '#086585']}
            style={styles.profileImagePlaceholder}
          >
            <Text style={styles.profileInitials}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </LinearGradient>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
        </View>

        {/* Preferences Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <SettingItem
            icon="notifications"
            title="Notifications"
            subtitle="Receive push notifications"
            hasToggle
            toggleValue={user.notificationsEnabled}
            onToggle={handleToggle('notificationsEnabled')}
          />
          
          <SettingItem
            icon="location"
            title="Location Services"
            subtitle="Allow the app to access your location"
            hasToggle
            toggleValue={user.locationEnabled}
            onToggle={handleToggle('locationEnabled')}
          />
          
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            hasToggle
            toggleValue={user.darkModeEnabled}
            onToggle={handleToggle('darkModeEnabled')}
          />
        </View>

        {/* Account Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon="lock-closed"
            title="Change Password"
            onPress={() => {}}
          />
          
          <SettingItem
            icon="language"
            title="Language"
            subtitle="English"
            onPress={() => {}}
          />
          
          <SettingItem
            icon="chatbubble"
            title="Help & Support"
            onPress={() => {}}
          />
          
          <SettingItem
            icon="information-circle"
            title="About Guzo Sync"
            onPress={() => {}}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out" size={18} color="#e74c3c" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c242f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#28313f',
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 16,
    color: '#adb5bd',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: '#adb5bd',
  },
  settingsSection: {
    marginBottom: 20,
    backgroundColor: '#28313f',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: 'white',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#adb5bd',
    marginTop: 2,
  },
  logoutButton: {
    padding: 16,
    backgroundColor: '#28313f',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
    marginLeft: 8,
  },
}); 