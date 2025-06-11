import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';


import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
// import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const { t } = useTranslation();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user) {
      // Initialize form fields with user data
      const nameParts = user.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);
  
  const handleLogout = async () => {
    Alert.alert(
      t('profile.logout'),
      'Are you sure you want to logout?',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.logout'),
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };
  
  const handleFeedback = () => {
    router.push('/feedback');
  };
  

  
  // const pickImage = async () => {
  //   try {
  //     // Request permissions
  //     if (Platform.OS !== 'web') {
  //       // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //       if (status !== 'granted') {
  //         Alert.alert('Permission needed', 'Please grant camera roll permissions to change your profile picture.');
  //         return;
  //       }
  //     }
      
  //     // Launch image picker
  //     // const result = await ImagePicker.launchImageLibraryAsync({
  //     //   mediaTypes: 'images',
  //     //   allowsEditing: true,
  //     //   aspect: [1, 1],
  //     //   quality: 0.7,
  //     // });
      
  //     if (!result.canceled && result.assets && result.assets.length > 0) {
  //       setAvatar(result.assets[0].uri);
  //       // In a real app, we would upload this to a server
  //       // For now, we'll just update the local state
  //     }
  //   } catch (error) {
  //     console.error('Error picking image:', error);
  //     Alert.alert('Error', 'Failed to pick image. Please try again.');
  //   }
  // };
  
  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phone,
        profile_image: '',
      });
      setIsEditingProfile(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  

  

  
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIconContainer}>
            <Ionicons name="person" size={60} color={colors.card} />
          </View>
          <Text style={styles.emptyStateTitle}>{t('auth.login')} Required</Text>
          <Text style={styles.emptyStateText}>
            Please sign in to access your profile and personalized features
          </Text>
          <Button
            title={t('auth.login')}
            onPress={() => router.replace('/login')}
            style={styles.signInButton}
          />
          <Button
            title={t('auth.createAccount')}
            onPress={() => router.replace('/register')}
            variant="outline"
            style={styles.createAccountButton}
          />
        </View>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          // onPress={pickImage}
          activeOpacity={0.8}
        >
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color={colors.card} />
          </View>
          <View style={styles.cameraButton}>
            <Ionicons name="camera" size={16} color={colors.card} />
          </View>
        </TouchableOpacity>
        
        {isEditingProfile ? (
          <View style={styles.editProfileContainer}>
            <Text style={styles.editProfileLabel}>First Name</Text>
            <TextInput
              style={styles.editProfileInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Your first name"
            />

            <Text style={styles.editProfileLabel}>Last Name</Text>
            <TextInput
              style={styles.editProfileInput}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Your last name"
            />

            <Text style={styles.editProfileLabel}>Email</Text>
            <TextInput
              style={styles.editProfileInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.editProfileLabel}>Phone</Text>
            <TextInput
              style={styles.editProfileInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Your phone number"
              keyboardType="phone-pad"
            />

            <View style={styles.editProfileButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setIsEditingProfile(false);
                  // Reset form fields
                  const nameParts = user?.name.split(' ') || [];
                  setFirstName(nameParts[0] || '');
                  setLastName(nameParts.slice(1).join(' ') || '');
                  setEmail(user?.email || '');
                  setPhone(user?.phone || '');
                }}
                variant="outline"
                style={styles.editProfileButton}
              />
              <Button
                title="Save"
                onPress={handleSaveProfile}
                loading={isLoading}
                style={styles.editProfileButton}
              />
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditingProfile(true)}
            >
              <Text style={styles.editButtonText}>{t('profile.editProfile')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
        <Card style={styles.card}>
          <View style={styles.infoItem}>
            <Ionicons name="mail" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>{t('profile.email')}</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoItem}>
            <Ionicons name="call" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>{t('profile.phone')}</Text>
            <Text style={styles.infoValue}>{user.phone || 'Not set'}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <LanguageSelector />

          <View style={styles.divider} />
          
          <Pressable 
            style={({ pressed }) => [
              styles.menuItem,
              pressed ? styles.menuItemPressed : {}
            ]}
            onPress={() => router.push('/privacy-settings')}
          >
            <View style={styles.menuLabelContainer}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              <Text style={styles.menuLabel}>Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </Card>
      </View>



      

      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <Card style={styles.card}>
          <Pressable 
            style={({ pressed }) => [
              styles.menuItem,
              pressed ? styles.menuItemPressed : {}
            ]}
            onPress={handleFeedback}
          >
            <View style={styles.menuLabelContainer}>
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
              <Text style={styles.menuLabel}>Submit Feedback</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
          
          <View style={styles.divider} />
          
          <Pressable 
            style={({ pressed }) => [
              styles.menuItem,
              pressed ? styles.menuItemPressed : {}
            ]}
            onPress={() => router.push('/help-center')}
          >
            <View style={styles.menuLabelContainer}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
              <Text style={styles.menuLabel}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </Card>
      </View>
      
      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        style={styles.logoutButton}
        icon={<Ionicons name="log-out-outline" size={18} color={colors.primary} />} 
        iconPosition="left"
      />
    </ScrollView>
  );
}

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.card,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  editButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  editButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 14,
  },
  editProfileContainer: {
    width: '100%',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
  },
  editProfileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  editProfileInput: {
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  editProfileButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  editProfileButton: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemPressed: {
    backgroundColor: colors.highlight,
  },
  menuLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  menuAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  countBadgeContainer: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  countBadge: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  languageValue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: '80%',
  },
  signInButton: {
    width: '80%',
    marginBottom: 12,
  },
  createAccountButton: {
    width: '80%',
  },
});