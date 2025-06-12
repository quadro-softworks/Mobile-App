import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { busTrackingSocket } from '@/utils/socket';

const SocketTest = () => {
  const [isConnected, setIsConnected] = useState(busTrackingSocket.isConnected());
  const [connectionStatus, setConnectionStatus] = useState(busTrackingSocket.getConnectionStatus());
  const [isUsingFallback, setIsUsingFallback] = useState(busTrackingSocket.isUsingFallback());

  useEffect(() => {
    const unsubscribeConnect = busTrackingSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionStatus(busTrackingSocket.getConnectionStatus());
      setIsUsingFallback(busTrackingSocket.isUsingFallback());
    });

    const unsubscribeDisconnect = busTrackingSocket.on('disconnect', () => {
      setIsConnected(false);
      setConnectionStatus(busTrackingSocket.getConnectionStatus());
      setIsUsingFallback(busTrackingSocket.isUsingFallback());
    });

    const unsubscribeError = busTrackingSocket.on('error', () => {
      setConnectionStatus(busTrackingSocket.getConnectionStatus());
      setIsUsingFallback(busTrackingSocket.isUsingFallback());
    });

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Connection Status: {connectionStatus}</Text>
      <Text style={styles.text}>Is Connected: {isConnected ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Using Fallback Data: {isUsingFallback ? 'Yes' : 'No'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default SocketTest;
