import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
  SafeAreaView,
  StatusBar,

  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { LanguageSelector } from '@/components/LanguageSelector';
import { FeedbackModal } from '@/components/FeedbackModal';



export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const { t } = useTranslation();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

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
    setShowFeedbackModal(true);
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.gradientBackground}
        >
          <View style={styles.emptyStateContainer}>
            <BlurView intensity={20} style={styles.emptyStateCard}>
              <View style={styles.emptyStateIconContainer}>
                <Ionicons name="person" size={60} color={colors.primary} />
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
            </BlurView>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header with Gradient Background */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.avatarContainer}
            activeOpacity={0.8}
          >
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color={colors.card} />
              </View>
              <View style={styles.avatarBorder} />
            </View>
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={18} color={colors.card} />
            </View>
          </TouchableOpacity>
        
          {isEditingProfile ? (
            <BlurView intensity={80} style={styles.editProfileContainer}>
              <Text style={styles.editProfileLabel}>First Name</Text>
              <TextInput
                style={styles.editProfileInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Your first name"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.editProfileLabel}>Last Name</Text>
              <TextInput
                style={styles.editProfileInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Your last name"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.editProfileLabel}>Email</Text>
              <TextInput
                style={styles.editProfileInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Your email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.editProfileLabel}>Phone</Text>
              <TextInput
                style={styles.editProfileInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Your phone number"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.editProfileButtons}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setIsEditingProfile(false);
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
            </BlurView>
          ) : (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditingProfile(true)}
              >
                <Ionicons name="create-outline" size={16} color={colors.card} />
                <Text style={styles.editButtonText}>{t('profile.editProfile')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
          <Card style={styles.modernCard}>
            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('profile.email')}</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="call" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('profile.phone')}</Text>
                <Text style={styles.infoValue}>{user.phone || 'Not set'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <LanguageSelector />
          </Card>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card style={styles.modernCard}>
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed ? styles.menuItemPressed : {}
              ]}
              onPress={handleFeedback}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Submit Feedback</Text>
                <Text style={styles.menuSubtitle}>Share your thoughts with us</Text>
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
              <View style={styles.iconContainer}>
                <Ionicons name="help-circle" size={20} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Help Center</Text>
                <Text style={styles.menuSubtitle}>Get help and support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
            icon={<Ionicons name="log-out-outline" size={18} color={colors.primary} />}
            iconPosition="left"
          />
        </View>
      </ScrollView>

      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Empty State Styles
  gradientBackground: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  signInButton: {
    width: '100%',
    marginBottom: 12,
  },
  createAccountButton: {
    width: '100%',
  },

  // Header Styles
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: colors.secondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.card,
    marginBottom: 6,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  // Edit Profile Styles
  editProfileContainer: {
    width: '100%',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  editProfileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  editProfileInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    fontSize: 16,
    color: colors.text,
  },
  editProfileButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  editProfileButton: {
    flex: 1,
  },

  // Content Styles
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },

  // Card Styles
  modernCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Info Item Styles
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
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
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  // Menu Item Styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  menuContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },

  // Logout Section
  logoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
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
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    marginHorizontal: 20,
  },
  logoutButton: {
    borderRadius: 12,
  },
});