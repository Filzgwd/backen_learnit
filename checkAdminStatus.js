#!/usr/bin/env node
require('dotenv').config();
const pool = require('./src/config/db');

const checkAdminStatus = async () => {
  try {
    console.log('🔍 Checking Admin User Status...\n');

    // Check 1: Admin user exists?
    const userCheck = await pool.query(
      'SELECT id, name, email, role, provider FROM users WHERE email = $1',
      ['admin@gmail.com']
    );

    if (userCheck.rows.length === 0) {
      console.log('❌ Admin user NOT found!');
      console.log('   Email: admin@gmail.com not in database\n');
    } else {
      const admin = userCheck.rows[0];
      console.log('✅ Admin user found:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Provider: ${admin.provider}\n`);

      if (admin.role !== 'admin') {
        console.log(`⚠️  WARNING: Role is "${admin.role}", should be "admin"\n`);
      }
    }

    // Check 2: JWT_SECRET configured?
    const jwtSecret = process.env.JWT_SECRET;
    console.log('🔑 JWT_SECRET Status:');
    if (jwtSecret) {
      console.log(`   ✅ JWT_SECRET is set (length: ${jwtSecret.length} chars)`);
    } else {
      console.log('   ⚠️  JWT_SECRET not set in .env - using fallback "secret"');
      console.log('   ℹ️  This may cause issues if not consistent\n');
    }

    // Check 3: All users
    const allUsers = await pool.query(
      'SELECT name, email, role FROM users ORDER BY created_at'
    );
    console.log(`📋 Total users: ${allUsers.rows.length}`);
    console.log('   Users in database:');
    allUsers.rows.forEach(u => {
      console.log(`   - ${u.email} (${u.name}) [role: ${u.role}]`);
    });

    console.log('\n✅ Check complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAdminStatus();
