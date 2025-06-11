// User types
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    language: string;
    notificationSettings: NotificationSettings;
    favoriteStops: string[];
    favoriteRoutes: string[];
    role: 'PASSENGER' | 'BUS_DRIVER' | 'DRIVE' | 'QUEUE_REGULATOR';
  }

  export interface ProfileUpdateData {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    profile_image?: string;
  }
  
  export interface NotificationSettings {
    pushEnabled: boolean;
    emailEnabled: boolean;
    alertTypes: string[];
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
  }
  
  // Bus and route types
  export interface Coordinates {
    latitude: number;
    longitude: number;
  }
  
  export interface Bus {
    id: string;
    name: string;
    routeId: string;
    routeName: string;
    coordinates: Coordinates;
    status: 'on-time' | 'delayed' | 'early';
    capacity: 'low' | 'medium' | 'high';
    nextStop: string;
    eta: number; // minutes
    lastUpdated: string;
  }
  
  export interface BusStop {
    id: string;
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
    capacity: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Legacy fields for backward compatibility
    coordinates?: Coordinates;
    routes?: string[];
    approachingBuses?: Bus[];
  }
  
  export interface Route {
    id: string;
    name: string;
    description: string;
    stops: string[];
    color: string;
    startPoint: string;
    endPoint: string;
    frequency: string;
    activeHours: string;
  }
  
  // Alert types
  export interface Alert {
    id: string;
    type: 'delay' | 'route-change' | 'service-disruption';
    title: string;
    message: string;
    routeId?: string;
    routeName?: string;
    busId?: string;
    stopId?: string;
    createdAt: string;
    read: boolean;
  }
  
  // Notification types
  export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'ALERT' | 'INFO' | 'PROMO' | 'SYSTEM' | 'UPDATE';
    is_read: boolean;
    created_at: string;
    updated_at: string;
    related_entity?: {
      entity_type: string;
      entity_id: string;
    };
    // Legacy fields for backward compatibility
    createdAt?: string;
    read?: boolean;
  }
  
  // Feedback types
  export interface Feedback {
    id: string;
    tripDate: string;
    routeId: string;
    routeName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }
  
  // Pagination types
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  
  // Search params
  export interface SearchParams {
    search?: string;
    filterBy?: string;
    pn?: number;
    ps?: number;
  }