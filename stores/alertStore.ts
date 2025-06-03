import { create } from 'zustand';
import { alertsApi, mockWebSocket } from '@/services/mockApi';
import { Alert } from '@/types';

interface AlertStore {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  
  fetchAlerts: () => Promise<void>;
  createAlert: (alertData: Partial<Alert>) => Promise<void>;
  updateAlert: (alertId: string, alertData: Partial<Alert>) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  clearError: () => void;
  setupWebSocketListeners: () => () => void;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  isLoading: false,
  error: null,
  
  fetchAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await alertsApi.getAlerts();
      set({ alerts, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  createAlert: async (alertData) => {
    set({ isLoading: true, error: null });
    try {
      const newAlert = await alertsApi.createAlert(alertData);
      set((state) => ({
        alerts: [...state.alerts, newAlert],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  updateAlert: async (alertId, alertData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAlert = await alertsApi.updateAlert(alertId, alertData);
      set((state) => ({
        alerts: state.alerts.map(alert => 
          alert.id === alertId ? updatedAlert : alert
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  deleteAlert: async (alertId) => {
    set({ isLoading: true, error: null });
    try {
      await alertsApi.deleteAlert(alertId);
      set((state) => ({
        alerts: state.alerts.filter(alert => alert.id !== alertId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  markAlertAsRead: async (alertId) => {
    try {
      await alertsApi.updateAlert(alertId, { read: true });
      set((state) => ({
        alerts: state.alerts.map(alert => 
          alert.id === alertId ? { ...alert, read: true } : alert
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  
  clearError: () => set({ error: null }),
  
  setupWebSocketListeners: () => {
    // Listen for new alerts
    const unsubscribe = mockWebSocket.on('alerts', (newAlert: Alert) => {
      set((state) => ({
        alerts: [newAlert, ...state.alerts],
      }));
    });
    
    return unsubscribe;
  },
}));