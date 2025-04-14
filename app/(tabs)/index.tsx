import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ColorSchemeName } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Define props types
type QuickAccessButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

type BusCardProps = {
  busName: string;
  route: string;
  eta: string;
  capacity: string;
};

export default function HomeScreen() {
  const router = useRouter();
  
  // Mock user data - will be replaced with actual user data from auth
  const userName = "Kidanu";

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <LinearGradient
                colors={['#0a7ea4', '#086585']}
                style={styles.profileAvatar}
              >
                <Text style={styles.profileInitial}>{userName.charAt(0)}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Access Buttons */}
          <View style={styles.quickAccessContainer}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.buttonRow}>
              <QuickAccessButton 
                icon="bus" 
                label="Buses" 
                onPress={() => router.push('/(tabs)/map')} 
              />
              <QuickAccessButton 
                icon="bookmarks" 
                label="Bookmarks" 
                onPress={() => router.push('/(tabs)/bookmarks')} 
              />
            </View>
            <View style={styles.buttonRow}>
              <QuickAccessButton 
                icon="time" 
                label="Recents" 
                onPress={() => {}} 
              />
              <QuickAccessButton 
                icon="location" 
                label="Stops" 
                onPress={() => router.push('/(tabs)/map')} 
              />
            </View>
          </View>

          {/* Upcoming Buses Section */}
          <View style={styles.upcomingContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Buses</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#0a7ea4" />
              </TouchableOpacity>
            </View>
            <BusCard 
              busName="Sheger Bus" 
              route="4 Kilo → Mexico" 
              eta="10 min" 
              capacity="75%" 
            />
            <BusCard 
              busName="Anbessa Bus" 
              route="Megenagna → Piassa" 
              eta="15 min" 
              capacity="50%" 
            />
          </View>

          {/* Latest Notifications */}
          <View style={styles.notificationsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Alerts</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push('/(tabs)/notifications')}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color="#0a7ea4" />
              </TouchableOpacity>
            </View>
            <View style={styles.notificationCard}>
              <View style={styles.notificationIconContainer}>
                <Ionicons name="bus" size={20} color="white" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>Sheger Bus Arriving Soon</Text>
                <Text style={styles.notificationSubtitle}>ETA: 5 minutes at Mexico Square</Text>
              </View>
              <Text style={styles.notificationTime}>Now</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function QuickAccessButton({ icon, label, onPress }: QuickAccessButtonProps) {
  return (
    <TouchableOpacity style={styles.quickAccessButton} onPress={onPress}>
      <LinearGradient
        colors={['#28313f', '#212a36']}
        style={styles.quickAccessGradient}
      >
        <Ionicons name={icon} size={24} color="#0a7ea4" />
      </LinearGradient>
      <Text style={styles.buttonLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function BusCard({ busName, route, eta, capacity }: BusCardProps) {
  // Parse the capacity percentage to use in width calculation
  const capacityValue = parseInt(capacity);
  
  // Get capacity color
  const getCapacityColor = () => {
    if (capacityValue < 50) return '#4CAF50';
    if (capacityValue < 80) return '#FFC107';
    return '#F44336';
  };

  return (
    <TouchableOpacity style={styles.busCard}>
      <View style={styles.busInfo}>
        <View style={styles.busIconContainer}>
          <Ionicons name="bus" size={22} color="#0a7ea4" />
        </View>
        <View style={styles.busDetails}>
          <Text style={styles.busName}>{busName}</Text>
          <Text style={styles.busRoute}>{route}</Text>
        </View>
      </View>
      <View style={styles.busStatusContainer}>
        <View style={styles.etaContainer}>
          <Ionicons name="time-outline" size={14} color="#adb5bd" />
          <Text style={styles.etaText}>{eta}</Text>
        </View>
        <View style={styles.capacityContainer}>
          <View style={styles.capacityBarBackground}>
            <View 
              style={[
                styles.capacityBarFill, 
                { 
                  width: `${capacityValue}%`,
                  backgroundColor: getCapacityColor()
                }
              ]} 
            />
          </View>
          <Text style={styles.capacityText}>{capacity} capacity</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c242f',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    color: '#adb5bd',
    marginBottom: 4,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  quickAccessContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    marginRight: 4,
    color: '#0a7ea4',
  },
  upcomingContainer: {
    marginBottom: 28,
  },
  notificationsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAccessButton: {
    width: '48%',
    alignItems: 'center',
  },
  quickAccessGradient: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonLabel: {
    fontWeight: '600',
    fontSize: 14,
    color: '#adb5bd',
  },
  busCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#28313f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  busIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  busDetails: {
    flex: 1,
  },
  busName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
  busRoute: {
    color: '#adb5bd',
    fontSize: 14,
  },
  busStatusContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  etaText: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
    color: 'white',
  },
  capacityContainer: {
    width: '100%',
  },
  capacityBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  capacityBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  capacityText: {
    fontSize: 12,
    textAlign: 'right',
    color: '#adb5bd',
  },
  notificationCard: {
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28313f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    color: 'white',
  },
  notificationSubtitle: {
    fontSize: 13,
    color: '#adb5bd',
  },
  notificationTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0a7ea4',
  },
});