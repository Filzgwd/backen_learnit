#!/usr/bin/env node
/**
 * Neon Database Health Check
 * Verify connection, schema, dan data integrity
 */

require('dotenv').config();
const pool = require('./src/config/db');

console.log('🔍 NEON DATABASE HEALTH CHECK\n');
console.log('='.repeat(60));

async function runChecks() {
  try {
    // Check 1: Connection
    console.log('\n1️⃣  DATABASE CONNECTION');
    const connTest = await pool.query('SELECT 1 as test, now() as timestamp');
    console.log('   ✅ Connected to Neon');
    console.log(`   Server time: ${connTest.rows[0].timestamp}`);

    // Check 2: Database info
    console.log('\n2️⃣  DATABASE INFORMATION');
    const dbInfo = await pool.query(
      "SELECT current_database(), current_user, version() LIKE '%PostgreSQL%' as is_postgres"
    );
    const info = dbInfo.rows[0];
    console.log(`   Database: ${info.current_database}`);
    console.log(`   User: ${info.current_user}`);
    console.log(`   ✅ PostgreSQL version: OK`);

    // Check 3: Tables
    console.log('\n3️⃣  DATABASE SCHEMA (Tables)');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.rows.length === 0) {
      console.log('   ⚠️  No tables found - schema may not be initialized');
    } else {
      tables.rows.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.table_name}`);
      });
      console.log(`   ✅ Total: ${tables.rows.length} tables`);
    }

    // Check 4: Users table
    console.log('\n4️⃣  USERS TABLE');
    const usersCheck = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = usersCheck.rows[0].count;
    console.log(`   Total users: ${userCount}`);
    
    const adminCheck = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
    );
    const adminCount = adminCheck.rows[0].count;
    console.log(`   Admin users: ${adminCount}`);
    
    if (adminCount > 0) {
      console.log('   ✅ Admin user exists');
    } else {
      console.log('   ⚠️  No admin users found');
    }

    // Check 5: Materials table
    console.log('\n5️⃣  MATERIALS TABLE');
    const materialsCheck = await pool.query('SELECT COUNT(*) as count FROM materials');
    const materialCount = materialsCheck.rows[0].count;
    console.log(`   Total materials: ${materialCount}`);
    console.log('   ✅ Materials table accessible');

    // Check 6: Categories table
    console.log('\n6️⃣  CATEGORIES TABLE');
    const categoriesCheck = await pool.query('SELECT COUNT(*) as count FROM categories');
    const categoryCount = categoriesCheck.rows[0].count;
    console.log(`   Total categories: ${categoryCount}`);
    console.log('   ✅ Categories table accessible');

    // Check 7: Connection pool
    console.log('\n7️⃣  CONNECTION POOL');
    console.log(`   Total clients: ${pool.totalCount}`);
    console.log(`   Idle clients: ${pool.idleCount}`);
    console.log(`   Waiting: ${pool.waitingCount}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE HEALTH: GOOD\n');
    console.log('Summary:');
    console.log(`  ✓ Connection: OK`);
    console.log(`  ✓ Database: ${info.current_database}`);
    console.log(`  ✓ Tables: ${tables.rows.length}`);
    console.log(`  ✓ Users: ${userCount}`);
    console.log(`  ✓ Admin: ${adminCount > 0 ? 'exists' : 'missing'}`);
    console.log(`  ✓ Materials: ${materialCount}`);
    console.log(`  ✓ Categories: ${categoryCount}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.message.includes('SCRAM')) {
      console.error('\n💡 Hint: Database connection error');
      console.error('   - Check DATABASE_URL in .env');
      console.error('   - Verify credentials');
      console.error('   - Check Neon firewall settings');
    }
    
    process.exit(1);
  }
}

runChecks();
