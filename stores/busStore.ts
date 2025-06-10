import { create } from 'zustand';
import { busApi, mockWebSocket } from '@/services/mockApi';
import { Bus, BusStop, Route, PaginatedResponse, SearchParams } from '@/types';
import { useAuthStore } from './authStore';

interface BusStore {
  buses: Bus[];
  selectedBus: Bus | null;
  routes: Route[];
  selectedRoute: Route | null;
  stops: BusStop[];
  selectedStop: BusStop | null;
  searchParams: SearchParams;
  isLoading: boolean;
  error: string | null;
  
  fetchBuses: () => Promise<void>;
  fetchBusById: (busId: string) => Promise<void>;
  fetchRoutes: () => Promise<void>;
  fetchRouteById: (routeId: string) => Promise<void>;
  fetchBusStops: (params?: SearchParams) => Promise<void>;
  fetchBusStopById: (stopId: string) => Promise<void>;
  setSearchParams: (params: Partial<SearchParams>) => void;
  clearSelectedBus: () => void;
  clearSelectedRoute: () => void;
  clearSelectedStop: () => void;
  clearError: () => void;
  setupWebSocketListeners: () => () => void;
}

export const useBusStore = create<BusStore>((set, get) => ({
  buses: [],
  selectedBus: null,
  routes: [],
  selectedRoute: null,
  stops: [],
  selectedStop: null,
  searchParams: {
    search: '',
    pn: 1,
    ps: 10,
  },
  isLoading: false,
  error: null,
  
  fetchBuses: async () => {
    set({ isLoading: true, error: null });
    try {
      const buses = await busApi.getBuses();
      set({ buses, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchBusById: async (busId) => {
    set({ isLoading: true, error: null });
    try {
      const bus = await busApi.getBusById(busId);
      set({ selectedBus: bus, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchRoutes: async () => {
    set({ isLoading: true, error: null });
    try {
      const routes = await busApi.getRoutes();
      set({ routes, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchRouteById: async (routeId) => {
    set({ isLoading: true, error: null });
    try {
      const route = await busApi.getRouteById(routeId);
      set({ selectedRoute: route, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchBusStops: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Get the auth token from the auth store
      const authState = useAuthStore.getState();
      if (!authState.token) {
        throw new Error('No authentication token found');
      }

      const searchParams = { ...get().searchParams, ...params };

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (searchParams.search) queryParams.append('search', searchParams.search);
      if (searchParams.filterBy) queryParams.append('filter_by', searchParams.filterBy);
      if (searchParams.pn) queryParams.append('pn', searchParams.pn.toString());
      if (searchParams.ps) queryParams.append('ps', searchParams.ps.toString());

      const response = await fetch(
        `https://guzosync-fastapi.onrender.com/api/buses/stops?${queryParams.toString()}`,
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
        throw new Error(errorData.detail || 'Failed to fetch bus stops');
      }

      const stops: BusStop[] = await response.json();
      console.log('Fetched bus stops:', stops);

      // Transform API response to include legacy fields for backward compatibility
      const transformedStops = stops.map(stop => ({
        ...stop,
        // Add legacy fields for backward compatibility
        coordinates: {
          latitude: stop.location.latitude,
          longitude: stop.location.longitude,
        },
        routes: [], // This would need to be fetched separately or included in the API
      }));

      set({
        stops: transformedStops,
        searchParams: {
          ...searchParams,
          pn: searchParams.pn || 1,
          ps: searchParams.ps || 10
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Fetch bus stops error:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchBusStopById: async (stopId) => {
    set({ isLoading: true, error: null });
    try {
      // Get the auth token from the auth store
      const authState = useAuthStore.getState();
      if (!authState.token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `https://guzosync-fastapi.onrender.com/api/buses/stops/${stopId}`,
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
        throw new Error(errorData.detail || 'Failed to fetch bus stop');
      }

      const stop: BusStop = await response.json();
      console.log('Fetched bus stop:', stop);

      // Transform API response to include legacy fields for backward compatibility
      const transformedStop = {
        ...stop,
        // Add legacy fields for backward compatibility
        coordinates: {
          latitude: stop.location.latitude,
          longitude: stop.location.longitude,
        },
        routes: [], // This would need to be fetched separately or included in the API
        approachingBuses: [], // This would need to be fetched from a separate endpoint
      };

      set({ selectedStop: transformedStop, isLoading: false });
    } catch (error) {
      console.error('Fetch bus stop by ID error:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  setSearchParams: (params) => {
    set((state) => ({
      searchParams: { ...state.searchParams, ...params }
    }));
  },
  
  clearSelectedBus: () => set({ selectedBus: null }),
  clearSelectedRoute: () => set({ selectedRoute: null }),
  clearSelectedStop: () => set({ selectedStop: null }),
  clearError: () => set({ error: null }),
  
  setupWebSocketListeners: () => {
    // Listen for bus updates
    const unsubscribe = mockWebSocket.on('tracking.bus_updates', (updatedBuses: Bus[]) => {
      set({ buses: updatedBuses });
      
      // If there's a selected bus, update it too
      const selectedBus = get().selectedBus;
      if (selectedBus) {
        const updatedBus = updatedBuses.find(b => b.id === selectedBus.id);
        if (updatedBus) {
          set({ selectedBus: updatedBus });
        }
      }
      
      // If there's a selected stop, update approaching buses
      const selectedStop = get().selectedStop;
      if (selectedStop && selectedStop.approachingBuses) {
        const updatedApproachingBuses = selectedStop.approachingBuses.map(bus => {
          const updatedBus = updatedBuses.find(b => b.id === bus.id);
          return updatedBus || bus;
        });
        
        set({
          selectedStop: {
            ...selectedStop,
            approachingBuses: updatedApproachingBuses,
          },
        });
      }
    });
    
    return unsubscribe;
  },
}));