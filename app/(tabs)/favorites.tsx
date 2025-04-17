import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

const WIDTH = Dimensions.get('window').width;

const filters = [
  { label: 'All', icon: 'filter' },
  { label: 'Bus', icon: 'bus' },
  { label: 'Metro', icon: 'train' },
  { label: 'Tram', icon: 'car' },
];

const routes = [
  {
    id: 1,
    type: 'Bus',
    title: 'Bus № 31',
    from: '72-74 Oxford St.',
    to: '20 Grosvenor Sq.',
    price: '£10.00',
    time: '16:00',
  },
  {
    id: 2,
    type: 'Metro',
    title: 'Central Line',
    from: 'Great Portland St.',
    to: 'Baker Street',
    price: '£5.00',
    time: '16:15',
  },
  {
    id: 3,
    type: 'Tram',
    title: 'Tram № 17',
    from: '377 Durnsford Rd.',
    to: '136 Buckhold Rd.',
    price: '£5.00',
    time: '16:15',
  },
];

export default function BookmarksScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredRoutes =
    activeFilter === 'All'
      ? routes
      : routes.filter(route => route.type === activeFilter);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favourite routs</Text>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.label}
            style={[
              styles.tab,
              activeFilter === filter.label && styles.activeTab,
            ]}
            onPress={() => setActiveFilter(filter.label)}
          >
            <Icon
              name={filter.icon}
              size={20}
              color={activeFilter === filter.label ? '#007aff' : '#999'}
            />
            <Text
              style={[
                styles.tabText,
                activeFilter === filter.label && styles.activeTabText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Route Cards */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredRoutes.map(route => (
          <View key={route.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="bus" size={22} color="#007aff" />
              <Text style={styles.cardTitle}>{route.title}</Text>
            </View>

            <View style={styles.cardDetail}>
              <Icon name="time" size={16} color="#888" />
              <Text style={styles.cardSubtext}>
                Next arrival : Today / {route.time}
              </Text>
            </View>

            <Text style={styles.routeInfo}>From: {route.from}</Text>
            <Text style={styles.routeInfo}>To: {route.to}</Text>

            <Text style={styles.priceText}>Price: {route.price}</Text>
          </View>
        ))}

        {/* Add New Route */}
        <TouchableOpacity style={styles.addRouteCard}>
          <Text style={styles.addRouteText}>Add new route</Text>
          <Icon name="add" size={20} color="#007aff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#e6f0ff',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  activeTabText: {
    color: '#007aff',
    fontWeight: '600',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
  },
  cardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardSubtext: {
    fontSize: 12,
    color: '#777',
    marginLeft: 4,
  },
  routeInfo: {
    fontSize: 13,
    color: '#444',
    marginBottom: 2,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007aff',
    marginTop: 6,
  },
  addRouteCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  addRouteText: {
    fontSize: 15,
    marginRight: 8,
    color: '#333',
  },
});
