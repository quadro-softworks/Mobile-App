import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, Platform } from 'react-native'; // Added SafeAreaView, Platform
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

// Mock language data
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const { user, updateLanguage } = useAuthStore();
  const [selectedLanguage, setSelectedLanguage] = useState(user?.language || 'en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleClose = () => {
    router.back();
  };
  
  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };
  
  const handleSave = async () => {
    if (selectedLanguage === user?.language) {
      router.back();
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateLanguage(selectedLanguage);
      router.back();
    } catch (error) {
      console.error('Failed to update language:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderLanguageItem = ({ item }: { item: typeof languages[0] }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selectedLanguage === item.code && styles.selectedLanguageItem
      ]}
      onPress={() => handleLanguageSelect(item.code)}
      activeOpacity={0.7}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.languageName}>{item.name}</Text>
        <Text style={styles.languageNativeName}>{item.nativeName}</Text>
      </View>
      {selectedLanguage === item.code && (
        <Ionicons name="checkmark" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.safeAreaContainer}> {/* Use SafeAreaView */}
      <Stack.Screen 
        options={{
          title: "Language",
          headerRight: () => (
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.error} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.contentContainerPadded}> {/* Apply padding here */}
        <Text style={styles.title}>Select Your Preferred Language</Text>
        <Text style={styles.subtitle}>
          Choose the language you want to use in the app
        </Text>
        
        <Card style={styles.languagesCard}>
          <FlatList
            data={languages}
            keyExtractor={(item) => item.code}
            renderItem={renderLanguageItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />
        </Card>
        
        <Button
          title="Save"
          onPress={handleSave}
          loading={isSubmitting}
          style={styles.saveButton}
          disabled={selectedLanguage === user?.language}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: { // New style for SafeAreaView
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainerPadded: { // New style for padding content
    flex: 1, // Keep flex: 1 for the main content view
    paddingTop: Platform.OS === 'android' ? 20 : 0, // Adjusted paddingTop for Android, 0 for iOS as SafeAreaView handles it
    paddingHorizontal: 20,
    paddingBottom: 20, // Add paddingBottom
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // padding: 20, // Removed, handled by contentContainerPadded
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  languagesCard: {
    padding: 0,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  selectedLanguageItem: {
    backgroundColor: colors.highlight,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  languageNativeName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  saveButton: {
    marginTop: 24,
  },
});