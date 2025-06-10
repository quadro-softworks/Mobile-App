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
  
  fetchUserIncidents: async () => {
    set({ isLoading: true, error: null });
    try {
      const incidents = await incidentApi.getUserIncidents();
      set({ incidents, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch incidents';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
}));
