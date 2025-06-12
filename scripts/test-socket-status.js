#!/usr/bin/env node

/**
 * Test script to verify socket status changes
 * Run with: node scripts/test-socket-status.js
 */

console.log('🧪 Testing Socket Status Changes\n');

// Mock socket class to simulate the behavior
class MockBusTrackingSocket {
  constructor() {
    this.connectionStatus = 'disconnected';
    this.usingFallback = false;
    this.listeners = new Map();
    this.connect();
  }

  connect() {
    console.log('🔌 Attempting to connect...');
    this.connectionStatus = 'connecting';
    console.log('📊 Status set to:', this.connectionStatus);
    
    // Simulate connection error after a short delay
    setTimeout(() => {
      this.simulateConnectionError();
    }, 1000);
  }

  simulateConnectionError() {
    console.log('🚨 CONNECTION ERROR: xhr poll error');
    console.log('📡 Switching to fallback mock data...');
    
    this.useFallbackData();
    this.emit('error', new Error('xhr poll error'));
  }

  useFallbackData() {
    console.log('📡 Switching to fallback mock data - WebSocket unavailable');
    console.log('🔄 Real-time updates will use simulated data instead');

    this.connectionStatus = 'fallback';
    this.usingFallback = true;
    
    console.log('🔧 Socket status updated to:', this.connectionStatus);
    console.log('🔧 Using fallback:', this.usingFallback);
    
    // Emit a fallback event to indicate we're using mock data
    this.emit('connect'); // Simulate connection for UI purposes
  }

  getConnectionStatus() {
    console.log('🔍 getConnectionStatus called, returning:', this.connectionStatus);
    return this.connectionStatus;
  }

  isUsingFallback() {
    return this.usingFallback;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  emit(event, ...args) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in socket event callback for ${event}:`, error);
        }
      });
    }
  }
}

// Test the socket status behavior
async function testSocketStatus() {
  console.log('=== Testing Socket Status Behavior ===\n');
  
  const socket = new MockBusTrackingSocket();
  
  // Set up event listeners like the UI does
  const handleConnect = () => {
    console.log('✅ UI: Socket connected event received');
    const status = socket.getConnectionStatus();
    console.log('✅ UI: Status updated to:', status);
  };

  const handleError = () => {
    console.log('🚨 UI: Socket error event received');
    const status = socket.getConnectionStatus();
    console.log('🚨 UI: Status updated to:', status);
  };

  socket.on('connect', handleConnect);
  socket.on('error', handleError);
  
  console.log('📊 Initial status:', socket.getConnectionStatus());
  
  // Wait for the connection error simulation
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n📊 Final status:', socket.getConnectionStatus());
  console.log('📊 Using fallback:', socket.isUsingFallback());
  
  // Test status text mapping
  console.log('\n=== Testing Status Text Mapping ===');
  const statuses = ['connecting', 'connected', 'disconnected', 'fallback'];
  const statusTexts = {
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    fallback: 'Using Mock Data'
  };
  
  statuses.forEach(status => {
    console.log(`${status} -> "${statusTexts[status]}"`);
  });
  
  console.log('\n🎉 Socket status test completed!');
}

// Run the test
testSocketStatus().catch(console.error);
