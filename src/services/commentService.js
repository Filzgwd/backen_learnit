const pool = require("../config/db");

exports.createComment = async (data) => {

  const result = await pool.query(`
    INSERT INTO comments (
      post_id,
      user_id,
      content
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `, [
    data.post_id,
    data.user_id,
    data.content
  ]);

  return result.rows[0];
};

exports.getCommentsByPost = async (post_id) => {

  const result = await pool.query(`
    SELECT 
      c.*,
      u.name AS user_name

    FROM comments c

    JOIN users u
      ON c.user_id = u.id

    WHERE c.post_id = $1

    ORDER BY c.created_at ASC
  `, [post_id]);

  return result.rows;
};

exports.getCommentById = async (id) => {

  const result = await pool.query(`
    SELECT 
      c.*,
      u.name AS user_name
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = $1
  `, [id]);

  return result.rows[0];
};

exports.updateComment = async (id, user, content) => {

  const result = await pool.query(`
    UPDATE comments
    SET content = $3
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `, [id, user.id || user.userId, content]);

  return result.rows[0];
};

exports.deleteComment = async (
  id,
  user_id
) => {

  const result = await pool.query(`
    DELETE FROM comments
    WHERE id = $1
    AND user_id = $2
    RETURNING *
  `, [id, user_id]);

  return result.rows[0];
};