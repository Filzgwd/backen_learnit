#!/usr/bin/env node
/**
 * Test direct insert into material_contents
 */

require('dotenv').config();
const pool = require('./src/config/db');

async function test() {
  try {
    console.log('🧪 Testing direct insert into material_contents...\n');

    // Get a material ID
    const materialResult = await pool.query(`
      SELECT id FROM materials LIMIT 1
    `);

    if (materialResult.rows.length === 0) {
      console.log('❌ No materials found. Creating one first...\n');
      
      // Get a category
      const categoryResult = await pool.query(`SELECT id FROM categories LIMIT 1`);
      const categoryId = categoryResult.rows[0].id;
      
      // Create a material
      const newMaterial = await pool.query(`
        INSERT INTO materials (category_id, title, description)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [categoryId, 'Test Material', 'Test']);
      
      var materialId = newMaterial.rows[0].id;
      console.log(`✅ Created test material: ${materialId}\n`);
    } else {
      var materialId = materialResult.rows[0].id;
      console.log(`✅ Using existing material: ${materialId}\n`);
    }

    // Test insert image
    console.log('📸 Inserting image content...');
    try {
      const imageInsert = await pool.query(`
        INSERT INTO material_contents (material_id, content_type, content, sequence)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [materialId, 'image', 'https://via.placeholder.com/300', 1]);
      
      console.log('✅ Image inserted successfully');
      console.log(`   Record:`, imageInsert.rows[0]);
    } catch (err) {
      console.log('❌ Image insert failed:', err.message);
    }

    // Test insert video
    console.log('\n🎥 Inserting video content...');
    try {
      const videoInsert = await pool.query(`
        INSERT INTO material_contents (material_id, content_type, content, sequence)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [materialId, 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2]);
      
      console.log('✅ Video inserted successfully');
      console.log(`   Record:`, videoInsert.rows[0]);
    } catch (err) {
      console.log('❌ Video insert failed:', err.message);
    }

    // Test insert text block
    console.log('\n📝 Inserting text block...');
    try {
      const blockData = JSON.stringify({
        title: 'Introduction',
        paragraph: 'This is test content'
      });
      
      const blockInsert = await pool.query(`
        INSERT INTO material_contents (material_id, content_type, content, sequence)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [materialId, 'text', blockData, 3]);
      
      console.log('✅ Block inserted successfully');
      console.log(`   Record:`, blockInsert.rows[0]);
    } catch (err) {
      console.log('❌ Block insert failed:', err.message);
    }

    // Verify all were inserted
    console.log('\n✔️  Verifying inserted contents:');
    const verify = await pool.query(`
      SELECT id, content_type, sequence FROM material_contents 
      WHERE material_id = $1
      ORDER BY sequence
    `, [materialId]);
    
    console.log(`Found ${verify.rows.length} records:`);
    verify.rows.forEach(row => {
      console.log(`  - ${row.content_type} (seq: ${row.sequence})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

test();
