import React from 'react';
import { View, Text } from 'react-native';

export default function RegulatorHomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F6FF' }}>
      <Text style={{ fontSize: 24, color: '#2563EB', fontWeight: 'bold' }}>Regulator Home</Text>
      <Text style={{ fontSize: 16, color: '#64748B', marginTop: 12 }}>This is the Regulator Home screen.</Text>
    </View>
  );
}
