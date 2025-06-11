import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Test functions for quick testing
  const fillTestRegulator = () => {
    console.log('🧪 Filling test regulator credentials');
    setEmail('regulator@test.com');
    setPassword('password123');
  };

  const fillTestDriver = () => {
    console.log('🧪 Filling test driver credentials');
    setEmail('driver@test.com');
    setPassword('password123');
  };

  const fillTestPassenger = () => {
    console.log('🧪 Filling test passenger credentials');
    setEmail('passenger@test.com');
    setPassword('password123');
  };
  
  const { login, isLoading, error, clearError } = useAuthStore();
  
  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();
  }, [clearError]);
  
  const validateForm = () => {
    let isValid = true;
    console.log('🔍 Validating form...', { email, password: password ? '***' : 'empty' });

    // Validate email
    if (!email) {
      console.log('❌ Email validation failed: empty');
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      console.log('❌ Email validation failed: invalid format');
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      console.log('✅ Email validation passed');
      setEmailError('');
    }

    // Validate password
    if (!password) {
      console.log('❌ Password validation failed: empty');
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      console.log('❌ Password validation failed: too short');
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      console.log('✅ Password validation passed');
      setPasswordError('');
    }

    console.log('📝 Overall validation result:', isValid);
    return isValid;
  };
  
  const handleLogin = async () => {
    console.log('🔄 Login button clicked', { email: email.length > 0 ? 'Present' : 'Empty', password: password.length > 0 ? 'Present' : 'Empty' });
    clearError();

    const isValid = validateForm();
    console.log('📝 Form validation result:', isValid);

    if (isValid) {
      console.log('✅ Form valid, calling login API...');
      try {
        await login({ email, password });
        console.log('✅ Login API call completed');
      } catch (error) {
        console.error('❌ Login API call failed:', error);
      }
    } else {
      console.log('❌ Form validation failed');
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topImageContainer}>
          <Image
            source={require('../../assets/images/anb.jpg')}
            style={styles.topImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          <View style={styles.logoOverlayContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
            />
            <Text style={styles.tagline}>Real-time bus tracking made easy</Text>
          </View>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
            leftIcon={<Ionicons name="mail" size={20} color={colors.textSecondary} />}
          />
          
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={passwordError}
            leftIcon={<Ionicons name="lock-closed" size={20} color={colors.textSecondary} />}
          />
          
          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.button}
          />
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Test buttons for debugging */}
          <View style={styles.testButtons}>
            <TouchableOpacity onPress={fillTestRegulator} style={styles.testButton}>
              <Text style={styles.testButtonText}>Test Regulator</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={fillTestDriver} style={styles.testButton}>
              <Text style={styles.testButtonText}>Test Driver</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={fillTestPassenger} style={styles.testButton}>
              <Text style={styles.testButtonText}>Test Passenger</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  topImageContainer: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.35)', // Less white overlay
  },
  logoOverlayContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    paddingTop: 32,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  button: {
    marginTop: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  testButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  testButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  testButtonText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});