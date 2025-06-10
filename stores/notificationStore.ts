import { create } from 'zustand';
import { Notification } from '@/types';
import { useAuthStore } from './authStore';

interface NotificationStore {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;

  fetchNotifications: (skip?: number, limit?: number) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  isLoading: false,
  error: null,
  
  fetchNotifications: async (skip = 0, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      // Get the auth token from the auth store
      const authState = useAuthStore.getState();
      if (!authState.token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `https://guzosync-fastapi.onrender.com/api/notifications?skip=${skip}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch notifications');
      }

      const notifications: Notification[] = await response.json();
      console.log('Fetched notifications:', notifications);

      // Transform API response to include legacy fields for backward compatibility
      const transformedNotifications = notifications.map(notification => ({
        ...notification,
        // Add legacy fields for backward compatibility
        createdAt: notification.created_at,
        read: notification.is_read,
        // Normalize type to lowercase for UI compatibility
        type: notification.type as 'ALERT' | 'INFO' | 'PROMO' | 'SYSTEM',
      }));

      set({ notifications: transformedNotifications, isLoading: false });
    } catch (error) {
      console.error('Fetch notifications error:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  markNotificationAsRead: async (notificationId: string) => {
    try {
      const authState = useAuthStore.getState();
      if (!authState.token) {
        throw new Error('No authentication token found');
      }

      // Note: The API doesn't seem to have a mark as read endpoint in the provided spec
      // This would typically be a PATCH request to update the notification
      // For now, we'll update the local state optimistically
      set((state) => ({
        notifications: state.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true, read: true }
            : notification
        ),
      }));

      console.log(`Marked notification ${notificationId} as read`);
    } catch (error) {
      console.error('Mark notification as read error:', error);
      set({ error: (error as Error).message });
    }
  },
  
  markAllAsRead: async () => {
    try {
      const authState = useAuthStore.getState();
      if (!authState.token) {
        throw new Error('No authentication token found');
      }

      // Update all notifications as read locally
      set((state) => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          is_read: true,
          read: true,
        })),
      }));

      console.log('Marked all notifications as read');
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      set({ error: (error as Error).message });
    }
  },
  
  clearError: () => set({ error: null }),
}));