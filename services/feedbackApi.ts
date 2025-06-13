import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

export interface FeedbackRequest {
  content: string;
  rating: number;
  related_trip_id?: string;
  related_bus_id?: string;
}

export interface FeedbackResponse {
  created_at: string;
  updated_at: string;
  id: string;
  submitted_by_user_id: string;
  content: string;
  rating: number;
  related_trip_id?: string;
  related_bus_id?: string;
}

export interface ValidationError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const authState = useAuthStore.getState();
  console.log('Feedback API - Auth token:', authState.token ? 'Present' : 'Missing');

  if (!authState.token) {
    throw new Error('Authentication required. Please log in again.');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authState.token}`,
  };
};

// Feedback API service
export const feedbackApi = {
  /**
   * Submit feedback
   */
  submitFeedback: async (feedbackData: FeedbackRequest): Promise<FeedbackResponse> => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to submit feedback';

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
          } catch (parseError) {
            console.warn('Failed to parse error response as JSON:', parseError);
            errorMessage = `Server error (${response.status}): ${response.statusText}`;
          }
        } else {
          // Handle non-JSON error responses
          const errorText = await response.text();
          console.warn('Received non-JSON error response:', errorText.substring(0, 200));
          errorMessage = `Server error (${response.status}). Please try again later.`;
        }

        throw new Error(errorMessage);
      }

      const feedback: FeedbackResponse = await response.json();
      console.log('Feedback submitted successfully:', feedback);
      return feedback;
    } catch (error) {
      console.error('Submit feedback error:', error);
      throw error;
    }
  },
};
