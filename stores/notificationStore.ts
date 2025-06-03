import { create } from 'zustand';
import { notificationsApi } from '@/services/mockApi';
import { Notification } from '@/types';

interface NotificationStore {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  updateNotificationSettings: (settings: any) => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  isLoading: false,
  error: null,
  
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationsApi.getNotifications();
      set({ notifications, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  markNotificationAsRead: async (notificationId) => {
    try {
      await notificationsApi.markNotificationAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  
  updateNotificationSettings: async (settings) => {
    set({ isLoading: true, error: null });
    try {
      await notificationsApi.updateNotificationSettings(settings);
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
}));