// Mock data for the app
import { faker } from '@faker-js/faker';

// Generate random coordinates within Addis Ababa area
const getRandomCoordinates = () => {
  // Addis Ababa approximate bounds
  return {
    latitude: 8.9806 + (Math.random() - 0.5) * 0.1,
    longitude: 38.7578 + (Math.random() - 0.5) * 0.1,
  };
};

// Generate a list of bus stops
export const generateBusStops = (count = 20) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `stop-${i + 1}`,
    name: faker.location.street(),
    coordinates: getRandomCoordinates(),
    routes: Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      () => `R${Math.floor(Math.random() * 10) + 1}`
    ),
  }));
};

// Generate a list of buses
export const generateBuses = (count = 15) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `bus-${i + 1}`,
    name: `Bus ${i + 1}`,
    routeId: `R${Math.floor(Math.random() * 10) + 1}`,
    routeName: `Route ${Math.floor(Math.random() * 10) + 1}`,
    coordinates: getRandomCoordinates(),
    status: faker.helpers.arrayElement(['on-time', 'delayed', 'early']),
    capacity: faker.helpers.arrayElement(['low', 'medium', 'high']),
    nextStop: faker.location.street(),
    eta: Math.floor(Math.random() * 30) + 1, // minutes
    lastUpdated: new Date().toISOString(),
  }));
};

// Generate a list of routes
export const generateRoutes = (count = 10) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `R${i + 1}`,
    name: `Route ${i + 1}`,
    description: faker.lorem.sentence(),
    stops: Array.from(
      { length: Math.floor(Math.random() * 10) + 5 },
      () => faker.location.street()
    ),
    color: faker.color.rgb(),
    startPoint: faker.location.street(),
    endPoint: faker.location.street(),
    frequency: `${Math.floor(Math.random() * 15) + 5} min`,
    activeHours: '6:00 AM - 10:00 PM',
  }));
};

// Generate alerts for a user
export const generateAlerts = (count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `alert-${i + 1}`,
    type: faker.helpers.arrayElement(['delay', 'route-change', 'service-disruption']),
    title: faker.helpers.arrayElement([
      'Bus Delayed',
      'Route Changed',
      'Service Disruption',
      'Schedule Update',
      'Bus Arriving Soon',
    ]),
    message: faker.lorem.sentence(),
    routeId: `R${Math.floor(Math.random() * 10) + 1}`,
    routeName: `Route ${Math.floor(Math.random() * 10) + 1}`,
    busId: `bus-${Math.floor(Math.random() * 15) + 1}`,
    stopId: `stop-${Math.floor(Math.random() * 20) + 1}`,
    createdAt: faker.date.recent().toISOString(),
    read: faker.datatype.boolean(),
  }));
};

// Generate notifications for a user
export const generateNotifications = (count = 10) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `notification-${i + 1}`,
    type: faker.helpers.arrayElement(['alert', 'info', 'promo', 'system']),
    title: faker.helpers.arrayElement([
      'Bus Arriving Soon',
      'Service Update',
      'Route Change',
      'Feedback Received',
      'Account Update',
    ]),
    message: faker.lorem.sentence(),
    createdAt: faker.date.recent().toISOString(),
    read: faker.datatype.boolean(),
  }));
};

// Generate feedback history
export const generateFeedback = (count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `feedback-${i + 1}`,
    tripDate: faker.date.recent().toISOString(),
    routeId: `R${Math.floor(Math.random() * 10) + 1}`,
    routeName: `Route ${Math.floor(Math.random() * 10) + 1}`,
    rating: Math.floor(Math.random() * 5) + 1,
    comment: faker.lorem.sentence(),
    createdAt: faker.date.recent().toISOString(),
  }));
};

// Generate user profile with role
export const generateUserProfile = (role = 'PASSENGER') => {
  return {
    id: 'user-1',
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    language: 'en',
    notificationSettings: {
      pushEnabled: true,
      emailEnabled: true,
      alertTypes: ['delay', 'route-change', 'service-disruption'],
    },
    favoriteStops: Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      (_, i) => `stop-${i + 1}`
    ),
    favoriteRoutes: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      (_, i) => `R${i + 1}`
    ),
    role,
  };
};

// Example mock users for testing roles
export const mockUsers = [
  {
    id: 'user-passenger',
    name: 'Passenger User',
    email: 'passenger@example.com',
    password: 'pass123',
    phone: '0911000001',
    language: 'en',
    notificationSettings: {
      pushEnabled: true,
      emailEnabled: true,
      alertTypes: ['delay', 'route-change', 'service-disruption'],
    },
    favoriteStops: ['stop-1', 'stop-2'],
    favoriteRoutes: ['R1', 'R2'],
    role: 'PASSENGER',
  },
  {
    id: 'user-driver',
    name: 'Driver User',
    email: 'driver@example.com',
    password: 'driver123',
    phone: '0911000002',
    language: 'en',
    notificationSettings: {
      pushEnabled: true,
      emailEnabled: true,
      alertTypes: ['delay', 'route-change', 'service-disruption'],
    },
    favoriteStops: [],
    favoriteRoutes: [],
    role: 'DRIVE',
  },
  {
    id: 'user-regulator',
    name: 'Regulator User',
    email: 'regulator@example.com',
    password: 'regulator123',
    phone: '0911000003',
    language: 'en',
    notificationSettings: {
      pushEnabled: true,
      emailEnabled: true,
      alertTypes: ['delay', 'route-change', 'service-disruption'],
    },
    favoriteStops: [],
    favoriteRoutes: [],
    role: 'QUEUE_REGULATOR',
  },
];

// Initial data
export const initialData = {
  buses: generateBuses(),
  stops: generateBusStops(),
  routes: generateRoutes(),
  alerts: generateAlerts(),
  notifications: generateNotifications(),
  feedback: generateFeedback(),
  userProfile: generateUserProfile(),
};