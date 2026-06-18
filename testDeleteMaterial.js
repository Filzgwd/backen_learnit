#!/usr/bin/env node
/**
 * Test script untuk debug login dan delete material
 * Run: node testDeleteMaterial.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin123'; // default from resetAdminPassword.js

let adminToken = null;
let adminUserId = null;
let materialId = null;

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true, // Don't throw on any status
});

console.log('🧪 Testing Delete Material Flow...\n');

// Step 1: Login as admin
async function testLogin() {
  console.log('📝 Step 1: Login as admin');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}\n`);

  try {
    const response = await api.post('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      adminToken = response.data.token;
      adminUserId = response.data.user.id;
      console.log(`   ✅ Login successful!`);
      console.log(`   Token (first 50 chars): ${adminToken.substring(0, 50)}...`);
      console.log(`   User ID: ${adminUserId}`);
      console.log(`   User Role: ${response.data.user.role}\n`);
      return true;
    } else {
      console.log(`   ❌ Login failed!`);
      console.log(`   Response:`, response.data, '\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
    return false;
  }
}

// Step 2: Get all materials
async function testGetMaterials() {
  console.log('📋 Step 2: Get all materials');

  try {
    const response = await api.get('/materials');

    console.log(`   Status: ${response.status}`);

    if (response.status === 200 && response.data.length > 0) {
      materialId = response.data[0].id;
      console.log(`   ✅ Found ${response.data.length} materials`);
      console.log(`   Using first material for delete test:`);
      console.log(`   - ID: ${materialId}`);
      console.log(`   - Title: ${response.data[0].title}\n`);
      return true;
    } else if (response.status === 200 && response.data.length === 0) {
      console.log(`   ⚠️  No materials found in database\n`);
      return false;
    } else {
      console.log(`   ❌ Failed to fetch materials`);
      console.log(`   Response:`, response.data, '\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
    return false;
  }
}

// Step 3: Delete material with auth token
async function testDeleteMaterial() {
  if (!materialId) {
    console.log('⚠️  No material ID available for delete test\n');
    return false;
  }

  console.log('🗑️  Step 3: Delete material with token');
  console.log(`   Material ID: ${materialId}`);
  console.log(`   Authorization: Bearer ${adminToken.substring(0, 20)}...\n`);

  try {
    const response = await api.delete(`/materials/${materialId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    console.log(`   Status: ${response.status}`);

    if (response.status === 200) {
      console.log(`   ✅ Delete successful!`);
      console.log(`   Response:`, response.data, '\n');
      return true;
    } else {
      console.log(`   ❌ Delete failed!`);
      console.log(`   Response:`, response.data, '\n');
      
      // Debug info
      if (response.status === 401) {
        console.log(`   💡 Debug: 401 Unauthorized - Token issue`);
        console.log(`      - Check if token is valid`);
        console.log(`      - Check if token is expired`);
        console.log(`      - Check if JWT_SECRET is consistent\n`);
      } else if (response.status === 403) {
        console.log(`   💡 Debug: 403 Forbidden - Permission issue`);
        console.log(`      - Check if user role is "admin"`);
        console.log(`      - Check role middleware\n`);
      }
      
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
    return false;
  }
}

// Step 4: Delete without token (should fail with 401)
async function testDeleteWithoutToken() {
  if (!materialId) {
    console.log('⚠️  No material ID available\n');
    return false;
  }

  console.log('🔒 Step 4: Delete without token (should fail)');
  console.log(`   Material ID: ${materialId}\n`);

  try {
    const response = await api.delete(`/materials/${materialId}`);

    console.log(`   Status: ${response.status}`);

    if (response.status === 401) {
      console.log(`   ✅ Correctly rejected (401 Unauthorized)`);
      console.log(`   Response:`, response.data.message, '\n');
      return true;
    } else {
      console.log(`   ❌ Should have returned 401, but got ${response.status}`);
      console.log(`   Response:`, response.data, '\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
    return false;
  }
}

// Main execution
async function runTests() {
  console.log('='.repeat(50));
  console.log('DELETE MATERIAL TEST SUITE');
  console.log('='.repeat(50) + '\n');

  const step1 = await testLogin();
  if (!step1) {
    console.log('❌ Cannot proceed - login failed\n');
    process.exit(1);
  }

  const step2 = await testGetMaterials();
  if (!step2) {
    console.log('⚠️  Cannot test delete - no materials found\n');
    process.exit(0);
  }

  const step3 = await testDeleteMaterial();
  
  // Don't re-test without token if first delete was successful
  if (step3) {
    console.log('✅ All tests passed!\n');
  } else {
    console.log('Attempting comparison test without token...');
    await testDeleteWithoutToken();
  }

  process.exit(0);
}

runTests();
