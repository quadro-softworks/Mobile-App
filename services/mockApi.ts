import { initialData } from '@/constants/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for our mock data store
interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  language: string;
  notificationSettings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    alertTypes: string[];
  };
  favoriteStops: string[];
  favoriteRoutes: string[];
  createdAt: string;
}

interface MockSession {
  userId: string;
  token: string;
  createdAt: string;
}

// In-memory data store
let mockDataStore = {
  ...initialData,
  users: [] as MockUser[],
  sessions: [] as MockSession[],
};

// Simulate API delay
const simulateDelay = async (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Authentication API
export const authApi = {
  register: async (userData: any) => {
    await simulateDelay();
    
    // Check if user already exists
    const existingUser = mockDataStore.users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const newUser: MockUser = {
      id: `user-${mockDataStore.users.length + 1}`,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    
    mockDataStore.users.push(newUser);
    
    // Create session
    const token = `mock-token-${Date.now()}`;
    mockDataStore.sessions.push({
      userId: newUser.id,
      token,
      createdAt: new Date().toISOString(),
    });
    
    await AsyncStorage.setItem('auth_token', token);
    
    return { token, user: { ...newUser, password: undefined } };
  },
  
  login: async (credentials: { email: string; password: string }) => {
    await simulateDelay();
    
    // Find user
    const user = mockDataStore.users.find(u => u.email === credentials.email);
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid credentials');
    }
    
    // Create session
    const token = `mock-token-${Date.now()}`;
    mockDataStore.sessions.push({
      userId: user.id,
      token,
      createdAt: new Date().toISOString(),
    });
    
    await AsyncStorage.setItem('auth_token', token);
    
    return { token, user: { ...user, password: undefined } };
  },
  
  logout: async () => {
    await simulateDelay();
    
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      // Remove session
      mockDataStore.sessions = mockDataStore.sessions.filter(s => s.token !== token);
      await AsyncStorage.removeItem('auth_token');
    }
    
    return { success: true };
  },
  
  getCurrentUser: async () => {
    await simulateDelay();
    
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const session = mockDataStore.sessions.find(s => s.token === token);
    if (!session) {
      throw new Error('Session expired');
    }
    
    const user = mockDataStore.users.find(u => u.id === session.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return { ...user, password: undefined };
  },
  
  updateProfile: async (userData: any) => {
    await simulateDelay();
    
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const session = mockDataStore.sessions.find(s => s.token === token);
    if (!session) {
      throw new Error('Session expired');
    }
    
    // Update user
    mockDataStore.users = mockDataStore.users.map(u => {
      if (u.id === session.userId) {
        return { ...u, ...userData };
      }
      return u;
    });
    
    const updatedUser = mockDataStore.users.find(u => u.id === session.userId);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    return { ...updatedUser, password: undefined };
  },
};

// Bus API
export const busApi = {
  getBuses: async () => {
    await simulateDelay();
    return mockDataStore.buses;
  },
  
  getBusById: async (busId: string) => {
    await simulateDelay();
    const bus = mockDataStore.buses.find(b => b.id === busId);
    if (!bus) {
      throw new Error('Bus not found');
    }
    return bus;
  },
  
  getRoutes: async () => {
    await simulateDelay();
    return mockDataStore.routes;
  },
  
  getRouteById: async (routeId: string) => {
    await simulateDelay();
    const route = mockDataStore.routes.find(r => r.id === routeId);
    if (!route) {
      throw new Error('Route not found');
    }
    return route;
  },
  
  getBusStops: async (params: any = {}) => {
    await simulateDelay();
    
    let stops = [...mockDataStore.stops];
    
    // Search
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      stops = stops.filter(stop => 
        stop.name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by route
    if (params.routeId) {
      stops = stops.filter(stop => 
        stop.routes.includes(params.routeId)
      );
    }
    
    // Pagination
    const page = params.pn || 1;
    const pageSize = params.ps || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedStops = stops.slice(startIndex, startIndex + pageSize);
    
    return {
      items: paginatedStops,
      total: stops.length,
      page,
      pageSize,
      totalPages: Math.ceil(stops.length / pageSize),
    };
  },
  
  getBusStopById: async (stopId: string) => {
    await simulateDelay();
    const stop = mockDataStore.stops.find(s => s.id === stopId);
    if (!stop) {
      throw new Error('Bus stop not found');
    }
    
    // Get buses approaching this stop
    const approachingBuses = mockDataStore.buses
      .filter(bus => {
        const route = mockDataStore.routes.find(r => r.id === bus.routeId);
        return route && route.stops.includes(stop.name);
      })
      .map(bus => ({
        ...bus,
        eta: Math.floor(Math.random() * 30) + 1, // Random ETA in minutes
      }));
    
    return {
      ...stop,
      approachingBuses,
    };
  },
};

// Alerts API
export const alertsApi = {
  getAlerts: async () => {
    await simulateDelay();
    return mockDataStore.alerts;
  },
  
  createAlert: async (alertData: any) => {
    await simulateDelay();
    
    const newAlert = {
      id: `alert-${mockDataStore.alerts.length + 1}`,
      ...alertData,
      createdAt: new Date().toISOString(),
      read: false,
      stopId: alertData.stopId || null, // Ensure stopId is present
    };
    
    mockDataStore.alerts.push(newAlert);
    return newAlert;
  },
  
  updateAlert: async (alertId: string, alertData: any) => {
    await simulateDelay();
    
    const alertIndex = mockDataStore.alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) {
      throw new Error('Alert not found');
    }
    
    const updatedAlert = {
      ...mockDataStore.alerts[alertIndex],
      ...alertData,
    };
    
    mockDataStore.alerts[alertIndex] = updatedAlert;
    return updatedAlert;
  },
  
  deleteAlert: async (alertId: string) => {
    await simulateDelay();
    
    const alertIndex = mockDataStore.alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) {
      throw new Error('Alert not found');
    }
    
    mockDataStore.alerts.splice(alertIndex, 1);
    return { success: true };
  },
};

// Feedback API
export const feedbackApi = {
  getFeedback: async () => {
    await simulateDelay();
    return mockDataStore.feedback;
  },
  
  submitFeedback: async (feedbackData: any) => {
    await simulateDelay();
    
    const newFeedback = {
      id: `feedback-${mockDataStore.feedback.length + 1}`,
      ...feedbackData,
      createdAt: new Date().toISOString(),
    };
    
    mockDataStore.feedback.push(newFeedback);
    return newFeedback;
  },
};

// Notifications API
export const notificationsApi = {
  getNotifications: async () => {
    await simulateDelay();
    return mockDataStore.notifications;
  },
  
  markNotificationAsRead: async (notificationId: string) => {
    await simulateDelay();
    
    const notificationIndex = mockDataStore.notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex === -1) {
      throw new Error('Notification not found');
    }
    
    mockDataStore.notifications[notificationIndex].read = true;
    return mockDataStore.notifications[notificationIndex];
  },
  
  updateNotificationSettings: async (settings: any) => {
    await simulateDelay();
    
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const session = mockDataStore.sessions.find(s => s.token === token);
    if (!session) {
      throw new Error('Session expired');
    }
    
    // Update user notification settings
    mockDataStore.users = mockDataStore.users.map(u => {
      if (u.id === session.userId) {
        return {
          ...u,
          notificationSettings: {
            ...u.notificationSettings,
            ...settings,
          },
        };
      }
      return u;
    });
    
    const updatedUser = mockDataStore.users.find(u => u.id === session.userId);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    return updatedUser.notificationSettings;
  },
};

// WebSocket simulation
export class MockWebSocket {
  private callbacks: Record<string, Function[]> = {};
  private intervalIds: Record<string, NodeJS.Timeout> = {};
  
  constructor() {
    // Initialize with default events
    this.setupBusUpdates();
  }
  
  // Subscribe to an event
  on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
    return () => this.off(event, callback);
  }
  
  // Unsubscribe from an event
  off(event: string, callback: Function) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }
  
  // Emit an event
  emit(event: string, data: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }
  
  // Setup bus updates simulation
  private setupBusUpdates() {
    // Emit bus updates every 5 seconds
    this.intervalIds['tracking.bus_updates'] = setInterval(() => {
      // Update random buses with new coordinates and ETAs
      const updatedBuses = mockDataStore.buses.map(bus => {
        if (Math.random() > 0.7) { // Only update some buses each time
          return {
            ...bus,
            coordinates: {
              latitude: bus.coordinates.latitude + (Math.random() - 0.5) * 0.001,
              longitude: bus.coordinates.longitude + (Math.random() - 0.5) * 0.001,
            },
            eta: Math.max(0, bus.eta - 1 + Math.floor(Math.random() * 3) - 1),
            lastUpdated: new Date().toISOString(),
          };
        }
        return bus;
      });
      
      mockDataStore.buses = updatedBuses;
      this.emit('tracking.bus_updates', updatedBuses);
    }, 5000);
    
    // Emit random alerts occasionally
    this.intervalIds['alerts'] = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance of new alert
        const alertTypes = ['delay', 'route-change', 'service-disruption'];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const randomBus = mockDataStore.buses[Math.floor(Math.random() * mockDataStore.buses.length)];
        
        const newAlert = {
          id: `alert-${mockDataStore.alerts.length + 1}`,
          type: alertType as 'delay' | 'route-change' | 'service-disruption',
          title: alertType === 'delay' 
            ? 'Bus Delayed' 
            : alertType === 'route-change' 
              ? 'Route Changed' 
              : 'Service Disruption',
          message: alertType === 'delay' 
            ? `Bus ${randomBus.name} is delayed by ${Math.floor(Math.random() * 15) + 5} minutes.` 
            : alertType === 'route-change' 
              ? `Route ${randomBus.routeName} has been temporarily changed.` 
              : `Service disruption on route ${randomBus.routeName}.`,
          routeId: randomBus.routeId,
          routeName: randomBus.routeName,
          busId: randomBus.id,
          stopId: null,
          createdAt: new Date().toISOString(),
          read: false,
        };
        
        mockDataStore.alerts.push(newAlert);
        this.emit('alerts', newAlert);
      }
    }, 30000); // Every 30 seconds
  }
  
  // Clean up intervals
  cleanup() {
    Object.values(this.intervalIds).forEach(id => clearInterval(id));
  }
}

// Create and export a singleton instance
export const mockWebSocket = new MockWebSocket();