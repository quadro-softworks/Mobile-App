import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/services/mockApi';
import { AuthState, User } from '@/types';

interface AuthStore extends AuthState {
  register: (userData: any) => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateLanguage: (language: string) => Promise<void>;
  updateNotificationSettings: (settings: any) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

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
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('https://guzosync-fastapi.onrender.com/api/accounts/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || 'Login failed');
          }
          const data = await res.json();
          console.log('Login response:', data);
          set({ 
            user: data.user ? { ...data.user, role: data.user.role as "PASSENGER" | "BUS_DRIVER" | "QUEUE_REGULATOR" } : null, 
            token: data.token, 
            isLoading: false 
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
          set({ user: null, token: null, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authApi.updateProfile(userData);
          set({ user: { ...updatedUser, role: updatedUser.role as "PASSENGER" | "BUS_DRIVER" | "QUEUE_REGULATOR" }, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateLanguage: async (language) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authApi.updateProfile({ language });
          set({ user: { ...updatedUser, role: updatedUser.role as "PASSENGER" | "BUS_DRIVER" | "QUEUE_REGULATOR" }, isLoading: false });
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
          const user = await authApi.getCurrentUser();
          set({ 
            user: user
              ? { 
                  ...user, 
                  role: user.role as "PASSENGER" | "BUS_DRIVER" | "QUEUE_REGULATOR"
                }
              : null, 
            isLoading: false 
          });
        } catch (error) {
          set({ user: null, token: null, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);