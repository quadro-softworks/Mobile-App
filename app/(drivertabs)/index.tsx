import React from 'react';
import { View, Text } from 'react-native';

export default function DriverHomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F6FF' }}>
      <Text style={{ fontSize: 24, color: '#2563EB', fontWeight: 'bold' }}>Driver Home</Text>
      <Text style={{ fontSize: 16, color: '#64748B', marginTop: 12 }}>This is the Driver Home screen.</Text>
    </View>
  );
}
