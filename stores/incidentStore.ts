import { create } from 'zustand';
import { incidentApi, IncidentResponse, CreateIncidentRequest } from '@/services/incidentApi';

interface IncidentStore {
  incidents: IncidentResponse[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  reportIncident: (incidentData: CreateIncidentRequest) => Promise<IncidentResponse>;
  fetchUserIncidents: () => Promise<void>;
  clearError: () => void;
}

export const useIncidentStore = create<IncidentStore>((set, get) => ({
  incidents: [],
  isLoading: false,
  error: null,
  
  reportIncident: async (incidentData: CreateIncidentRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newIncident = await incidentApi.reportIncident(incidentData);
      
      // Add the new incident to the list
      set((state) => ({
        incidents: [newIncident, ...state.incidents],
        isLoading: false,
      }));
      
      return newIncident;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to report incident';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  fetchUserIncidents: async (skip: number = 0, limit: number = 50) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching user incidents with pagination:', { skip, limit });

      // Debug auth token first
      await incidentApi.debugAuthToken();

      const incidents = await incidentApi.getUserIncidents(skip, limit);
      console.log('Successfully fetched incidents:', incidents.length);
      set({ incidents, isLoading: false });
    } catch (error) {
      console.error('Error in fetchUserIncidents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch incidents';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
}));
