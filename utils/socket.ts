import { useAuthStore } from '@/stores/authStore';

interface BusLocationUpdate {
  busId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: string;
  status: 'on-time' | 'delayed' | 'early';
  nextStop: string;
  eta: number;
}

interface SocketEvents {
  'bus:location:update': (data: BusLocationUpdate) => void;
  'bus:status:update': (data: { busId: string; status: string; eta: number }) => void;
  'bus:route:update': (data: { busId: string; routeId: string; stops: string[] }) => void;
  'connect': () => void;
  'disconnect': () => void;
  'error': (error: any) => void;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  event?: string;
  // Real backend format properties
  bus_id?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  heading?: number;
  speed?: number;
  timestamp?: string;
}

class BusTrackingSocket {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' = 'disconnected';
  private currentEndpointIndex = 0;
  private authToken: string | null = null;

  constructor() {
    // Don't connect immediately, wait for auth to be ready
    this.waitForAuthAndConnect();
  }

  private async waitForAuthAndConnect() {
    // Wait for auth store to be hydrated
    const authState = useAuthStore.getState();

    if (!authState.hasHydrated) {
      console.log('🔄 Waiting for auth store to hydrate...');
      // Wait for hydration
      const unsubscribe = useAuthStore.subscribe((state) => {
        if (state.hasHydrated) {
          unsubscribe();
          this.connect();
        }
      });
      return;
    }

    this.connect();
  }

  private connect() {
    try {
      this.connectionStatus = 'connecting';

      // Get auth token
      const authState = useAuthStore.getState();
      this.authToken = authState.token;

      console.log('🔑 Auth check:', {
        hasToken: !!this.authToken,
        tokenLength: this.authToken?.length,
        hasHydrated: authState.hasHydrated,
        user: authState.user?.email
      });

      if (!this.authToken) {
        console.warn('⚠️ No auth token available, cannot connect to real-time data');
        this.connectionStatus = 'disconnected';
        return;
      }

      const endpoints = [
            // Primary endpoint based on backend API info
            `wss://guzosync-fastapi.onrender.com/ws/connect?token=${encodeURIComponent(this.authToken)}`,
            // Fallback endpoints
            `wss://guzosync-fastapi.onrender.com/ws?token=${encodeURIComponent(this.authToken)}`,
            `wss://guzosync-fastapi.onrender.com/ws/connect?auth=${encodeURIComponent(this.authToken)}`,
          ];

      const currentEndpoint = endpoints[this.currentEndpointIndex];

      console.log('� Attempting to connect to WebSocket...');
      console.log('📡 Endpoint:', currentEndpoint);
      console.log('🔧 Attempt:', this.currentEndpointIndex + 1, 'of', endpoints.length);

      this.socket = new WebSocket(currentEndpoint);
      this.setupEventListeners();

    } catch (error) {
      console.error('❌ Failed to connect to bus tracking socket:', error);
      this.connectionStatus = 'disconnected';
      this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.socket) {
      console.warn('⚠️ No socket instance available for event listeners');
      return;
    }

    console.log('🎧 Setting up WebSocket event listeners...');

    this.socket.onopen = () => {
      console.log('✅ CONNECTED to bus tracking WebSocket!');
      console.log('🔗 WebSocket readyState:', this.socket?.readyState);
      console.log('📊 Connection details:', {
        readyState: this.socket?.readyState,
        url: this.socket?.url,
        timestamp: new Date().toISOString()
      });

      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.emit('connect');

      // Subscribe to all buses using the real backend format
      this.sendMessage('subscribe_all_buses', {});
      console.log('🚌 Subscribed to all bus location updates');
    };

    this.socket.onclose = (event) => {
      console.log('❌ DISCONNECTED from bus tracking WebSocket');
      console.log('🔍 Close code:', event.code, 'reason:', event.reason);
      console.log('📊 Disconnect details:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        timestamp: new Date().toISOString()
      });

      this.connectionStatus = 'disconnected';
      this.emit('disconnect');

      // Attempt reconnection unless it was a clean close
      if (event.code !== 1000) {
        console.log('🔄 Unexpected disconnect - attempting reconnection...');
        this.handleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('🚨 WEBSOCKET ERROR:', error);
      console.log('📊 Real-time connection failed - no bus data available');

      this.connectionStatus = 'disconnected';
      this.emit('error', error);
    };

    // Handle incoming messages
    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', {
          type: message.type,
          timestamp: new Date().toISOString()
        });

        // Handle different message types
        switch (message.type) {
          case 'bus:location:update':
          case 'bus_location_update': // Handle real backend format
            let locationData: BusLocationUpdate;

            if (message.type === 'bus_location_update') {
              // Convert real backend format to expected format
              if (message.bus_id && message.location) {
                locationData = {
                  busId: message.bus_id,
                  latitude: message.location.latitude,
                  longitude: message.location.longitude,
                  heading: message.heading || 0,
                  speed: message.speed || 0,
                  timestamp: message.timestamp || new Date().toISOString(),
                  status: 'on-time', // Default status, can be enhanced
                  nextStop: 'Unknown', // Default, can be enhanced
                  eta: 0 // Default, can be enhanced
                };
              } else {
                console.warn('Invalid bus location update format:', message);
                break;
              }
            } else {
              locationData = message.data as BusLocationUpdate;
            }

            console.log('📍 BUS LOCATION UPDATE received:', {
              busId: locationData.busId,
              coordinates: { lat: locationData.latitude, lng: locationData.longitude },
              status: locationData.status,
              eta: locationData.eta,
              timestamp: locationData.timestamp
            });
            this.emit('bus:location:update', locationData);
            break;

          case 'bus:status:update':
            console.log('🚌 BUS STATUS UPDATE received:', {
              busId: message.data.busId,
              status: message.data.status,
              eta: message.data.eta,
              timestamp: new Date().toISOString()
            });
            this.emit('bus:status:update', message.data);
            break;

          case 'bus:route:update':
            console.log('🛣️ BUS ROUTE UPDATE received:', {
              busId: message.data.busId,
              routeId: message.data.routeId,
              stops: message.data.stops?.length || 0,
              timestamp: new Date().toISOString()
            });
            this.emit('bus:route:update', message.data);
            break;

          case 'ping':
            console.log('🏓 Ping received from server');
            this.sendMessage('pong', {});
            break;

          case 'pong':
            console.log('🏓 Pong received from server');
            break;

          default:
            console.log('📨 Unknown message type:', message.type, message.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    console.log('✅ All WebSocket event listeners configured');
  }

  // Send message through WebSocket
  private sendMessage(type: string, data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = { type, data };
      this.socket.send(JSON.stringify(message));
      console.log('📤 Sent WebSocket message:', { type, timestamp: new Date().toISOString() });
    } else {
      console.warn('⚠️ Cannot send message - WebSocket not connected');
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. Staying disconnected.');
      this.connectionStatus = 'disconnected';
      this.emit('disconnect');
    }
  }

  // Removed fallback data method - only use real-time data

  // Subscribe to events
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Emit events to listeners
  private emit<K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          (callback as any)(...args);
        } catch (error) {
          console.error(`Error in socket event callback for ${event}:`, error);
        }
      });
    }
  }

  // Join a specific bus tracking room
  joinBusTracking(busId: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendMessage('join:bus:tracking', { busId });
      console.log(`🚌 Joined tracking for bus: ${busId}`);
    }
  }

  // Leave a specific bus tracking room
  leaveBusTracking(busId: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendMessage('leave:bus:tracking', { busId });
      console.log(`🚌 Left tracking for bus: ${busId}`);
    }
  }

  // Join route tracking
  joinRouteTracking(routeId: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendMessage('join:route:tracking', { routeId });
      console.log(`🛣️ Joined tracking for route: ${routeId}`);
    }
  }

  // Leave route tracking
  leaveRouteTracking(routeId: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendMessage('leave:route:tracking', { routeId });
      console.log(`🛣️ Left tracking for route: ${routeId}`);
    }
  }

  // Join general area tracking
  joinAreaTracking(bounds: { north: number; south: number; east: number; west: number }) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Use real backend format for area tracking
      this.sendMessage('subscribe_area_buses', bounds);
      console.log('🗺️ Subscribed to area bus tracking:', bounds);
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN || false;
  }

  // Get detailed connection status
  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' {
    return this.connectionStatus;
  }

  // Check if using fallback data (always false now)
  isUsingFallback(): boolean {
    return false; // Never use fallback - only real-time data
  }

  // Retry connection when auth becomes available
  retryWithAuth() {
    console.log('🔄 Retrying connection with auth...');
    this.connectionStatus = 'disconnected';
    this.connect();
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Send driver location (for driver app)
  sendDriverLocation(busId: string, location: Omit<BusLocationUpdate, 'busId'>) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('📤 Sending driver location update:', { busId, ...location });
      this.sendMessage('driver:location:update', {
        busId,
        ...location
      });
    } else {
      console.warn('⚠️ Cannot send driver location - socket not connected');
    }
  }
}

// Create and export singleton instance
export const busTrackingSocket = new BusTrackingSocket();

// Export types for use in components
export type { BusLocationUpdate, SocketEvents };
