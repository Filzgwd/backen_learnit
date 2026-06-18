require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

const resetAdminPassword = async () => {
  try {
    const newPassword = 'Admin123'; // Ubah ke password yang Anda mau
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('Password baru:', newPassword);
    console.log('Hash bcrypt:', hashedPassword);
    
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, name, role',
      [hashedPassword, 'admin@gmail.com']
    );
    
    if (result.rows.length > 0) {
      console.log('✓ Password admin berhasil diupdate:');
      console.log(result.rows[0]);
    } else {
      console.log('✗ Akun admin tidak ditemukan');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();
