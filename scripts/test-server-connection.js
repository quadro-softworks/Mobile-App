#!/usr/bin/env node

/**
 * Test script to diagnose server connection issues
 * Run with: node scripts/test-server-connection.js
 */

const https = require('https');

console.log('🔍 Diagnosing Server Connection Issues\n');

const SERVER_URL = 'https://guzosync-fastapi.onrender.com';

// Test 1: Basic HTTP connectivity
async function testBasicConnectivity() {
  console.log('=== Test 1: Basic HTTP Connectivity ===');
  
  return new Promise((resolve) => {
    const req = https.get(SERVER_URL, (res) => {
      console.log('✅ Server is reachable');
      console.log('📊 Status Code:', res.statusCode);
      console.log('📊 Headers:', JSON.stringify(res.headers, null, 2));
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('📊 Response Body:', data.substring(0, 200) + (data.length > 200 ? '...' : ''));
        resolve(true);
      });
    });

    req.on('error', (error) => {
      console.log('❌ Server is NOT reachable');
      console.log('❌ Error:', error.message);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('❌ Request timed out after 10 seconds');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 2: Check Socket.IO endpoint
async function testSocketIOEndpoint() {
  console.log('\n=== Test 2: Socket.IO Endpoint Check ===');
  
  const socketIOUrl = `${SERVER_URL}/socket.io/?EIO=4&transport=polling`;
  
  return new Promise((resolve) => {
    const req = https.get(socketIOUrl, (res) => {
      console.log('✅ Socket.IO endpoint responds');
      console.log('📊 Status Code:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('📊 Socket.IO Response:', data.substring(0, 200));
        resolve(true);
      });
    });

    req.on('error', (error) => {
      console.log('❌ Socket.IO endpoint failed');
      console.log('❌ Error:', error.message);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('❌ Socket.IO request timed out');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 3: Check specific WebSocket endpoint
async function testWebSocketEndpoint() {
  console.log('\n=== Test 3: WebSocket Endpoint Check ===');
  
  const wsUrl = `${SERVER_URL}/ws/connect`;
  
  return new Promise((resolve) => {
    const req = https.get(wsUrl, (res) => {
      console.log('📊 WebSocket endpoint status:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 404) {
          console.log('❌ WebSocket endpoint not found (404)');
          console.log('💡 Server might not have WebSocket support configured');
        } else {
          console.log('✅ WebSocket endpoint exists');
          console.log('📊 Response:', data.substring(0, 200));
        }
        resolve(res.statusCode !== 404);
      });
    });

    req.on('error', (error) => {
      console.log('❌ WebSocket endpoint check failed');
      console.log('❌ Error:', error.message);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('❌ WebSocket endpoint check timed out');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 4: Check API endpoints
async function testAPIEndpoints() {
  console.log('\n=== Test 4: API Endpoints Check ===');
  
  const endpoints = [
    '/api/buses/stops',
    '/api/notifications',
    '/api/account/me'
  ];
  
  for (const endpoint of endpoints) {
    const url = `${SERVER_URL}${endpoint}`;
    console.log(`\nTesting: ${endpoint}`);
    
    await new Promise((resolve) => {
      const req = https.get(url, (res) => {
        console.log(`📊 ${endpoint}: Status ${res.statusCode}`);
        resolve();
      });

      req.on('error', (error) => {
        console.log(`❌ ${endpoint}: ${error.message}`);
        resolve();
      });

      req.setTimeout(5000, () => {
        console.log(`❌ ${endpoint}: Timeout`);
        req.destroy();
        resolve();
      });
    });
  }
}

// Main test function
async function runDiagnostics() {
  try {
    const basicConnectivity = await testBasicConnectivity();
    
    if (basicConnectivity) {
      await testSocketIOEndpoint();
      await testWebSocketEndpoint();
      await testAPIEndpoints();
    }
    
    console.log('\n=== Diagnosis Summary ===');
    console.log('🔍 If server is reachable but Socket.IO fails:');
    console.log('   - Server might not have Socket.IO configured');
    console.log('   - CORS might be blocking the connection');
    console.log('   - Server might be using different Socket.IO version');
    
    console.log('\n🔍 If server is not reachable:');
    console.log('   - Server might be sleeping (free Render deployments)');
    console.log('   - Server might be down');
    console.log('   - Network/firewall issues');
    
    console.log('\n💡 Recommended Actions:');
    console.log('   1. Check if server is running and accessible');
    console.log('   2. Verify Socket.IO is properly configured on server');
    console.log('   3. Check CORS settings on server');
    console.log('   4. Consider using fallback mock data (already implemented)');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

// Run diagnostics
runDiagnostics();
