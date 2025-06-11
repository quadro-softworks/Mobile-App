import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Types for the user API based on the actual response
export interface UserProfile {
  created_at: string;
  updated_at: string;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'PASSENGER' | 'BUS_DRIVER' | 'QUEUE_REGULATOR';
  phone_number?: string;
  profile_image?: string;
  is_active: boolean;
}

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// User API service
export const userApi = {
  /**
   * Get current user profile
   * GET /api/account/me
   */
  getCurrentUser: async (): Promise<UserProfile> => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/account/me`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('User profile not found.');
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to fetch user profile: ${errorText}`);
        }
      }

      const result: UserProfile = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred while fetching user profile');
    }
  },

  /**
   * Update user profile
   * PUT /api/account/me (assuming this endpoint exists)
   */
  updateProfile: async (updateData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/account/me`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = await response.json();
          const errorMessages = errorData.detail?.map((err: any) => err.msg).join(', ') || 'Validation error';
          throw new Error(`Validation Error: ${errorMessages}`);
        } else if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('User profile not found.');
        } else {
          throw new Error('Failed to update user profile');
        }
      }

      const result: UserProfile = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred while updating user profile');
    }
  },

  /**
   * Update user language preference
   * This might be a separate endpoint or part of the profile update
   */
  updateLanguage: async (language: string): Promise<UserProfile> => {
    // For now, we'll use the profile update endpoint
    // If there's a specific language endpoint, we can update this
    return userApi.updateProfile({ language } as any);
  },
};
