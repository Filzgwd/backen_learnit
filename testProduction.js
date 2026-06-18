#!/usr/bin/env node
/**
 * Production Troubleshooting Script
 * Test delete material di production dan debug 401 error
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const PROD_URL = 'https://backenlearit-production.up.railway.app/api';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin123';

let adminToken = null;

const api = axios.create({
  baseURL: PROD_URL,
  validateStatus: () => true,
  timeout: 10000,
});

console.log('🚀 PRODUCTION TROUBLESHOOTING\n');
console.log('='.repeat(60) + '\n');

async function checkProductionHealth() {
  console.log('1️⃣  Check Production Server Health');
  console.log(`   URL: ${PROD_URL}\n`);

  try {
    const response = await api.get('/materials', {
      timeout: 5000,
    });

    console.log(`   Status: ${response.status}`);
    console.log('   ✅ Production server is reachable\n');
    return true;
  } catch (error) {
    console.log(`   ❌ Cannot reach production server`);
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

async function testLogin() {
  console.log('2️⃣  Test Login on Production');
  console.log(`   Email: ${ADMIN_EMAIL}\n`);

  try {
    const response = await api.post('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    console.log(`   Status: ${response.status}`);

    if (response.status === 200) {
      adminToken = response.data.token;
      console.log(`   ✅ Login successful`);
      console.log(`   Token length: ${adminToken.length}`);
      console.log(`   User role: ${response.data.user.role}\n`);
      return true;
    } else {
      console.log(`   ❌ Login failed`);
      console.log(`   Response:`, response.data, '\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

async function testMaterialsList() {
  console.log('3️⃣  Fetch Materials List');

  try {
    const response = await api.get('/materials');

    console.log(`   Status: ${response.status}`);

    if (response.status === 200) {
      console.log(`   ✅ Got ${response.data.length} materials`);
      if (response.data.length > 0) {
        console.log(`   First material ID: ${response.data[0].id}`);
        console.log(`   First material title: ${response.data[0].title}\n`);
        return response.data[0].id;
      } else {
        console.log('   ⚠️  No materials found\n');
        return null;
      }
    } else {
      console.log(`   ❌ Failed to fetch materials\n`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return null;
  }
}

async function testDeleteWithAuth(materialId) {
  if (!materialId || !adminToken) {
    console.log('⚠️  Cannot test delete - missing material or token\n');
    return false;
  }

  console.log('4️⃣  Test DELETE with Auth Token');
  console.log(`   Material ID: ${materialId}`);
  console.log(`   Token: ${adminToken.substring(0, 20)}...\n`);

  try {
    const response = await api.delete(`/materials/${materialId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data, '\n');

    if (response.status === 200) {
      console.log('   ✅ DELETE SUCCESSFUL!\n');
      return true;
    } else {
      console.log('   ❌ DELETE FAILED!\n');
      
      // Debug info
      if (response.status === 401) {
        console.log('   💡 401 Unauthorized');
        console.log('   Possible causes:');
        console.log('   1. JWT_SECRET mismatch between backend and Railway');
        console.log('   2. Token is expired');
        console.log('   3. Token format is wrong\n');
      } else if (response.status === 403) {
        console.log('   💡 403 Forbidden');
        console.log('   User might not have admin role\n');
      }
      
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.code === 'ECONNABORTED') {
      console.log('   (Request timeout - server might be slow)\n');
    } else {
      console.log('\n');
    }
    return false;
  }
}

async function checkHeadersResponse() {
  console.log('5️⃣  Check Response Headers');
  console.log('   (Looking for CORS and other headers)\n');

  try {
    const response = await api.get('/materials', {
      validateStatus: () => true,
    });

    console.log('   Response Headers:');
    const importantHeaders = [
      'content-type',
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
    ];

    importantHeaders.forEach(header => {
      const value = response.headers[header];
      console.log(`   - ${header}: ${value || '(not set)'}`);
    });

    if (response.headers['access-control-allow-origin']) {
      console.log('\n   ✅ CORS headers present\n');
    } else {
      console.log('\n   ⚠️  CORS headers might be missing\n');
    }
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }
}

async function main() {
  console.log('📋 PRODUCTION TROUBLESHOOTING CHECKLIST\n');
  console.log('URL: ' + PROD_URL + '\n');

  const health = await checkProductionHealth();
  if (!health) {
    console.log('❌ Cannot continue - server not reachable');
    process.exit(1);
  }

  const loggedIn = await testLogin();
  if (!loggedIn) {
    console.log('❌ Cannot continue - login failed');
    process.exit(1);
  }

  const materialId = await testMaterialsList();

  if (materialId) {
    await testDeleteWithAuth(materialId);
  }

  await checkHeadersResponse();

  console.log('='.repeat(60));
  console.log('\n📋 SUMMARY\n');
  console.log('If DELETE still returns 401:');
  console.log('1. Check Railway environment variables');
  console.log('   - JWT_SECRET must match backend code');
  console.log('2. Force rebuild in Railway dashboard');
  console.log('3. Check production logs for errors');
  console.log('4. Verify frontend is sending Authorization header\n');

  process.exit(0);
}

main();
