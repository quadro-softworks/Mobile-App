import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Language types
export type Language = 'en' | 'am';

// Translation interface
export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    done: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    refresh: string;
    loadMore: string;
    noData: string;
    success: string;
    failed: string;
  };
  
  // Navigation
  navigation: {
    map: string;
    stops: string;
    tickets: string;
    alerts: string;
    profile: string;
    home: string;
    notifications: string;
    payments: string;
  };
  
  // Profile
  profile: {
    title: string;
    personalInfo: string;
    settings: string;
    language: string;
    notifications: string;
    privacy: string;
    help: string;
    about: string;
    logout: string;
    name: string;
    email: string;
    phone: string;
    editProfile: string;
    changePassword: string;
    deleteAccount: string;
    version: string;
    termsOfService: string;
    privacyPolicy: string;
  };
  
  // Stops
  stops: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    capacity: string;
    active: string;
    inactive: string;
    noStops: string;
    loadingStops: string;
    loadingMoreStops: string;
    routes: string;
    route: string;
  };
  
  // Payments
  payments: {
    title: string;
    subtitle: string;
    selectRoute: string;
    chooseOriginDestination: string;
    from: string;
    to: string;
    enterOrigin: string;
    enterDestination: string;
    pay: string;
    yourTickets: string;
    noTickets: string;
    selectRouteAbove: string;
    purchaseHistory: string;
    viewHistory: string;
    paymentSuccessful: string;
    ticketReady: string;
    viewFullTicket: string;
    generateCheckout: string;
    completePayment: string;
    processingPayment: string;
    verifyingPayment: string;
  };
  
  // Tickets
  tickets: {
    validUntil: string;
    price: string;
    status: string;
    active: string;
    used: string;
    expired: string;
    ticketDetails: string;
    qrInstructions: string;
    purchaseDate: string;
  };
  
  // Notifications
  notifications: {
    title: string;
    markAllRead: string;
    noNotifications: string;
    loadingNotifications: string;
    unreadNotifications: string;
    stayUpdated: string;
  };
  
  // Map
  map: {
    title: string;
    trackBuses: string;
    findNearbyStops: string;
    currentLocation: string;
    busLocation: string;
    stopLocation: string;
    viewAll: string;
    nearbyBuses: string;
    noBusesFound: string;
  };
  
  // Auth
  auth: {
    login: string;
    register: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    createAccount: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    loginSuccess: string;
    loginFailed: string;
    registerSuccess: string;
    registerFailed: string;
  };
  
  // Errors
  errors: {
    networkError: string;
    serverError: string;
    invalidCredentials: string;
    requiredField: string;
    invalidEmail: string;
    passwordTooShort: string;
    passwordMismatch: string;
    somethingWentWrong: string;
  };

  // Regulator specific
  regulator: {
    dashboard: string;
    requests: string;
    alerts: string;
    profile: string;
    title: string;
    subtitle: string;
    pendingRequests: string;
    approvedRequests: string;
    rejectedRequests: string;
    totalRequests: string;
    viewAllRequests: string;
    requestDetails: string;
    approve: string;
    reject: string;
    pending: string;
    approved: string;
    rejected: string;
    noRequests: string;
    loadingRequests: string;
    requestFrom: string;
    requestType: string;
    submittedOn: string;
    status: string;
    actions: string;
  };

  // Driver specific
  driver: {
    dashboard: string;
    notifications: string;
    report: string;
    profile: string;
    title: string;
    subtitle: string;
    currentRoute: string;
    nextStop: string;
    passengers: string;
    earnings: string;
    todayEarnings: string;
    totalTrips: string;
    rating: string;
    startTrip: string;
    endTrip: string;
    emergencyAlert: string;
    noNotifications: string;
    loadingNotifications: string;
    sendMessage: string;
    typeMessage: string;
    reportIssue: string;
    issueType: string;
    description: string;
    submitReport: string;
    vehicleIssue: string;
    routeIssue: string;
    passengerIssue: string;
    other: string;
  };
}

// Language store interface
interface LanguageStore {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Create language store with persistence
export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      
      setLanguage: (language: Language) => {
        set({ currentLanguage: language });
      },
      
      t: (key: string) => {
        const language = get().currentLanguage;
        const translations = getTranslations(language);
        
        // Navigate through nested object using dot notation
        const keys = key.split('.');
        let value: any = translations;
        
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            // Fallback to English if key not found
            const englishTranslations = getTranslations('en');
            let englishValue: any = englishTranslations;
            for (const k of keys) {
              if (englishValue && typeof englishValue === 'object' && k in englishValue) {
                englishValue = englishValue[k];
              } else {
                return key; // Return key if not found in any language
              }
            }
            return englishValue;
          }
        }
        
        return typeof value === 'string' ? value : key;
      },
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Get translations for a specific language
function getTranslations(language: Language): Translations {
  switch (language) {
    case 'am':
      return amharicTranslations;
    case 'en':
    default:
      return englishTranslations;
  }
}

// English translations
const englishTranslations: Translations = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    refresh: 'Refresh',
    loadMore: 'Load More',
    noData: 'No data available',
    success: 'Success',
    failed: 'Failed',
  },
  
  navigation: {
    map: 'Map',
    stops: 'Stops',
    tickets: 'Tickets',
    alerts: 'Notifications',
    profile: 'Profile',
    home: 'Home',
    notifications: 'Notifications',
    payments: 'Payments',
  },
  
  profile: {
    title: 'Profile',
    personalInfo: 'Personal Information',
    settings: 'Settings',
    language: 'Language',
    notifications: 'Notifications',
    privacy: 'Privacy',
    help: 'Help & Support',
    about: 'About',
    logout: 'Logout',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    editProfile: 'Edit Profile',
    changePassword: 'Change Password',
    deleteAccount: 'Delete Account',
    version: 'Version',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
  },
  
  stops: {
    title: 'Bus Stops',
    subtitle: 'Find stops and check incoming buses',
    searchPlaceholder: 'Search stops...',
    capacity: 'Capacity',
    active: 'Active',
    inactive: 'Inactive',
    noStops: 'No stops available',
    loadingStops: 'Loading stops...',
    loadingMoreStops: 'Loading more stops...',
    routes: 'routes',
    route: 'route',
  },
  
  payments: {
    title: 'Tickets & Payments',
    subtitle: 'Manage your tickets and payment methods',
    selectRoute: 'Select Route',
    chooseOriginDestination: 'Choose your origin and destination',
    from: 'From',
    to: 'To',
    enterOrigin: 'Enter origin',
    enterDestination: 'Enter destination',
    pay: 'Pay',
    yourTickets: 'Your Tickets',
    noTickets: 'No active tickets',
    selectRouteAbove: 'Select a route above to purchase a ticket',
    purchaseHistory: 'Purchase History',
    viewHistory: 'View Purchase History',
    paymentSuccessful: 'Payment Successful!',
    ticketReady: 'Your ticket is ready',
    viewFullTicket: 'View Full Ticket',
    generateCheckout: 'Generating Checkout URL',
    completePayment: 'Complete Payment',
    processingPayment: 'Processing Payment',
    verifyingPayment: 'Verifying payment and generating your ticket...',
  },
  
  tickets: {
    validUntil: 'Valid Until',
    price: 'Price',
    status: 'Status',
    active: 'Active',
    used: 'Used',
    expired: 'Expired',
    ticketDetails: 'Ticket Details',
    qrInstructions: 'Show this QR code to the bus driver or scan at the terminal',
    purchaseDate: 'Purchase Date',
  },
  
  notifications: {
    title: 'Notifications',
    markAllRead: 'Mark All as Read',
    noNotifications: 'No notifications available',
    loadingNotifications: 'Loading notifications...',
    unreadNotifications: 'unread notifications',
    stayUpdated: 'Stay updated with notifications',
  },
  
  map: {
    title: 'Live Bus Tracking',
    trackBuses: 'Track buses in real-time',
    findNearbyStops: 'Find nearby stops',
    currentLocation: 'Current Location',
    busLocation: 'Bus Location',
    stopLocation: 'Stop Location',
    viewAll: 'View All',
    nearbyBuses: 'Nearby Buses',
    noBusesFound: 'No buses found matching your search.',
  },
  
  auth: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed',
    registerSuccess: 'Registration successful',
    registerFailed: 'Registration failed',
  },
  
  errors: {
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
    invalidCredentials: 'Invalid email or password.',
    requiredField: 'This field is required.',
    invalidEmail: 'Please enter a valid email address.',
    passwordTooShort: 'Password must be at least 6 characters.',
    passwordMismatch: 'Passwords do not match.',
    somethingWentWrong: 'Something went wrong. Please try again.',
  },

  regulator: {
    dashboard: 'Dashboard',
    requests: 'Requests',
    alerts: 'Alerts',
    profile: 'Profile',
    title: 'Regulator Dashboard',
    subtitle: 'Manage bus operations and requests',
    pendingRequests: 'Pending Requests',
    approvedRequests: 'Approved Requests',
    rejectedRequests: 'Rejected Requests',
    totalRequests: 'Total Requests',
    viewAllRequests: 'View All Requests',
    requestDetails: 'Request Details',
    approve: 'Approve',
    reject: 'Reject',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    noRequests: 'No requests available',
    loadingRequests: 'Loading requests...',
    requestFrom: 'Request from',
    requestType: 'Request Type',
    submittedOn: 'Submitted on',
    status: 'Status',
    actions: 'Actions',
  },

  driver: {
    dashboard: 'Dashboard',
    notifications: 'Notifications',
    report: 'Report',
    profile: 'Profile',
    title: 'Driver Dashboard',
    subtitle: 'Manage your trips and routes',
    currentRoute: 'Current Route',
    nextStop: 'Next Stop',
    passengers: 'Passengers',
    earnings: 'Earnings',
    todayEarnings: "Today's Earnings",
    totalTrips: 'Total Trips',
    rating: 'Rating',
    startTrip: 'Start Trip',
    endTrip: 'End Trip',
    emergencyAlert: 'Emergency Alert',
    noNotifications: 'No notifications available',
    loadingNotifications: 'Loading notifications...',
    sendMessage: 'Send Message',
    typeMessage: 'Type your message...',
    reportIssue: 'Report Issue',
    issueType: 'Issue Type',
    description: 'Description',
    submitReport: 'Submit Report',
    vehicleIssue: 'Vehicle Issue',
    routeIssue: 'Route Issue',
    passengerIssue: 'Passenger Issue',
    other: 'Other',
  },
};

// Amharic translations
const amharicTranslations: Translations = {
  common: {
    loading: 'በመጫን ላይ...',
    error: 'ስህተት',
    retry: 'እንደገና ሞክር',
    cancel: 'ሰርዝ',
    save: 'አስቀምጥ',
    delete: 'ሰርዝ',
    edit: 'አርም',
    done: 'ተጠናቅቋል',
    back: 'ተመለስ',
    next: 'ቀጣይ',
    previous: 'ቀዳሚ',
    search: 'ፈልግ',
    refresh: 'አድስ',
    loadMore: 'ተጨማሪ ጫን',
    noData: 'ምንም መረጃ የለም',
    success: 'ተሳክቷል',
    failed: 'አልተሳካም',
  },
  
  navigation: {
    map: 'ካርታ',
    stops: 'ማቆሚያዎች',
    tickets: 'ትኬቶች',
    alerts: 'ማሳወቂያዎች',
    profile: 'መገለጫ',
    home: 'ቤት',
    notifications: 'ማሳወቂያዎች',
    payments: 'ክፍያዎች',
  },
  
  profile: {
    title: 'መገለጫ',
    personalInfo: 'የግል መረጃ',
    settings: 'ቅንብሮች',
    language: 'ቋንቋ',
    notifications: 'ማሳወቂያዎች',
    privacy: 'ግላዊነት',
    help: 'እርዳታ እና ድጋፍ',
    about: 'ስለ',
    logout: 'ውጣ',
    name: 'ስም',
    email: 'ኢሜይል',
    phone: 'ስልክ',
    editProfile: 'መገለጫ አርም',
    changePassword: 'የይለፍ ቃል ቀይር',
    deleteAccount: 'መለያ ሰርዝ',
    version: 'ስሪት',
    termsOfService: 'የአገልግሎት ውሎች',
    privacyPolicy: 'የግላዊነት ፖሊሲ',
  },
  
  stops: {
    title: 'የአውቶቡስ ማቆሚያዎች',
    subtitle: 'ማቆሚያዎችን ፈልግ እና የሚመጡ አውቶቡሶችን ይመልከቱ',
    searchPlaceholder: 'ማቆሚያዎችን ፈልግ...',
    capacity: 'አቅም',
    active: 'ንቁ',
    inactive: 'ንቁ ያልሆነ',
    noStops: 'ምንም ማቆሚያዎች የሉም',
    loadingStops: 'ማቆሚያዎችን በመጫን ላይ...',
    loadingMoreStops: 'ተጨማሪ ማቆሚያዎችን በመጫን ላይ...',
    routes: 'መስመሮች',
    route: 'መስመር',
  },
  
  payments: {
    title: 'ትኬቶች እና ክፍያዎች',
    subtitle: 'ትኬቶችዎን እና የክፍያ ዘዴዎችዎን ያስተዳድሩ',
    selectRoute: 'መስመር ይምረጡ',
    chooseOriginDestination: 'የመነሻ እና መድረሻዎን ይምረጡ',
    from: 'ከ',
    to: 'ወደ',
    enterOrigin: 'መነሻ ያስገቡ',
    enterDestination: 'መድረሻ ያስገቡ',
    pay: 'ክፈል',
    yourTickets: 'የእርስዎ ትኬቶች',
    noTickets: 'ምንም ንቁ ትኬቶች የሉም',
    selectRouteAbove: 'ትኬት ለመግዛት ከላይ መስመር ይምረጡ',
    purchaseHistory: 'የግዢ ታሪክ',
    viewHistory: 'የግዢ ታሪክ ይመልከቱ',
    paymentSuccessful: 'ክፍያ ተሳክቷል!',
    ticketReady: 'ትኬትዎ ዝግጁ ነው',
    viewFullTicket: 'ሙሉ ትኬት ይመልከቱ',
    generateCheckout: 'የክፍያ አገናኝ በመፍጠር ላይ',
    completePayment: 'ክፍያ ያጠናቅቁ',
    processingPayment: 'ክፍያ በማስኬድ ላይ',
    verifyingPayment: 'ክፍያ በማረጋገጥ እና ትኬትዎን በመፍጠር ላይ...',
  },
  
  tickets: {
    validUntil: 'የሚሰራበት እስከ',
    price: 'ዋጋ',
    status: 'ሁኔታ',
    active: 'ንቁ',
    used: 'ጥቅም ላይ የዋለ',
    expired: 'ጊዜው ያለፈ',
    ticketDetails: 'የትኬት ዝርዝሮች',
    qrInstructions: 'ይህንን QR ኮድ ለአውቶቡስ ሹፌር ያሳዩ ወይም በተርሚናሉ ላይ ይቃኙ',
    purchaseDate: 'የግዢ ቀን',
  },
  
  notifications: {
    title: 'ማሳወቂያዎች',
    markAllRead: 'ሁሉንም እንደተነበበ ምልክት አድርግ',
    noNotifications: 'ምንም ማሳወቂያዎች የሉም',
    loadingNotifications: 'ማሳወቂያዎችን በመጫን ላይ...',
    unreadNotifications: 'ያልተነበቡ ማሳወቂያዎች',
    stayUpdated: 'በማሳወቂያዎች ዝማኔ ይቆዩ',
  },
  
  map: {
    title: 'የቀጥታ አውቶቡስ ክትትል',
    trackBuses: 'አውቶቡሶችን በቀጥታ ይከታተሉ',
    findNearbyStops: 'አቅራቢያ ያሉ ማቆሚያዎችን ፈልግ',
    currentLocation: 'አሁን ያለበት ቦታ',
    busLocation: 'የአውቶቡስ ቦታ',
    stopLocation: 'የማቆሚያ ቦታ',
    viewAll: 'ሁሉንም ይመልከቱ',
    nearbyBuses: 'አቅራቢያ ያሉ አውቶቡሶች',
    noBusesFound: 'ከፍለጋዎ ጋር የሚዛመድ አውቶቡስ አልተገኘም።',
  },
  
  auth: {
    login: 'ግባ',
    register: 'ተመዝገብ',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    confirmPassword: 'የይለፍ ቃል አረጋግጥ',
    forgotPassword: 'የይለፍ ቃል ረሳህ?',
    createAccount: 'መለያ ፍጠር',
    alreadyHaveAccount: 'ቀደም ሲል መለያ አለህ?',
    dontHaveAccount: 'መለያ የለህም?',
    loginSuccess: 'መግባት ተሳክቷል',
    loginFailed: 'መግባት አልተሳካም',
    registerSuccess: 'ምዝገባ ተሳክቷል',
    registerFailed: 'ምዝገባ አልተሳካም',
  },
  
  errors: {
    networkError: 'የኔትወርክ ስህተት። እባክዎ ግንኙነትዎን ይፈትሹ።',
    serverError: 'የአገልጋይ ስህተት። እባክዎ በኋላ ይሞክሩ።',
    invalidCredentials: 'ልክ ያልሆነ ኢሜይል ወይም የይለፍ ቃል።',
    requiredField: 'ይህ መስክ ያስፈልጋል።',
    invalidEmail: 'እባክዎ ልክ የሆነ ኢሜይል አድራሻ ያስገቡ።',
    passwordTooShort: 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት።',
    passwordMismatch: 'የይለፍ ቃሎች አይዛመዱም።',
    somethingWentWrong: 'የሆነ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።',
  },

  regulator: {
    dashboard: 'ዳሽቦርድ',
    requests: 'ጥያቄዎች',
    alerts: 'ማሳወቂያዎች',
    profile: 'መገለጫ',
    title: 'የተቆጣጣሪ ዳሽቦርድ',
    subtitle: 'የአውቶቡስ ስራዎችን እና ጥያቄዎችን ያስተዳድሩ',
    pendingRequests: 'በመጠባበቅ ላይ ያሉ ጥያቄዎች',
    approvedRequests: 'የተፈቀዱ ጥያቄዎች',
    rejectedRequests: 'የተከለከሉ ጥያቄዎች',
    totalRequests: 'ጠቅላላ ጥያቄዎች',
    viewAllRequests: 'ሁሉንም ጥያቄዎች ይመልከቱ',
    requestDetails: 'የጥያቄ ዝርዝሮች',
    approve: 'ፍቀድ',
    reject: 'ውድቅ አድርግ',
    pending: 'በመጠባበቅ ላይ',
    approved: 'ተፈቅዷል',
    rejected: 'ውድቅ ተደርጓል',
    noRequests: 'ምንም ጥያቄዎች የሉም',
    loadingRequests: 'ጥያቄዎችን በመጫን ላይ...',
    requestFrom: 'ጥያቄ ከ',
    requestType: 'የጥያቄ አይነት',
    submittedOn: 'የቀረበበት ቀን',
    status: 'ሁኔታ',
    actions: 'እርምጃዎች',
  },

  driver: {
    dashboard: 'ዳሽቦርድ',
    notifications: 'ማሳወቂያዎች',
    report: 'ሪፖርት',
    profile: 'መገለጫ',
    title: 'የሹፌር ዳሽቦርድ',
    subtitle: 'ጉዞዎችዎን እና መስመሮችዎን ያስተዳድሩ',
    currentRoute: 'አሁን ያለ መስመር',
    nextStop: 'ቀጣይ ማቆሚያ',
    passengers: 'ተሳፋሪዎች',
    earnings: 'ገቢ',
    todayEarnings: 'የዛሬ ገቢ',
    totalTrips: 'ጠቅላላ ጉዞዎች',
    rating: 'ደረጃ',
    startTrip: 'ጉዞ ጀምር',
    endTrip: 'ጉዞ አጠናቅቅ',
    emergencyAlert: 'የአደጋ ጊዜ ማንቂያ',
    noNotifications: 'ምንም ማሳወቂያዎች የሉም',
    loadingNotifications: 'ማሳወቂያዎችን በመጫን ላይ...',
    sendMessage: 'መልዕክት ላክ',
    typeMessage: 'መልዕክትዎን ይተይቡ...',
    reportIssue: 'ችግር ሪፖርት አድርግ',
    issueType: 'የችግር አይነት',
    description: 'መግለጫ',
    submitReport: 'ሪፖርት አስገባ',
    vehicleIssue: 'የተሽከርካሪ ችግር',
    routeIssue: 'የመስመር ችግር',
    passengerIssue: 'የተሳፋሪ ችግር',
    other: 'ሌላ',
  },
};

// Export translation hook
export const useTranslation = () => {
  const { t, currentLanguage, setLanguage } = useLanguageStore();
  return { t, currentLanguage, setLanguage };
};
