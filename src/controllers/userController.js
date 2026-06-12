const userService = require('../services/userService');
const pool = require('../config/db');

exports.getProfile = async (req, res) => {
  const userId = req.user.userId;
  console.log('USER ID:', userId);

  const data = await userService.getUserById(userId);

  res.json(data);
};

exports.getAllUsers = async (req, res) => {
  console.log('Fetching all users');
  const data = await userService.getAllUsers();
  res.json(data);
};

//by id (admin)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id=$1',
      [id]
    );

    if (req.user.userId != id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// by id (admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // 🔍 cek email sudah dipakai user lain
    const check = await pool.query(
      'SELECT * FROM users WHERE email=$1 AND id != $2',
      [email, id]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    const result = await pool.query(
      'UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING id,name,email,role',
      [name, email, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// by id (admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM users WHERE id=$1 RETURNING id', [id]);

    if (req.user.userId != id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.userId;
  console.log('USER ID:', userId);

  const data = await userService.updateUser(userId, req.body);

  res.json(data);
};

exports.deleteAccount = async (req, res) => {
  const userId = req.user.userId;
  console.log('USER ID:', userId);

  await userService.deleteUser(userId);

  res.json({ message: 'Account deleted' });
};