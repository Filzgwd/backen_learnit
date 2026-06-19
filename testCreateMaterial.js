#!/usr/bin/env node
/**
 * Test script to diagnose material creation issue
 * Run: node testCreateMaterial.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin123';

let adminToken = null;
let categoryId = null;

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

console.log('🧪 Testing Material Creation Issue...\n');
console.log('='.repeat(60));

// Step 1: Login
async function testLogin() {
  console.log('📝 STEP 1: Login as admin');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}\n`);

  try {
    const response = await api.post('/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    console.log(`   Response Status: ${response.status}`);
    
    if (response.status === 200) {
      adminToken = response.data.token;
      console.log(`   ✅ Login successful!`);
      console.log(`   Token: ${adminToken.substring(0, 50)}...`);
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

// Step 2: Get categories
async function testGetCategories() {
  console.log('📋 STEP 2: Get categories');

  try {
    const response = await api.get('/categories');

    console.log(`   Response Status: ${response.status}`);
    console.log(`   Categories found: ${response.data.length}`);

    if (response.data.length > 0) {
      categoryId = response.data[0].id;
      console.log(`   Using category: ${response.data[0].name} (ID: ${categoryId})\n`);
      return true;
    } else {
      console.log(`   ❌ No categories found!`);
      console.log(`   Please create a category first\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
    return false;
  }
}

// Step 3: Create material
async function testCreateMaterial() {
  console.log('✏️  STEP 3: Create material');

  const materialData = {
    title: `Test Material ${Date.now()}`,
    description: 'This is a test material to debug creation issue',
    category_id: categoryId,
    image: 'https://via.placeholder.com/300',
    videoLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    blocks: [
      {
        title: 'Introduction',
        paragraph: 'This is the first block',
      },
      {
        title: 'Content',
        paragraph: 'This is more content',
        list: ['Point 1', 'Point 2', 'Point 3']
      }
    ]
  };

  console.log(`   Material Data:`);
  console.log(`   - Title: ${materialData.title}`);
  console.log(`   - Category ID: ${materialData.category_id}`);
  console.log(`   - Has Image: ${!!materialData.image}`);
  console.log(`   - Has Video: ${!!materialData.videoLink}`);
  console.log(`   - Blocks: ${materialData.blocks.length}\n`);

  try {
    const response = await api.post('/materials', materialData, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`   Response Status: ${response.status}`);

    if (response.status === 201 || response.status === 200) {
      const material = response.data;
      console.log(`   ✅ Material created successfully!`);
      console.log(`   - ID: ${material.id}`);
      console.log(`   - Title: ${material.title}`);
      console.log(`   - Category: ${material.category_name || 'N/A'}`);
      console.log(`   - Contents stored: ${(material.contents || []).length}\n`);
      
      // Store the ID for next step
      return material.id;
    } else {
      console.log(`   ❌ Create failed!`);
      console.log(`   Response:`, response.data);
      console.log(`   Headers:`, response.headers, '\n');
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
    console.log(`   Full error:`, error.response?.data || error, '\n');
    return null;
  }
}

// Step 4: Get the created material
async function testGetCreatedMaterial(materialId) {
  console.log('🔍 STEP 4: Retrieve created material');

  try {
    const response = await api.get(`/materials/${materialId}`);

    console.log(`   Response Status: ${response.status}`);

    if (response.status === 200) {
      const material = response.data;
      console.log(`   ✅ Material retrieved successfully!`);
      console.log(`   - ID: ${material.id}`);
      console.log(`   - Title: ${material.title}`);
      console.log(`   - Category: ${material.category_name || 'N/A'}`);
      console.log(`   - Blocks: ${(material.blocks || []).length}`);
      console.log(`   - Contents: ${(material.contents || []).length}\n`);
      
      if (material.blocks && material.blocks.length > 0) {
        console.log(`   ✅ MATERIAL IS COMPLETE AND RETRIEVABLE!`);
      } else {
        console.log(`   ⚠️  WARNING: Material retrieved but has no blocks`);
      }
      
      return true;
    } else {
      console.log(`   ❌ Material not found!`);
      console.log(`   Response:`, response.data, '\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
    return false;
  }
}

// Step 5: Get all materials
async function testGetAllMaterials() {
  console.log('📚 STEP 5: Get all materials');

  try {
    const response = await api.get('/materials');

    console.log(`   Response Status: ${response.status}`);
    console.log(`   Total materials: ${response.data.length}`);

    if (response.data.length > 0) {
      const latest = response.data[0];
      console.log(`   Latest material:`);
      console.log(`   - ID: ${latest.id}`);
      console.log(`   - Title: ${latest.title}`);
      console.log(`   - Blocks: ${(latest.blocks || []).length}\n`);
      return true;
    } else {
      console.log(`   ⚠️  No materials found\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
    return false;
  }
}

// Main execution
async function main() {
  console.log('\n');

  if (!await testLogin()) {
    console.log('❌ Cannot proceed without login\n');
    process.exit(1);
  }

  if (!await testGetCategories()) {
    console.log('❌ Cannot proceed without categories\n');
    process.exit(1);
  }

  const materialId = await testCreateMaterial();
  if (!materialId) {
    console.log('❌ Cannot proceed without material creation\n');
    process.exit(1);
  }

  await testGetCreatedMaterial(materialId);
  await testGetAllMaterials();

  console.log('='.repeat(60));
  console.log('\n🎯 DIAGNOSIS SUMMARY:\n');
  console.log('If all steps passed:');
  console.log('  ✅ Backend is working correctly');
  console.log('  ✅ Database connections are OK');
  console.log('  ✅ Problem is likely in the FRONTEND\n');
  
  console.log('Common frontend issues:');
  console.log('  1. Token not being sent in request headers');
  console.log('  2. Material ID format mismatch (UUID vs integer)');
  console.log('  3. CORS issues preventing the request');
  console.log('  4. Request body format different from backend expectations');
  console.log('  5. Frontend not refreshing the material list after creation\n');

  process.exit(0);
}

main();
