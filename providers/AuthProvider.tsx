import React, { createContext, useState, useContext } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Mock User type
type User = {
  uid: string;
  email: string;
  displayName: string;
} | null;

interface AuthContextType {
  user: User;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock sign in function - simulates a delay and then authenticates
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password required');
      }
      
      if (password === 'wrong') {
        throw new Error('Invalid credentials');
      }
      
      // Set mock user
      setUser({
        uid: '123456',
        email: email,
        displayName: 'Demo User'
      });
      
      // Navigate to main app
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Set mock user
      setUser({
        uid: '123456',
        email: email,
        displayName: name
      });
      
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign up');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear user
      setUser(null);
      
      // Navigate to auth
      router.replace('/(auth)/login' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set mock user
      setUser({
        uid: '123456',
        email: 'google@example.com',
        displayName: 'Google User'
      });
      
      // Navigate to main app
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!email) {
        throw new Error('Email is required');
      }
      
      // Just return without a boolean value
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send password reset email');
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    forgotPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 