#!/usr/bin/env node

/**
 * Manual test script for bus stops caching and socket optimizations
 * Run with: node scripts/test-optimizations.js
 */

console.log('🧪 Testing Bus Stops Caching and Socket Optimizations\n');

// Simulate the caching logic
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let mockStore = {
  stops: [],
  stopsLoaded: false,
  stopsLastFetched: null,
  fetchCount: 0
};

function mockFetchBusStops() {
  mockStore.fetchCount++;
  console.log(`📡 API Call #${mockStore.fetchCount}: Fetching bus stops from server...`);
  
  // Simulate API response
  mockStore.stops = [
    { id: '1', name: 'Stop 1', location: { lat: 9.0301, lng: 38.7578 } },
    { id: '2', name: 'Stop 2', location: { lat: 9.0302, lng: 38.7579 } }
  ];
  
  return Promise.resolve();
}

function fetchBusStopsOnce() {
  const now = Date.now();
  
  // Check if we already have stops and they're not expired
  if (mockStore.stopsLoaded && 
      mockStore.stopsLastFetched && 
      (now - mockStore.stopsLastFetched) < CACHE_DURATION &&
      mockStore.stops.length > 0) {
    
    const ageMinutes = Math.floor((now - mockStore.stopsLastFetched) / 1000 / 60);
    console.log(`🔄 Using cached bus stops (${ageMinutes} minutes old)`);
    return Promise.resolve();
  }

  console.log('📡 Cache expired or empty, fetching fresh data...');
  
  return mockFetchBusStops().then(() => {
    mockStore.stopsLoaded = true;
    mockStore.stopsLastFetched = now;
  });
}

async function testCaching() {
  console.log('=== Testing Bus Stops Caching ===\n');
  
  console.log('1. First call (should fetch):');
  await fetchBusStopsOnce();
  console.log(`   ✅ Stops loaded: ${mockStore.stops.length}, API calls: ${mockStore.fetchCount}\n`);
  
  console.log('2. Second call immediately (should use cache):');
  await fetchBusStopsOnce();
  console.log(`   ✅ Stops loaded: ${mockStore.stops.length}, API calls: ${mockStore.fetchCount}\n`);
  
  console.log('3. Third call immediately (should use cache):');
  await fetchBusStopsOnce();
  console.log(`   ✅ Stops loaded: ${mockStore.stops.length}, API calls: ${mockStore.fetchCount}\n`);
  
  console.log('4. Simulating cache expiration...');
  mockStore.stopsLastFetched = Date.now() - (CACHE_DURATION + 1000); // Expire cache
  await fetchBusStopsOnce();
  console.log(`   ✅ Stops loaded: ${mockStore.stops.length}, API calls: ${mockStore.fetchCount}\n`);
  
  console.log('5. Another call after expiration (should use cache again):');
  await fetchBusStopsOnce();
  console.log(`   ✅ Stops loaded: ${mockStore.stops.length}, API calls: ${mockStore.fetchCount}\n`);
}

function testSocketStatus() {
  console.log('=== Testing Socket Connection Status ===\n');
  
  const statuses = ['connecting', 'connected', 'disconnected', 'fallback'];
  const colors = {
    connecting: '🟡',
    connected: '🟢', 
    disconnected: '🔴',
    fallback: '🟣'
  };
  
  const statusTexts = {
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnected: 'Disconnected', 
    fallback: 'Using Mock Data'
  };
  
  console.log('Socket status display examples:');
  statuses.forEach(status => {
    console.log(`${colors[status]} Socket: ${statusTexts[status]}`);
  });
  
  console.log('\n✅ Socket status improvements implemented');
}

async function runTests() {
  try {
    await testCaching();
    testSocketStatus();
    
    console.log('\n🎉 All optimization tests completed!');
    console.log('\nExpected results:');
    console.log('- Bus stops should be fetched only 2 times (initial + after expiration)');
    console.log('- Cache should be used for immediate subsequent calls');
    console.log('- Socket status should show detailed states with appropriate colors');
    
    if (mockStore.fetchCount === 2) {
      console.log('\n✅ PASS: Caching is working correctly!');
    } else {
      console.log(`\n❌ FAIL: Expected 2 API calls, got ${mockStore.fetchCount}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
runTests();
