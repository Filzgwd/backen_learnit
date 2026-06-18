#!/usr/bin/env node
/**
 * Check database schema and constraints that might prevent deletion
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkSchema() {
  console.log('🔍 Checking Database Schema for materials...\n');
  
  try {
    // Check materials table
    console.log('📋 Materials table columns:');
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'materials'
      ORDER BY ordinal_position;
    `);
    
    console.table(columnsResult.rows);

    // Check constraints
    console.log('\n🔐 Foreign Key Constraints referencing materials:');
    const constraintsResult = await pool.query(`
      SELECT
        t1.relname as table_name,
        a1.attname as column_name,
        t2.relname as referenced_table,
        a2.attname as referenced_column
      FROM pg_constraint c
      JOIN pg_class t1 ON c.conrelid = t1.oid
      JOIN pg_class t2 ON c.confrelid = t2.oid
      JOIN pg_attribute a1 ON a1.attrelid = t1.oid AND a1.attnum = c.conkey[1]
      JOIN pg_attribute a2 ON a2.attrelid = t2.oid AND a2.attnum = c.confkey[1]
      WHERE c.contype = 'f' AND t2.relname = 'materials'
      ORDER BY t1.relname;
    `);
    
    if (constraintsResult.rows.length === 0) {
      console.log('(No foreign key constraints found)');
    } else {
      console.table(constraintsResult.rows);
    }

    // Check actual data
    console.log('\n📊 Materials data:');
    const materialsResult = await pool.query('SELECT id, title FROM materials LIMIT 5;');
    
    if (materialsResult.rows.length === 0) {
      console.log('(No materials found)');
    } else {
      console.table(materialsResult.rows);
    }

    // Check if any material has references
    if (materialsResult.rows.length > 0) {
      const firstMaterialId = materialsResult.rows[0].id;
      console.log(`\n🔗 Checking references for material: ${firstMaterialId}`);
      
      const userProgressResult = await pool.query(
        'SELECT COUNT(*) as count FROM user_progress WHERE material_id = $1',
        [firstMaterialId]
      );
      console.log(`  - user_progress records: ${userProgressResult.rows[0].count}`);

      const contentResult = await pool.query(
        'SELECT COUNT(*) as count FROM material_contents WHERE material_id = $1',
        [firstMaterialId]
      );
      console.log(`  - material_contents records: ${contentResult.rows[0].count}`);

      // Check quizzes (in case it still has material_id)
      try {
        const quizzesResult = await pool.query(
          'SELECT COUNT(*) as count FROM quizzes WHERE material_id = $1',
          [firstMaterialId]
        );
        console.log(`  - quizzes records: ${quizzesResult.rows[0].count}`);
      } catch (e) {
        console.log(`  - quizzes records: (column does not exist - OK)`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkSchema();
