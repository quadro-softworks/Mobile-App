import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';

const trips = [
  {
    id: '1',
    title: 'Bus № 31',
    from: '72-74 Oxford St.',
    to: '20 Grosvenor Sq.',
    price: '£10.00',
  },
  {
    id: '2',
    title: 'Central Line',
    from: 'Great Portland St.',
    to: 'Baker Street',
    price: '£5.00',
  },
  {
    id: '3',
    title: 'Bus № 79',
    from: '103 Seymour Pl.',
    to: 'London NW1 5BR',
    price: '£7.00',
  },
  {
    id: '4',
    title: 'Tram № 17',
    from: '377 Durnsford Rd.',
    to: '136 Buckhold Rd.',
    price: '£4.00',
  },
  {
    id: '5',
    title: 'Tram № 9',
    from: 'Sample St.',
    to: 'Sample End.',
    price: '£6.00',
  },
  {
    id: '6',
    title: 'Bus № 90',
    from: 'Start Rd.',
    to: 'Finish Lane.',
    price: '£8.00',
  },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: 'https://randomuser.me/api/portraits/men/1.jpg',
            }}
            style={styles.avatar}
          />
          <Text style={styles.welcome}>Hey, Michael</Text>
        </View>
        <Ionicons name="notifications-outline" size={24} color="#000" />
      </View>

      {/* Pass Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>LondonRide</Text>
          <Entypo name="dots-three-horizontal" size={18} color="#fff" />
        </View>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.cardLabel}>Balance</Text>
            <Text style={styles.cardValue}>£5.00</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>Pass id</Text>
            <Text style={styles.cardValue}>798 014</Text>
          </View>
        </View>
      </View>

      {/* Add new pass */}
      <TouchableOpacity style={styles.addPass}>
        <Text style={styles.addPassText}>Add new pass</Text>
        <Ionicons name="add-circle-outline" size={18} color="#007AFF" />
      </TouchableOpacity>

      {/* Last Trips Header */}
      <View style={styles.tripsHeader}>
        <Text style={styles.sectionTitle}>Your last trips</Text>
        <MaterialIcons name="menu" size={20} color="#000" />
      </View>

      {/* Trips List */}
      <View style={styles.tripsContainer}>
        {trips.map((trip) => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="bus" size={18} color="#007AFF" />
              <Text style={styles.tripTitle}>{trip.title}</Text>
            </View>
            <Text style={styles.tripDetail}>↘ From: {trip.from}</Text>
            <Text style={styles.tripDetail}>↗ To: {trip.to}</Text>
            <Text style={styles.tripPrice}>Price: {trip.price}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  welcome: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#b3d6ff',
    fontSize: 12,
  },
  cardValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  addPass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginVertical: 12,
  },
  addPassText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  tripsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tripsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  tripCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    width: '47%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tripTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
    color: '#333',
  },
  tripDetail: {
    fontSize: 12,
    color: '#666',
  },
  tripPrice: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    color: '#000',
  },
});
