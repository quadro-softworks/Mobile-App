import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export default function PrivacySettingsScreen() {
  const [locationTracking, setLocationTracking] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  
  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog
    // and then initiate the account deletion process
    alert('This would delete your account after confirmation in a real app.');
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen 
        options={{
          title: "Privacy & Security",
          headerBackTitle: "Profile",
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
          <Text style={styles.title}>Privacy & Security</Text>
          <Text style={styles.subtitle}>
            Manage your privacy preferences and security settings
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <Card>
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="location-sharp" size={20} color={colors.textSecondary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Location Tracking</Text>
                  <Text style={styles.settingDescription}>
                    Allow the app to track your location for better bus recommendations
                  </Text>
                </View>
              </View>
              <Switch
                value={locationTracking}
                onValueChange={setLocationTracking}
                trackColor={{ false: colors.inactive, true: colors.primary }}
                thumbColor={colors.card}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="shield-checkmark" size={20} color={colors.textSecondary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Data Collection</Text>
                  <Text style={styles.settingDescription}>
                    Allow us to collect usage data to improve the app
                  </Text>
                </View>
              </View>
              <Switch
                value={dataCollection}
                onValueChange={setDataCollection}
                trackColor={{ false: colors.inactive, true: colors.primary }}
                thumbColor={colors.card}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="notifications" size={20} color={colors.textSecondary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Marketing Emails</Text>
                  <Text style={styles.settingDescription}>
                    Receive promotional emails and offers
                  </Text>
                </View>
              </View>
              <Switch
                value={marketingEmails}
                onValueChange={setMarketingEmails}
                trackColor={{ false: colors.inactive, true: colors.primary }}
                thumbColor={colors.card}
              />
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <Card>
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                  <Text style={styles.settingDescription}>
                    Add an extra layer of security to your account
                  </Text>
                </View>
              </View>
              <Switch
                value={twoFactorAuth}
                onValueChange={setTwoFactorAuth}
                trackColor={{ false: colors.inactive, true: colors.primary }}
                thumbColor={colors.card}
              />
            </View>
            
            <View style={styles.divider} />
            
            <Button
              title="Change Password"
              onPress={() => alert('This would navigate to change password screen in a real app.')}
              variant="outline"
              style={styles.securityButton}
            />
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Button
            title="Delete Account"
            onPress={handleDeleteAccount}
            variant="outline"
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
            icon={<FontAwesome name="trash" size={20} color={colors.error} />} 
            iconPosition="left"
          />
          <Text style={styles.deleteAccountDescription}>
            Deleting your account will permanently remove all your data, including favorites, 
            payment methods, and purchase history.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  securityButton: {
    margin: 16,
  },
  deleteButton: {
    borderColor: colors.error,
    marginBottom: 12,
  },
  deleteButtonText: {
    color: colors.error,
  },
  deleteAccountDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});