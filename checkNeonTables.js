#!/usr/bin/env node
/**
 * Check database tables and verify they exist
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkDatabaseTables() {
  console.log('🔍 Checking Neon Database Tables\n');
  console.log('='.repeat(70));

  try {
    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows.map(row => row.table_name);

    console.log(`\n📊 Total tables: ${tables.length}\n`);
    console.log('Tables in database:');
    tables.forEach(table => {
      console.log(`  ✓ ${table}`);
    });

    // Expected tables
    const expectedTables = [
      'users',
      'categories',
      'materials',
      'material_contents',
      'quizzes',
      'questions',
      'options',
      'quiz_results',
      'user_answers',
      'forum_posts',
      'comments',
      'user_progress'
    ];

    console.log('\n📋 Expected tables:');
    expectedTables.forEach(expectedTable => {
      const exists = tables.includes(expectedTable);
      console.log(`  ${exists ? '✅' : '❌'} ${expectedTable}`);
    });

    // Missing tables
    const missingTables = expectedTables.filter(t => !tables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('\n🚨 MISSING TABLES:');
      missingTables.forEach(table => {
        console.log(`  ❌ ${table}`);
      });
      console.log('\n⚠️  Need to run database schema setup!');
    } else {
      console.log('\n✅ All expected tables exist!');
    }

    // Check table contents
    console.log('\n📈 Table row counts:');
    for (const table of tables) {
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = countResult.rows[0].count;
      console.log(`  ${table}: ${count} rows`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkDatabaseTables();
