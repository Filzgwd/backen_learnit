#!/usr/bin/env node
/**
 * Debug script untuk check database constraints dan lihat error detail dari delete
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin123';

let adminToken = null;
let materialId = null;

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

console.log('🔍 DEBUG: Delete Error Analysis\n');

async function login() {
  console.log('📝 Login as admin...');
  const response = await api.post('/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (response.status !== 200) {
    console.log('❌ Login failed');
    process.exit(1);
  }

  adminToken = response.data.token;
  console.log('✅ Logged in\n');
}

async function getFirstMaterial() {
  console.log('📋 Fetching first material from database...');
  const response = await api.get('/materials');

  if (response.status !== 200 || response.data.length === 0) {
    console.log('❌ No materials found');
    process.exit(1);
  }

  materialId = response.data[0].id;
  console.log(`✅ Found material: ${materialId}`);
  console.log(`   Title: ${response.data[0].title}\n`);
}

async function testDelete() {
  console.log('🗑️  Testing DELETE with detailed error logging...\n');
  console.log(`Material ID: ${materialId}`);
  console.log(`Authorization: Bearer ${adminToken.substring(0, 20)}...\n`);

  try {
    const response = await api.delete(`/materials/${materialId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`);
    console.log(JSON.stringify(response.headers, null, 2));
    console.log(`\n📊 Response Body:`);
    console.log(JSON.stringify(response.data, null, 2));

    if (response.status !== 200) {
      console.log(`\n❌ DELETE FAILED with status ${response.status}`);
      
      if (response.data.message) {
        console.log(`   Error message: ${response.data.message}`);
      }
      
      // Analyze error
      if (response.status === 500) {
        console.log(`\n🔍 Analysis: Internal Server Error (500)`);
        console.log(`   Possible causes:`);
        console.log(`   1. Foreign key constraint violation`);
        console.log(`   2. Database connection issue`);
        console.log(`   3. Unhandled exception in backend`);
        console.log(`\n   Check backend console for full error trace!`);
      }
    } else {
      console.log(`\n✅ DELETE SUCCESSFUL`);
    }
  } catch (error) {
    console.log(`\n❌ Network Error: ${error.message}`);
  }
}

async function checkReferences() {
  console.log('\n\n📍 Checking what might be referencing this material...\n');
  
  // Simulated check - in real scenario would need direct DB access
  console.log('Potential tables that reference materials:');
  console.log('  - material_contents (ON DELETE CASCADE) ✓');
  console.log('  - user_progress (ON DELETE CASCADE) ✓');
  console.log('  - quizzes (if still has material_id column) ⚠️');
  console.log('\nIf delete fails, check backend logs for:');
  console.log('  - "constraint"');
  console.log('  - "foreign key"');
  console.log('  - "violates"');
}

async function main() {
  console.log('='.repeat(70));
  console.log('DEBUG: DELETE MATERIAL ERROR');
  console.log('='.repeat(70) + '\n');

  await login();
  await getFirstMaterial();
  await testDelete();
  await checkReferences();

  console.log('\n' + '='.repeat(70));
  console.log('💡 NEXT STEPS:');
  console.log('='.repeat(70));
  console.log('1. Check backend console output for detailed error message');
  console.log('2. Look for "constraint" or "foreign key" errors');
  console.log('3. Check if quizzes table still has material_id column');
  console.log('4. Verify material_contents and user_progress use ON DELETE CASCADE');
  console.log('='.repeat(70) + '\n');

  process.exit(0);
}

main();
