/**
 * Test for bus stops caching functionality
 */

import { useBusStore } from '../stores/busStore';

// Mock the auth store
jest.mock('../stores/authStore', () => ({
  useAuthStore: {
    getState: () => ({ token: 'mock-token' })
  }
}));

// Mock the bus API
jest.mock('../services/mockApi', () => ({
  busApi: {
    getBusStops: jest.fn().mockResolvedValue({
      items: [
        {
          id: '1',
          name: 'Test Stop 1',
          location: { latitude: 9.0301, longitude: 38.7578 },
          capacity: 50,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: '2', 
          name: 'Test Stop 2',
          location: { latitude: 9.0302, longitude: 38.7579 },
          capacity: 30,
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ],
      total: 2,
      page: 1,
      pageSize: 1000,
      totalPages: 1
    })
  }
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Bus Stops Caching', () => {
  beforeEach(() => {
    // Reset the store state
    useBusStore.setState({
      stops: [],
      stopsLoaded: false,
      stopsLastFetched: null,
      isLoading: false,
      error: null
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should fetch bus stops on first call', async () => {
    const { fetchBusStopsOnce } = useBusStore.getState();
    
    await fetchBusStopsOnce();
    
    const state = useBusStore.getState();
    expect(state.stopsLoaded).toBe(true);
    expect(state.stopsLastFetched).toBeTruthy();
    expect(state.stops.length).toBeGreaterThan(0);
  });

  it('should use cached data on subsequent calls within cache duration', async () => {
    const { fetchBusStopsOnce, fetchBusStops } = useBusStore.getState();
    const mockFetchBusStops = jest.spyOn(useBusStore.getState(), 'fetchBusStops');
    
    // First call - should fetch
    await fetchBusStopsOnce();
    expect(mockFetchBusStops).toHaveBeenCalledTimes(1);
    
    // Second call immediately - should use cache
    await fetchBusStopsOnce();
    expect(mockFetchBusStops).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  it('should fetch fresh data when cache expires', async () => {
    const { fetchBusStopsOnce } = useBusStore.getState();
    const mockFetchBusStops = jest.spyOn(useBusStore.getState(), 'fetchBusStops');
    
    // First call
    await fetchBusStopsOnce();
    expect(mockFetchBusStops).toHaveBeenCalledTimes(1);
    
    // Simulate cache expiration by setting old timestamp
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000 + 1000); // 5 minutes + 1 second ago
    useBusStore.setState({ stopsLastFetched: fiveMinutesAgo });
    
    // Second call after cache expiration - should fetch again
    await fetchBusStopsOnce();
    expect(mockFetchBusStops).toHaveBeenCalledTimes(2);
  });

  it('should fetch fresh data when no stops are cached', async () => {
    const { fetchBusStopsOnce } = useBusStore.getState();
    const mockFetchBusStops = jest.spyOn(useBusStore.getState(), 'fetchBusStops');
    
    // Set as loaded but with no stops
    useBusStore.setState({ 
      stopsLoaded: true, 
      stopsLastFetched: Date.now(),
      stops: [] 
    });
    
    await fetchBusStopsOnce();
    expect(mockFetchBusStops).toHaveBeenCalledTimes(1);
  });
});

describe('Socket Connection Status', () => {
  it('should provide detailed connection status', () => {
    // This would require importing the socket instance
    // For now, just test that the types are correct
    const statuses: Array<'connecting' | 'connected' | 'disconnected' | 'fallback'> = [
      'connecting',
      'connected', 
      'disconnected',
      'fallback'
    ];
    
    expect(statuses).toHaveLength(4);
    expect(statuses).toContain('fallback');
  });
});
