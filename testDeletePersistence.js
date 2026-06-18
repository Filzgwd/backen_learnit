#!/usr/bin/env node
/**
 * Test untuk verify apakah deletion benar-benar disimpan ke database
 * dan tidak ada caching atau rollback yang terjadi
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin123';

let adminToken = null;
let categoryId = null;
let materialId = null;
let materialTitle = `Test Material ${Date.now()}`;

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

console.log('🧪 TEST: Verify Delete Persistence\n');
console.log('This test will:');
console.log('1. Create a category');
console.log('2. Create a material with unique title');
console.log('3. Delete the material');
console.log('4. Try to fetch it again - should return 404 or not found');
console.log('5. Get all materials - deleted one should NOT appear\n');
console.log('='.repeat(60) + '\n');

async function step1_Login() {
  console.log('📝 STEP 1: Login as admin');
  try {
    const response = await api.post('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (response.status !== 200) {
      console.log(`❌ Login failed: ${response.status}`);
      console.log(response.data);
      return false;
    }

    adminToken = response.data.token;
    console.log(`✅ Login successful\n`);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return false;
  }
}

async function step2_CreateCategory() {
  console.log('📂 STEP 2: Create category');
  try {
    const response = await api.post('/categories', 
      { name: `Category ${Date.now()}`, description: 'Test category' },
      { headers: { 'Authorization': `Bearer ${adminToken}` } }
    );

    if (response.status !== 201) {
      console.log(`❌ Create category failed: ${response.status}`);
      console.log(response.data);
      return false;
    }

    categoryId = response.data.id;
    console.log(`✅ Category created: ${categoryId}\n`);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return false;
  }
}

async function step3_CreateMaterial() {
  console.log('✏️  STEP 3: Create material');
  console.log(`   Title: ${materialTitle}`);
  try {
    const response = await api.post('/materials',
      {
        category_id: categoryId,
        title: materialTitle,
        description: `Test description - ${Date.now()}`,
      },
      { headers: { 'Authorization': `Bearer ${adminToken}` } }
    );

    if (response.status !== 201) {
      console.log(`❌ Create material failed: ${response.status}`);
      console.log(response.data);
      return false;
    }

    materialId = response.data.id;
    console.log(`✅ Material created: ${materialId}\n`);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return false;
  }
}

async function step4_DeleteMaterial() {
  console.log('🗑️  STEP 4: Delete material');
  console.log(`   ID: ${materialId}`);
  try {
    const response = await api.delete(`/materials/${materialId}`,
      { headers: { 'Authorization': `Bearer ${adminToken}` } }
    );

    if (response.status !== 200) {
      console.log(`❌ Delete failed: ${response.status}`);
      console.log(response.data);
      return false;
    }

    console.log(`✅ Delete successful`);
    console.log(`   Response: ${JSON.stringify(response.data)}\n`);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return false;
  }
}

async function step5_VerifyDeletedByID() {
  console.log('🔍 STEP 5: Try to fetch deleted material by ID');
  console.log(`   ID: ${materialId}`);
  try {
    const response = await api.get(`/materials/${materialId}`);

    if (response.status === 404 || !response.data) {
      console.log(`✅ CORRECT: Material not found (404)\n`);
      return true;
    } else {
      console.log(`⚠️  WARNING: Material still exists!`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data: ${JSON.stringify(response.data)}\n`);
      return false;
    }
  } catch (error) {
    console.log(`✅ CORRECT: Material not found (${error.message})\n`);
    return true;
  }
}

async function step6_VerifyDeletedInList() {
  console.log('📋 STEP 6: Get all materials - verify deleted one is NOT in the list');
  try {
    const response = await api.get('/materials');

    if (response.status !== 200) {
      console.log(`❌ Get materials failed: ${response.status}`);
      return false;
    }

    const materials = response.data;
    const found = materials.find(m => m.id === materialId);

    if (found) {
      console.log(`❌ PROBLEM: Deleted material still in list!`);
      console.log(`   Found: ${JSON.stringify(found)}`);
      console.log(`   Total materials: ${materials.length}\n`);
      return false;
    } else {
      console.log(`✅ CORRECT: Deleted material not in list`);
      console.log(`   Total materials in database: ${materials.length}\n`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return false;
  }
}

async function runAllTests() {
  const results = [];

  results.push(await step1_Login());
  if (!results[0]) {
    console.log('❌ Cannot proceed - login failed');
    process.exit(1);
  }

  results.push(await step2_CreateCategory());
  if (!results[1]) {
    console.log('❌ Cannot proceed - category creation failed');
    process.exit(1);
  }

  results.push(await step3_CreateMaterial());
  if (!results[2]) {
    console.log('❌ Cannot proceed - material creation failed');
    process.exit(1);
  }

  results.push(await step4_DeleteMaterial());
  if (!results[3]) {
    console.log('❌ Delete failed - stopping test');
    process.exit(1);
  }

  results.push(await step5_VerifyDeletedByID());
  results.push(await step6_VerifyDeletedInList());

  console.log('='.repeat(60));
  console.log('📊 TEST SUMMARY\n');

  if (results.every(r => r === true)) {
    console.log('✅ ALL TESTS PASSED - DELETE IS WORKING CORRECTLY\n');
    console.log('✓ Material was deleted from database');
    console.log('✓ Material cannot be fetched by ID');
    console.log('✓ Material not in materials list\n');
  } else {
    console.log('❌ SOME TESTS FAILED - DELETE MAY NOT BE WORKING\n');
    results.forEach((result, index) => {
      console.log(`Test ${index + 1}: ${result ? '✓ PASS' : '✗ FAIL'}`);
    });
  }

  process.exit(results.every(r => r === true) ? 0 : 1);
}

// Make sure server is running
console.log('ℹ️  Make sure the backend server is running: npm start\n');
setTimeout(runAllTests, 1000);
