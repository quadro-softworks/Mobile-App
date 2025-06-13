import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Types for the incident API
export interface IncidentLocation {
  latitude: number;
  longitude: number;
}

export interface CreateIncidentRequest {
  description: string;
  incident_type: 'VEHICLE_ISSUE' | 'SAFETY_CONCERN' | 'OTHER';
  location: IncidentLocation;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface IncidentResponse {
  created_at: string;
  updated_at: string;
  id: string;
  reported_by_user_id: string;
  description: string;
  incident_type: 'VEHICLE_ISSUE' | 'SAFETY_CONCERN' | 'OTHER';
  location: IncidentLocation;
  is_resolved: boolean;
  resolution_notes?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ValidationError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

// Helper function to get auth headers
const getAuthHeaders = async () => {
  // First try to get token from AsyncStorage (for backward compatibility)
  let token = await AsyncStorage.getItem('auth_token');

  // If not found, try to get from Zustand store (check localStorage for web or AsyncStorage)
  if (!token) {
    try {
      const authStorage = await AsyncStorage.getItem('auth-storage');
      if (authStorage) {
        const parsedAuth = JSON.parse(authStorage);
        token = parsedAuth?.state?.token;
      }
    } catch (error) {
      console.log('Could not get token from auth storage:', error);
    }
  }

  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Incident API service
export const incidentApi = {
  /**
   * Report a driver incident
   */
  reportIncident: async (incidentData: CreateIncidentRequest): Promise<IncidentResponse> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/issues/report`, {
        method: 'POST',
        headers,
        body: JSON.stringify(incidentData),
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errorData: ValidationError = await response.json();
          const errorMessages = errorData.detail.map(err => err.msg).join(', ');
          throw new Error(`Validation Error: ${errorMessages}`);
        } else if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to report incidents.');
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to report incident: ${errorText}`);
        }
      }

      const result: IncidentResponse = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred while reporting incident');
    }
  },

  /**
   * Get user's reported incidents
   */
  getUserIncidents: async (skip: number = 0, limit: number = 50): Promise<IncidentResponse[]> => {
    try {
      const headers = await getAuthHeaders();

      // Add pagination parameters
      const url = new URL(`${API_BASE_URL}/api/issues`);
      url.searchParams.append('skip', skip.toString());
      url.searchParams.append('limit', limit.toString());

      console.log('Fetching incidents from:', url.toString());
      console.log('Headers:', headers);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);

        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 404) {
          // Endpoint might not exist yet, return empty array
          return [];
        } else {
          throw new Error(`Failed to fetch incidents: ${response.status} ${errorText}`);
        }
      }

      const result: IncidentResponse[] = await response.json();
      console.log('Fetched incidents:', result);
      return result;
    } catch (error) {
      console.error('Error in getUserIncidents:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred while fetching incidents');
    }
  },

  /**
   * Debug function to check auth token
   */
  debugAuthToken: async () => {
    const headers = await getAuthHeaders();
    console.log('Current auth headers:', headers);

    // Also check AsyncStorage directly
    const asyncToken = await AsyncStorage.getItem('auth_token');
    console.log('AsyncStorage auth_token:', asyncToken);

    // Check auth storage
    const authStorage = await AsyncStorage.getItem('auth-storage');
    console.log('Auth storage:', authStorage);

    return headers;
  },
};
