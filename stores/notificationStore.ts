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
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to fetch notifications';

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
          } catch (parseError) {
            console.warn('Failed to parse error response as JSON:', parseError);
            errorMessage = `Server error (${response.status}): ${response.statusText}`;
          }
        } else {
          // Handle non-JSON error responses (like HTML error pages)
          const errorText = await response.text();
          console.warn('Received non-JSON error response:', errorText.substring(0, 200));

          if (response.status === 500) {
            errorMessage = 'Server is temporarily unavailable. Please try again later.';
          } else if (response.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to access notifications.';
          } else {
            errorMessage = `Server error (${response.status}). Please try again later.`;
          }
        }

        throw new Error(errorMessage);
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response format. Please try again later.');
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
        type: notification.type as 'ALERT' | 'INFO' | 'PROMO' | 'SYSTEM' | 'UPDATE',
      }));

      set({ notifications: transformedNotifications, isLoading: false });
    } catch (error) {
      console.error('Fetch notifications error:', error);

      // Provide more user-friendly error messages
      let errorMessage = 'Failed to fetch notifications';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          errorMessage = 'Network connection failed. Please check your internet connection.';
        } else if (error.message.includes('JSON')) {
          errorMessage = 'Server returned invalid data. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }

      set({ error: errorMessage, isLoading: false });
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