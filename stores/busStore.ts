import { create } from 'zustand';
import { busApi, mockWebSocket } from '@/services/mockApi';
import { Bus, BusStop, Route, PaginatedResponse, SearchParams } from '@/types';

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
      const searchParams = { ...get().searchParams, ...params };
      const response: PaginatedResponse<BusStop> = await busApi.getBusStops(searchParams);
      set({ 
        stops: response.items, 
        searchParams: { 
          ...searchParams,
          pn: response.page,
          ps: response.pageSize
        },
        isLoading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  fetchBusStopById: async (stopId) => {
    set({ isLoading: true, error: null });
    try {
      const stop = await busApi.getBusStopById(stopId);
      set({ selectedStop: stop, isLoading: false });
    } catch (error) {
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