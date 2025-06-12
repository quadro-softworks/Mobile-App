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
  fetchBusStops: (params?: SearchParams, append?: boolean) => Promise<void>;
  fetchAllBusStops: (searchParams?: SearchParams, append?: boolean) => Promise<void>;
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
  
  fetchBusStops: async (params = {}, append = false) => {
    set({ isLoading: !append, error: null });
    try {
      // Get the auth token from the auth store
      const authState = useAuthStore.getState();
      if (!authState.token) {
        console.warn('No authentication token found, using mock data');
        // Use mock data if no token - get all available mock stops
        const mockStops = await busApi.getBusStops({ ...params, ps: 1000 });
        const transformedStops = mockStops.items
          .filter((stop: any) => {
            // Filter out stops without valid location data
            const hasLocation = stop.location &&
              typeof stop.location.latitude === 'number' &&
              typeof stop.location.longitude === 'number';

            const hasCoordinates = stop.coordinates &&
              typeof stop.coordinates.latitude === 'number' &&
              typeof stop.coordinates.longitude === 'number';

            if (!hasLocation && !hasCoordinates) {
              console.warn('Filtering out mock bus stop without valid coordinates:', stop.name, stop);
              return false;
            }

            return true;
          })
          .map((stop: any) => ({
            ...stop,
            coordinates: {
              latitude: stop.location?.latitude || stop.coordinates?.latitude,
              longitude: stop.location?.longitude || stop.coordinates?.longitude,
            },
            routes: stop.routes || [],
          }));

        set({
          stops: append ? [...get().stops, ...transformedStops] : transformedStops,
          isLoading: false
        });
        console.log('Loaded', transformedStops.length, 'mock bus stops');
        return;
      }

      const searchParams = { ...get().searchParams, ...params };

      // If requesting a large number of stops, try to get all available
      if (searchParams.ps && searchParams.ps >= 1000) {
        console.log('Fetching ALL bus stops from API...');
        await get().fetchAllBusStops(searchParams, append);
        return;
      }

      // Build query parameters for regular fetch
      const queryParams = new URLSearchParams();
      if (searchParams.search) queryParams.append('search', searchParams.search);
      if (searchParams.filterBy) queryParams.append('filter_by', searchParams.filterBy);
      if (searchParams.pn) queryParams.append('pn', searchParams.pn.toString());
      if (searchParams.ps) queryParams.append('ps', searchParams.ps.toString());

      console.log('Fetching bus stops from API with params:', queryParams.toString());

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

      console.log('API Response status:', response.status, 'OK:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch bus stops');
      }

      const stops: BusStop[] = await response.json();
      console.log('Fetched bus stops from API:', stops.length, 'stops');

      // Transform API response to include legacy fields for backward compatibility
      const transformedStops = stops
        .filter(stop => {
          // Filter out stops without valid location data
          const hasValidLocation = stop.location &&
            typeof stop.location.latitude === 'number' &&
            typeof stop.location.longitude === 'number';

          if (!hasValidLocation) {
            console.warn('Filtering out bus stop without valid location:', stop.name, stop);
            return false;
          }

          return true;
        })
        .map(stop => ({
          ...stop,
          // Add legacy fields for backward compatibility
          coordinates: {
            latitude: stop.location.latitude,
            longitude: stop.location.longitude,
          },
          routes: [], // This would need to be fetched separately or included in the API
        }));

      const currentStops = get().stops;

      set({
        stops: append ? [...currentStops, ...transformedStops] : transformedStops,
        searchParams: {
          ...searchParams,
          pn: searchParams.pn || 1,
          ps: searchParams.ps || 10
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Fetch bus stops error:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to fetch bus stops';
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          errorMessage = 'Network connection failed - using offline data';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Server unavailable - using offline data';
        } else {
          errorMessage = error.message;
        }
      }

      console.log('Falling back to mock data due to:', errorMessage);

      // Fallback to mock data - get all available mock stops
      try {
        const mockStops = await busApi.getBusStops({ ...params, ps: 1000 });
        const transformedStops = mockStops.items
          .filter((stop: any) => {
            // Filter out stops without valid location data
            const hasLocation = stop.location &&
              typeof stop.location.latitude === 'number' &&
              typeof stop.location.longitude === 'number';

            const hasCoordinates = stop.coordinates &&
              typeof stop.coordinates.latitude === 'number' &&
              typeof stop.coordinates.longitude === 'number';

            if (!hasLocation && !hasCoordinates) {
              console.warn('Filtering out fallback mock bus stop without valid coordinates:', stop.name, stop);
              return false;
            }

            return true;
          })
          .map((stop: any) => ({
            ...stop,
            coordinates: {
              latitude: stop.location?.latitude || stop.coordinates?.latitude,
              longitude: stop.location?.longitude || stop.coordinates?.longitude,
            },
            routes: stop.routes || [],
          }));

        set({
          stops: append ? [...get().stops, ...transformedStops] : transformedStops,
          error: errorMessage,
          isLoading: false
        });
        console.log('✅ Loaded', transformedStops.length, 'fallback mock bus stops');
      } catch (mockError) {
        console.error('Mock data also failed:', mockError);
        set({ error: errorMessage, isLoading: false });
      }
    }
  },

  fetchAllBusStops: async (searchParams: SearchParams = {} as SearchParams, append = false) => {
    try {
      const authState = useAuthStore.getState();
      if (!authState.token) {
        throw new Error('No authentication token found');
      }

      let allStops: BusStop[] = [];
      let currentPage = 1;
      const pageSize = 100; // Fetch in chunks of 100
      let hasMoreData = true;

      console.log('Starting to fetch ALL bus stops...');

      while (hasMoreData) {
        const queryParams = new URLSearchParams();
        if (searchParams.search) queryParams.append('search', searchParams.search);
        if (searchParams.filterBy) queryParams.append('filter_by', searchParams.filterBy);
        queryParams.append('pn', currentPage.toString());
        queryParams.append('ps', pageSize.toString());

        console.log(`Fetching page ${currentPage} with ${pageSize} stops per page...`);

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

        console.log(`Page ${currentPage} response status:`, response.status, 'OK:', response.ok);

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            console.error('Failed to parse error response on page', currentPage);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          console.error('API Error on page', currentPage, ':', errorData);
          throw new Error(errorData.detail || `Failed to fetch bus stops (HTTP ${response.status})`);
        }

        const pageStops: BusStop[] = await response.json();
        console.log(`Fetched ${pageStops.length} stops from page ${currentPage}`);

        if (pageStops.length === 0 || pageStops.length < pageSize) {
          hasMoreData = false;
        }

        allStops = [...allStops, ...pageStops];
        currentPage++;

        // Safety limit to prevent infinite loops
        if (currentPage > 50) {
          console.warn('Reached maximum page limit (50), stopping fetch');
          break;
        }
      }

      console.log(`Successfully fetched ALL ${allStops.length} bus stops from API`);

      // Transform API response to include legacy fields for backward compatibility
      const transformedStops = allStops.map(stop => ({
        ...stop,
        // Add legacy fields for backward compatibility
        coordinates: {
          latitude: stop.location.latitude,
          longitude: stop.location.longitude,
        },
        routes: [], // This would need to be fetched separately or included in the API
      }));

      const currentStops = get().stops;

      set({
        stops: append ? [...currentStops, ...transformedStops] : transformedStops,
        searchParams: {
          ...searchParams,
          pn: 1,
          ps: allStops.length
        },
        isLoading: false
      });

    } catch (error) {
      console.error('Fetch all bus stops error:', error);
      throw error; // Re-throw to be caught by the main fetchBusStops method
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
    // Real-time WebSocket listeners are now handled by useRealTimeBuses hook
    // This method is kept for compatibility but does nothing
    console.log('📡 Real-time bus tracking handled by useRealTimeBuses hook');
    return () => {}; // Return empty cleanup function
  },
}));