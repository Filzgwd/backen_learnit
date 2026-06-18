#!/usr/bin/env node
/**
 * Script untuk hapus semua materials dari database
 * Run: node deleteAllMaterials.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function deleteAllMaterials() {
  console.log('🗑️  DELETING ALL MATERIALS\n');
  console.log('='.repeat(60));

  try {
    // Check berapa materials ada
    const checkResult = await pool.query('SELECT COUNT(*) as count FROM materials');
    const count = checkResult.rows[0].count;

    console.log(`📊 Materials saat ini: ${count}`);

    if (count === 0) {
      console.log('✅ Tidak ada materials yang perlu dihapus\n');
      await pool.end();
      process.exit(0);
    }

    // Show materials yang akan dihapus
    console.log('\n📋 Materials yang akan dihapus:');
    const materialsResult = await pool.query(
      'SELECT id, title FROM materials ORDER BY created_at DESC'
    );
    
    materialsResult.rows.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.title} (${m.id})`);
    });

    console.log('\n⚠️  Perhatian:');
    console.log('   - Data akan dihapus PERMANENT');
    console.log('   - Related data (content, progress, dll) akan terhapus CASCADE');
    console.log('   - TIDAK BISA DI-UNDO\n');

    // Confirm deletion
    console.log('='.repeat(60));
    console.log('Jalankan dengan argument --confirm untuk hapus');
    console.log('Contoh: node deleteAllMaterials.js --confirm\n');
    
    if (process.argv[2] === '--confirm') {
      console.log('🔄 Menghapus materials...\n');

      // Delete all materials
      const deleteResult = await pool.query('DELETE FROM materials');
      
      console.log(`✅ DELETED: ${deleteResult.rowCount} materials berhasil dihapus`);

      // Verify deletion
      const verifyResult = await pool.query('SELECT COUNT(*) as count FROM materials');
      const remainingCount = verifyResult.rows[0].count;

      console.log(`✅ Verification: ${remainingCount} materials tersisa\n`);

      if (remainingCount === 0) {
        console.log('✅ SUCCESS - Semua materials telah dihapus!\n');
      }
    } else {
      console.log('Ketik command di atas untuk hapus, atau cancel dengan Ctrl+C\n');
    }

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

deleteAllMaterials();
