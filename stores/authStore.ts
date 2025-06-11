import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/services/mockApi';
import { AuthState } from '@/types';

interface AuthStore extends AuthState {
  register: (userData: any) => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
  updateLanguage: (language: string) => Promise<void>;
  updateNotificationSettings: (settings: any) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      hasHydrated: false,

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('https://guzosync-fastapi.onrender.com/api/accounts/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || 'Registration failed');
          }
          // Registration successful, but backend may not return user/token
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      login: async (credentials) => {
        console.log('🔐 Auth store login called with:', { email: credentials.email, password: credentials.password ? '***' : 'empty' });
        set({ isLoading: true, error: null });
        console.log('🔄 Set loading state to true');

        try {
          console.log('📡 Making API call to login endpoint...');
          const res = await fetch('https://guzosync-fastapi.onrender.com/api/accounts/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });

          console.log('📡 API response received:', { status: res.status, ok: res.ok });
          if (!res.ok) {
            console.log('❌ API call failed with status:', res.status);
            const data = await res.json();
            console.log('❌ Error data:', data);
            throw new Error(data.detail || 'Login failed');
          }

          console.log('✅ API call successful, parsing response...');
          const data = await res.json();
          console.log('📦 Login response data:', data);

          // Handle the actual API response structure
          const token = data.access_token || data.token;
          const userRole = data.role as "PASSENGER" | "BUS_DRIVER" | "QUEUE_REGULATOR";

          // Create user object from the response
          const user = {
            id: data.sub || 'user-id', // Use sub from JWT or fallback
            name: data.name || 'User', // Fallback name
            email: credentials.email, // Use the email from login credentials
            phone: data.phone || '',
            language: data.language || 'en',
            role: userRole,
            notificationSettings: {
              pushEnabled: true,
              emailEnabled: true,
              alertTypes: ['delay', 'route-change', 'service-disruption'],
            },
            favoriteStops: [],
            favoriteRoutes: [],
          };

          console.log('Setting user and token in store:', { user, token });

          // Also save token to AsyncStorage for backward compatibility
          await AsyncStorage.setItem('auth_token', token);

          set({
            user: user,
            token: token,
            isLoading: false
          });

          // Small delay to ensure state is updated before navigation
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
          // Also clear AsyncStorage token
          await AsyncStorage.removeItem('auth_token');
          set({ user: null, token: null, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const currentState = get();
          if (!currentState.token) {
            throw new Error('No authentication token found');
          }

          // Call the real API to update profile
          const res = await fetch('https://guzosync-fastapi.onrender.com/api/account/me', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentState.token}`,
            },
            body: JSON.stringify({
              first_name: userData.first_name || (userData.name ? userData.name.split(' ')[0] : ''),
              last_name: userData.last_name || (userData.name ? userData.name.split(' ').slice(1).join(' ') : ''),
              email: userData.email,
              phone_number: userData.phone_number || userData.phone,
              profile_image: userData.profile_image || '',
            }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Failed to update profile');
          }

          const updatedUserData = await res.json();
          console.log('Profile update response:', updatedUserData);

          // Update the user in the store with the response data
          const updatedUser = {
            ...currentState.user,
            id: updatedUserData.id,
            name: `${updatedUserData.first_name} ${updatedUserData.last_name}`.trim(),
            email: updatedUserData.email,
            phone: updatedUserData.phone_number,
            role: updatedUserData.role as "PASSENGER" | "BUS_DRIVER" | "DRIVE" | "QUEUE_REGULATOR",
            // Keep existing fields that aren't returned by the API
            language: currentState.user?.language || 'en',
            notificationSettings: currentState.user?.notificationSettings || {
              pushEnabled: true,
              emailEnabled: true,
              alertTypes: ['delay', 'route-change', 'service-disruption'],
            },
            favoriteStops: currentState.user?.favoriteStops || [],
            favoriteRoutes: currentState.user?.favoriteRoutes || [],
          };

          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          console.error('Profile update error:', error);
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateLanguage: async (language) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authApi.updateProfile({ language });
          set({ user: { ...updatedUser, role: updatedUser.role as "PASSENGER" | "BUS_DRIVER" | "DRIVE" | "QUEUE_REGULATOR" }, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateNotificationSettings: async (settings) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.updateProfile({
            notificationSettings: {
              ...get().user?.notificationSettings,
              ...settings,
            },
          });
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  notificationSettings: {
                    ...state.user.notificationSettings,
                    ...settings,
                  },
                }
              : null,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // Since we're using the real API and Zustand persist handles the token storage,
          // we just need to check if we have a valid token and user in the store
          const currentState = get();
          if (currentState.token && currentState.user) {
            // We have a stored session, keep it
            set({ isLoading: false });
          } else {
            // No stored session, clear everything
            set({ user: null, token: null, isLoading: false });
          }
        } catch (error) {
          set({ user: null, token: null, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),

      fetchCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const currentState = get();
          if (!currentState.token) {
            throw new Error('No authentication token found');
          }

          const res = await fetch('https://guzosync-fastapi.onrender.com/api/account/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${currentState.token}`,
            },
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Failed to fetch user profile');
          }

          const userData = await res.json();
          console.log('Fetched user profile:', userData);

          // Update the user in the store with the fetched data
          const updatedUser = {
            ...currentState.user,
            id: userData.id,
            name: `${userData.first_name} ${userData.last_name}`.trim(),
            email: userData.email,
            phone: userData.phone_number,
            role: userData.role as "PASSENGER" | "BUS_DRIVER" | "DRIVE" | "QUEUE_REGULATOR",
            // Keep existing fields that aren't returned by the API
            language: currentState.user?.language || 'en',
            notificationSettings: currentState.user?.notificationSettings || {
              pushEnabled: true,
              emailEnabled: true,
              alertTypes: ['delay', 'route-change', 'service-disruption'],
            },
            favoriteStops: currentState.user?.favoriteStops || [],
            favoriteRoutes: currentState.user?.favoriteRoutes || [],
          };

          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          console.error('Fetch user profile error:', error);
          set({ error: (error as Error).message, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log('Zustand store hydrated:', state);
        state?.setHasHydrated(true);
      },
    }
  )
);