#!/usr/bin/env node
/**
 * Quick check for material_contents table
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function check() {
  try {
    // Check if material_contents table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'material_contents'
      )
    `);
    
    console.log('Checking material_contents table...');
    
    if (result.rows[0].exists) {
      console.log('✅ material_contents table EXISTS\n');
      
      // Get table structure
      const schema = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'material_contents'
        ORDER BY ordinal_position
      `);
      
      console.log('Table structure:');
      schema.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
      
      // Check contents
      const count = await pool.query(`SELECT COUNT(*) as cnt FROM material_contents`);
      console.log(`\nTotal records: ${count.rows[0].cnt}`);
      
    } else {
      console.log('❌ material_contents table DOES NOT EXIST!\n');
      console.log('This is the problem! The table needs to be created.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

check();
