import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>johndoe@example.com</Text>
        <TouchableOpacity style={styles.editButton}>
          <Icon name="pencil" size={16} color="#007aff" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Info Cards */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        <View style={styles.row}>
          <Icon name="calendar" size={18} color="#888" />
          <Text style={styles.rowText}>Date of Birth: Jan 1, 1990</Text>
        </View>
        <View style={styles.row}>
          <Icon name="map" size={18} color="#888" />
          <Text style={styles.rowText}>Location: London, UK</Text>
        </View>
        <View style={styles.row}>
          <Icon name="map" size={18} color="#888" />
          <Text style={styles.rowText}>+2519 85316396</Text>
        </View>
      </View>

      {/* Settings Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>
        <TouchableOpacity style={styles.row}>
          <Icon name="bell" size={18} color="#888" />
          <Text style={styles.rowText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Icon name="locker" size={18} color="#888" />
          <Text style={styles.rowText}>Privacy & Security</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Icon name="moon" size={18} color="#888" />
          <Text style={styles.rowText}>Appearance</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton}>
        <Icon name="logout" size={18} color="#fff" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#007aff',
    fontSize: 13,
    marginLeft: 6,
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rowText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  logoutButton: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
});
