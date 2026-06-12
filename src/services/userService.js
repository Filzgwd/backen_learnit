const pool = require('../config/db');
const bcrypt = require('bcrypt');

// GET BY ID
exports.getUserById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [id]
  );

  return result.rows[0];
};

// GET ALL (ADMIN)
exports.getAllUsers = async () => {
  const result = await pool.query(
    'SELECT id, name, email, role FROM users'
  );

  return result.rows;
};

// UPDATE
exports.updateUser = async (userId, { name, email, password }) => {
  let hashedPassword = null;

  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const result = await pool.query(
    `UPDATE users
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         password = COALESCE($3, password)
     WHERE id = $4
     RETURNING id, name, email`,
    [name, email, hashedPassword, userId]
  );

  return result.rows[0];
};

// DELETE
exports.deleteUser = async (userId) => {
  await pool.query(
    'DELETE FROM users WHERE id = $1',
    [userId]
  );
};