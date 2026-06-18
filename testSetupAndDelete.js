#!/usr/bin/env node
/**
 * Setup script - create category, material, then test delete
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin123';

let adminToken = null;
let categoryId = null;
let materialId = null;

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

console.log('🔧 Setting up test data and testing delete flow...\n');

async function testLogin() {
  console.log('📝 Login as admin');

  const response = await api.post('/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (response.status === 200) {
    adminToken = response.data.token;
    console.log(`   ✅ Logged in\n`);
    return true;
  } else {
    console.log(`   ❌ Failed: ${response.status}\n`);
    return false;
  }
}

async function testCreateCategory() {
  console.log('📂 Creating category...');

  const response = await api.post('/categories', {
    name: `Test Category ${Date.now()}`,
    description: 'Test category for material',
  }, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });

  console.log(`   Status: ${response.status}`);

  if (response.status === 201 || response.status === 200) {
    categoryId = response.data.id;
    console.log(`   ✅ Category created: ${categoryId}\n`);
    return true;
  } else {
    console.log(`   ❌ Failed: ${response.data.message}\n`);
    return false;
  }
}

async function testCreateMaterial() {
  console.log('✏️  Creating material...');

  const response = await api.post('/materials', {
    title: `Test Material ${Date.now()}`,
    description: 'Test material for delete',
    category_id: categoryId,
  }, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });

  console.log(`   Status: ${response.status}`);

  if (response.status === 201 || response.status === 200) {
    materialId = response.data.id;
    console.log(`   ✅ Material created: ${materialId}\n`);
    return true;
  } else {
    console.log(`   ❌ Failed: ${response.status}`);
    console.log(`   Response:`, response.data, '\n');
    return false;
  }
}

async function testDeleteMaterial() {
  console.log('🗑️  Testing DELETE with authentication...');
  console.log(`   Material: ${materialId}`);
  console.log(`   Token: ${adminToken.substring(0, 20)}...\n`);

  const response = await api.delete(`/materials/${materialId}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });

  console.log(`   Status: ${response.status}`);

  if (response.status === 200) {
    console.log(`   ✅ DELETE SUCCESSFUL!\n`);
    console.log(`   Response:`, response.data.message);
    console.log(`   This means the delete endpoint is working correctly!\n`);
    return true;
  } else {
    console.log(`   ❌ DELETE FAILED - Status ${response.status}`);
    console.log(`   Response:`, response.data, '\n');
    
    if (response.status === 401) {
      console.log(`   💡 401 Error - Authorization issue`);
      console.log(`      Possible causes:`);
      console.log(`      1. Token is invalid or expired`);
      console.log(`      2. JWT_SECRET mismatch`);
      console.log(`      3. Authorization header format wrong\n`);
    } else if (response.status === 403) {
      console.log(`   💡 403 Error - Permission issue`);
      console.log(`      Possible causes:`);
      console.log(`      1. User is not admin`);
      console.log(`      2. Role middleware rejecting request\n`);
    }
    
    return false;
  }
}

async function testDeleteWithoutAuth() {
  console.log('🔒 Testing DELETE without authentication (should fail)...\n');

  const response = await api.delete(`/materials/${materialId}`);

  console.log(`   Status: ${response.status}`);

  if (response.status === 401) {
    console.log(`   ✅ Correctly rejected with 401`);
    console.log(`   This is expected behavior!\n`);
    return true;
  } else {
    console.log(`   ❌ Should have failed with 401, got ${response.status}\n`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('COMPLETE DELETE MATERIAL TEST');
  console.log('='.repeat(60) + '\n');

  if (!await testLogin()) {
    process.exit(1);
  }

  if (!await testCreateCategory()) {
    process.exit(1);
  }

  if (!await testCreateMaterial()) {
    process.exit(1);
  }

  const deleteResult = await testDeleteMaterial();

  if (deleteResult) {
    console.log('✅ SUCCESS - Delete material with auth is working!\n');
    console.log('Next steps:');
    console.log('1. Test the same delete flow from your frontend');
    console.log('2. Check browser network tab to verify:');
    console.log('   - Authorization header is being sent');
    console.log('   - Request body is correct');
    console.log('   - Response status and body\n');
    process.exit(0);
  } else {
    console.log('❌ FAILED - Delete endpoint has issues\n');
    console.log('Testing without auth for comparison...\n');
    await testDeleteWithoutAuth();
    process.exit(1);
  }
}

main();
