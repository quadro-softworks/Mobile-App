import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://guzosync-fastapi.onrender.com';

// Types for the incident API
export interface IncidentLocation {
  latitude: number;
  longitude: number;
}

export interface CreateIncidentRequest {
  description: string;
  location: IncidentLocation;
  related_bus_id?: string;
  related_route_id?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface IncidentResponse {
  created_at: string;
  updated_at: string;
  id: string;
  reported_by_user_id: string;
  description: string;
  location: IncidentLocation;
  related_bus_id?: string;
  related_route_id?: string;
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
  const token = await AsyncStorage.getItem('auth_token');
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
      
      const response = await fetch(`${API_BASE_URL}/api/drivers/incidents`, {
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
   * Get user's reported incidents (if endpoint exists)
   */
  getUserIncidents: async (): Promise<IncidentResponse[]> => {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/drivers/incidents`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 404) {
          // Endpoint might not exist yet, return empty array
          return [];
        } else {
          throw new Error('Failed to fetch incidents');
        }
      }

      const result: IncidentResponse[] = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred while fetching incidents');
    }
  },
};
