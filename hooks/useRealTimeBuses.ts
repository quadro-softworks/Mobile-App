import { useEffect, useState, useCallback } from 'react';
import { Bus } from '@/types';
import { busTrackingSocket, BusLocationUpdate } from '@/utils/socket';
import { useBusStore } from '@/stores/busStore';
import { useAuthStore } from '@/stores/authStore';

interface RealTimeBus extends Bus {
  heading?: number;
  speed?: number;
  isRealTime: boolean;
}

interface UseRealTimeBusesReturn {
  buses: RealTimeBus[];
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  isUsingFallback: boolean;
  joinAreaTracking: (bounds: { north: number; south: number; east: number; west: number }) => void;
  joinBusTracking: (busId: string) => void;
  leaveBusTracking: (busId: string) => void;
}

export function useRealTimeBuses(): UseRealTimeBusesReturn {
  const { buses: storeBuses, fetchBuses } = useBusStore();
  const { token, hasHydrated } = useAuthStore();
  const [realTimeBuses, setRealTimeBuses] = useState<Map<string, RealTimeBus>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Initialize buses from store
  useEffect(() => {
    const initialBuses = new Map<string, RealTimeBus>();
    storeBuses.forEach(bus => {
      initialBuses.set(bus.id, {
        ...bus,
        isRealTime: false
      });
    });
    setRealTimeBuses(initialBuses);
  }, [storeBuses]);

  // Handle bus location updates
  const handleBusLocationUpdate = useCallback((data: BusLocationUpdate) => {
    console.log('🔄 Updating bus location:', data.busId);
    
    setRealTimeBuses(prev => {
      const updated = new Map(prev);
      const existingBus = updated.get(data.busId);
      
      if (existingBus) {
        // Update existing bus with real-time data
        updated.set(data.busId, {
          ...existingBus,
          coordinates: {
            latitude: data.latitude,
            longitude: data.longitude
          },
          status: data.status,
          eta: data.eta,
          nextStop: data.nextStop,
          heading: data.heading,
          speed: data.speed,
          lastUpdated: data.timestamp,
          isRealTime: true
        });
      } else {
        // Create new bus entry if not exists
        updated.set(data.busId, {
          id: data.busId,
          name: `Bus ${data.busId}`,
          routeId: 'unknown',
          routeName: 'Unknown Route',
          coordinates: {
            latitude: data.latitude,
            longitude: data.longitude
          },
          status: data.status,
          capacity: 'medium',
          nextStop: data.nextStop,
          eta: data.eta,
          heading: data.heading,
          speed: data.speed,
          lastUpdated: data.timestamp,
          isRealTime: true
        });
      }
      
      return updated;
    });
  }, []);

  // Handle bus status updates
  const handleBusStatusUpdate = useCallback((data: { busId: string; status: string; eta: number }) => {
    console.log('🔄 Updating bus status:', data.busId);
    
    setRealTimeBuses(prev => {
      const updated = new Map(prev);
      const existingBus = updated.get(data.busId);
      
      if (existingBus) {
        updated.set(data.busId, {
          ...existingBus,
          status: data.status as 'on-time' | 'delayed' | 'early',
          eta: data.eta,
          lastUpdated: new Date().toISOString(),
          isRealTime: true
        });
      }
      
      return updated;
    });
  }, []);

  // Handle connection status changes
  const handleConnect = useCallback(() => {
    console.log('✅ Real-time bus tracking connected');
    setIsConnected(true);
    setConnectionStatus('connected');
    setIsUsingFallback(false);
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('❌ Real-time bus tracking disconnected');
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('🚨 Real-time bus tracking error:', error);
    setIsConnected(false);
    setConnectionStatus('fallback');
    setIsUsingFallback(true);
  }, []);

  // Monitor auth changes and retry connection when token becomes available
  useEffect(() => {
    if (hasHydrated && token && busTrackingSocket.isUsingFallback()) {
      console.log('🔑 Auth token available, retrying WebSocket connection...');
      busTrackingSocket.retryWithAuth();
    }
  }, [token, hasHydrated]);

  // Set up WebSocket listeners
  useEffect(() => {
    console.log('🎧 Setting up real-time bus tracking listeners');

    // Subscribe to events
    const unsubscribeLocationUpdate = busTrackingSocket.on('bus:location:update', handleBusLocationUpdate);
    const unsubscribeStatusUpdate = busTrackingSocket.on('bus:status:update', handleBusStatusUpdate);
    const unsubscribeConnect = busTrackingSocket.on('connect', handleConnect);
    const unsubscribeDisconnect = busTrackingSocket.on('disconnect', handleDisconnect);
    const unsubscribeError = busTrackingSocket.on('error', handleError);

    // Update initial connection status
    setIsConnected(busTrackingSocket.isConnected());
    setConnectionStatus(busTrackingSocket.getConnectionStatus());
    setIsUsingFallback(busTrackingSocket.isUsingFallback());

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up real-time bus tracking listeners');
      unsubscribeLocationUpdate();
      unsubscribeStatusUpdate();
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
    };
  }, [handleBusLocationUpdate, handleBusStatusUpdate, handleConnect, handleDisconnect, handleError]);

  // Wrapper functions for socket methods
  const joinAreaTracking = useCallback((bounds: { north: number; south: number; east: number; west: number }) => {
    busTrackingSocket.joinAreaTracking(bounds);
  }, []);

  const joinBusTracking = useCallback((busId: string) => {
    busTrackingSocket.joinBusTracking(busId);
  }, []);

  const leaveBusTracking = useCallback((busId: string) => {
    busTrackingSocket.leaveBusTracking(busId);
  }, []);

  // Convert Map to Array for return
  const buses = Array.from(realTimeBuses.values());

  return {
    buses,
    isConnected,
    connectionStatus,
    isUsingFallback,
    joinAreaTracking,
    joinBusTracking,
    leaveBusTracking
  };
}
