const pool = require('../config/db');
const bcrypt = require('bcrypt');

// GET BY ID
exports.getUserById = async (id) => {
  const result = await pool.query(
    `WITH best_quiz_scores AS (
       SELECT user_id, quiz_id, MAX(score) AS score
       FROM quiz_results
       WHERE user_id = $1
       GROUP BY user_id, quiz_id
     )
     SELECT 
       u.id,
       u.name,
       u.email,
       u.role,
       COALESCE(qs.quiz_dikerjakan, 0)::int AS quiz_dikerjakan,
       COALESCE(qs.total_poin, 0)::int AS total_poin,
       COALESCE(tq.total_quizzes, 0)::int AS total_quizzes
     FROM users u
     LEFT JOIN (
       SELECT 
         user_id,
         COUNT(*) AS quiz_dikerjakan,
         SUM(score) AS total_poin
       FROM best_quiz_scores
       GROUP BY user_id
     ) qs ON qs.user_id = u.id
     CROSS JOIN (
       SELECT COUNT(*) AS total_quizzes FROM quizzes
     ) tq
     WHERE u.id = $1`,
    [id]
  );

  const user = result.rows[0];
  if (!user) return null;

  return {
    ...user,
    quizDikerjakan: user.quiz_dikerjakan,
    totalPoin: user.total_poin,
    totalPoints: user.total_poin,
    totalQuizzes: user.total_quizzes,
  };
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
