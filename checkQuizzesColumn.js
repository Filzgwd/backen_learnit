#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'quizzes'
      ORDER BY ordinal_position;
    `);
    console.log('📋 Quizzes table columns:');
    console.table(result.rows);
    
    // Check if material_id exists
    const hasMaterialId = result.rows.some(r => r.column_name === 'material_id');
    if (hasMaterialId) {
      console.log('\n⚠️  WARNING: quizzes table STILL HAS material_id column!');
      console.log('   This could cause foreign key constraint errors when deleting materials');
    } else {
      console.log('\n✅ Good: quizzes table does NOT have material_id column');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
})();
