#!/usr/bin/env node
/**
 * Direct test of createMaterial service
 */

require('dotenv').config();
const materialService = require('./src/services/materialService');
const pool = require('./src/config/db');

async function test() {
  try {
    console.log('🧪 Testing createMaterial service directly...\n');

    // Get a category
    const categoryResult = await pool.query(`SELECT id, name FROM categories LIMIT 1`);
    const categoryId = categoryResult.rows[0].id;
    const categoryName = categoryResult.rows[0].name;

    console.log(`Using category: ${categoryName} (${categoryId})\n`);

    // Test data - same format as frontend would send
    const testData = {
      title: `Direct Test Material ${Date.now()}`,
      description: 'Testing the service directly',
      category_id: categoryId,
      image: 'https://via.placeholder.com/300x200',
      videoLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      blocks: [
        {
          title: 'Section 1',
          paragraph: 'First paragraph'
        },
        {
          title: 'Section 2',
          paragraph: 'Second paragraph',
          list: ['Item 1', 'Item 2']
        }
      ]
    };

    console.log('📋 Test Data:');
    console.log(`  - Title: ${testData.title}`);
    console.log(`  - Category: ${categoryId}`);
    console.log(`  - Image: ${testData.image}`);
    console.log(`  - Video: ${testData.videoLink}`);
    console.log(`  - Blocks: ${testData.blocks.length}\n`);

    // Call the service
    console.log('🚀 Calling materialService.createMaterial()...\n');
    const result = await materialService.createMaterial(testData);

    console.log('✅ Service returned result:\n');
    console.log(`  - ID: ${result.id}`);
    console.log(`  - Title: ${result.title}`);
    console.log(`  - Category: ${result.category_name}`);
    console.log(`  - Contents in response: ${(result.contents || []).length}`);
    console.log(`  - Blocks in response: ${(result.blocks || []).length}\n`);

    // Verify in database
    console.log('🔍 Verifying in database...\n');
    const dbCheck = await pool.query(`
      SELECT COUNT(*) as cnt FROM material_contents WHERE material_id = $1
    `, [result.id]);

    console.log(`  - Total contents in DB: ${dbCheck.rows[0].cnt}`);

    if (dbCheck.rows[0].cnt === 0) {
      console.log('\n❌ PROBLEM FOUND: Contents are not being inserted!\n');
      console.log('Checking if inserts are even being attempted...');
      
      // Let me manually insert to test
      console.log('\nManually testing insert...');
      const manualTest = await pool.query(`
        INSERT INTO material_contents (material_id, content_type, content, sequence)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [result.id, 'test', 'test content', 99]);
      
      console.log('✅ Manual insert worked! The problem is in createMaterial logic.\n');
      
    } else {
      console.log(`\n✅ Contents were inserted successfully!`);
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

test();
