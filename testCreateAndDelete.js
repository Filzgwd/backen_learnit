#!/usr/bin/env node
/**
 * Comprehensive test untuk create dan delete material
 * Run: node testCreateAndDelete.js
 */

const axios = require('axios');

// Configuration
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

console.log('🧪 Testing Create & Delete Material Flow...\n');

// Step 1: Login
async function testLogin() {
  console.log('📝 Step 1: Login as admin');

  try {
    const response = await api.post('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (response.status === 200) {
      adminToken = response.data.token;
      console.log(`   ✅ Login successful\n`);
      return true;
    } else {
      console.log(`   ❌ Login failed: ${response.status}`);
      console.log(`   Response:`, response.data, '\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
    return false;
  }
}

// Step 2: Get or create category
async function testGetCategories() {
  console.log('📂 Step 2: Get categories');

  try {
    const response = await api.get('/categories');

    if (response.status === 200 && response.data.length > 0) {
      categoryId = response.data[0].id;
      console.log(`   ✅ Found ${response.data.length} categories`);
      console.log(`   Using: ${response.data[0].name} (ID: ${categoryId})\n`);
      return true;
    } else if (response.status === 200 && response.data.length === 0) {
      console.log(`   ⚠️  No categories found\n`);
      return false;
    } else {
      console.log(`   ❌ Failed: ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
    return false;
  }
}

// Step 3: Create test material
async function testCreateMaterial() {
  if (!categoryId) {
    console.log('⚠️  Cannot create material - no category\n');
    return false;
  }

  console.log('✏️  Step 3: Create test material');

  try {
    const testData = {
      title: `Test Material ${Date.now()}`,
      description: 'This is a test material for delete testing',
      category_id: categoryId,
    };

    const response = await api.post('/materials', testData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    console.log(`   Status: ${response.status}`);

    if (response.status === 201) {
      materialId = response.data.id;
      console.log(`   ✅ Material created`);
      console.log(`   - ID: ${materialId}`);
      console.log(`   - Title: ${response.data.title}\n`);
      return true;
    } else {
      console.log(`   ❌ Create failed!`);
      console.log(`   Response:`, response.data, '\n');
      
      if (response.status === 401) {
        console.log(`   💡 401 Unauthorized - Check token`);
      } else if (response.status === 403) {
        console.log(`   💡 403 Forbidden - Check admin role`);
      }
      console.log();
      
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
    return false;
  }
}

// Step 4: Delete material
async function testDeleteMaterial() {
  if (!materialId) {
    console.log('⚠️  Cannot test delete - no material\n');
    return false;
  }

  console.log('🗑️  Step 4: Delete material');
  console.log(`   Material ID: ${materialId}\n`);

  try {
    const response = await api.delete(`/materials/${materialId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    console.log(`   Status: ${response.status}`);

    if (response.status === 200) {
      console.log(`   ✅ Delete successful!`);
      console.log(`   Response:`, response.data.message, '\n');
      return true;
    } else {
      console.log(`   ❌ Delete failed!`);
      console.log(`   Response:`, response.data, '\n');
      
      if (response.status === 401) {
        console.log(`   💡 401 Unauthorized`);
        console.log(`      - Token invalid or expired`);
        console.log(`      - Check Authorization header\n`);
      } else if (response.status === 403) {
        console.log(`   💡 403 Forbidden`);
        console.log(`      - User is not admin`);
        console.log(`      - Check role middleware\n`);
      }
      
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
    return false;
  }
}

// Main
async function runTests() {
  console.log('='.repeat(50));
  console.log('CREATE & DELETE MATERIAL TEST');
  console.log('='.repeat(50) + '\n');

  const step1 = await testLogin();
  if (!step1) {
    console.log('❌ Cannot proceed - login failed\n');
    process.exit(1);
  }

  const step2 = await testGetCategories();
  if (!step2) {
    console.log('❌ Cannot proceed - no categories\n');
    process.exit(1);
  }

  const step3 = await testCreateMaterial();
  if (!step3) {
    console.log('❌ Cannot proceed - create material failed\n');
    process.exit(1);
  }

  const step4 = await testDeleteMaterial();

  if (step4) {
    console.log('✅ ALL TESTS PASSED!\n');
    console.log('Summary:');
    console.log('  ✓ Admin login works');
    console.log('  ✓ Create material works (with auth)');
    console.log('  ✓ Delete material works (with auth)\n');
  } else {
    console.log('❌ DELETE FAILED!\n');
    console.log('This indicates an issue with the delete endpoint or authorization.\n');
  }

  process.exit(step4 ? 0 : 1);
}

runTests();
