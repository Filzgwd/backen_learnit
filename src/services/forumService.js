const pool = require("../config/db");

exports.createPost = async (data) => {

  const result = await pool.query(`
    INSERT INTO forum_posts (
      user_id,
      title,
      content
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `, [
    data.user_id,
    data.title,
    data.content
  ]);

  return result.rows[0];
};

exports.getAllPosts = async () => {

  const result = await pool.query(`
    SELECT 
      forum_posts.*,
      users.name AS user_name
    FROM forum_posts
    JOIN users
      ON forum_posts.user_id = users.id
    ORDER BY created_at DESC
  `);

  return result.rows;
};

exports.updatePost = async (post_id, data) => {

  const result = await pool.query(`
    UPDATE forum_posts
    SET title = $1, content = $2
    WHERE id = $3
    RETURNING *
  `, [
    data.title,
    data.content,
    post_id
  ]);

  return result.rows[0];
};

exports.deletePost = async (
  post_id,
  user
) => {

  // ambil post dulu
  const post = await pool.query(`
    SELECT *
    FROM forum_posts
    WHERE id = $1
  `, [post_id]);

  if (post.rows.length === 0) {

    throw new Error("Post not found");

  }

  const postData = post.rows[0];

  // cek permission
  if (
    user.role !== "admin" &&
    postData.user_id !== user.userId &&
    postData.user_id !== user.id
  ) {

    throw new Error("Forbidden");

  }

  // delete
  await pool.query(`
    DELETE FROM forum_posts
    WHERE id = $1
  `, [post_id]);

  return {
    message: "Post deleted successfully"
  };
};

exports.getPostsByUser = async (user_id) => {
  const result = await pool.query(`
    SELECT 
      forum_posts.*,
      users.name AS user_name
    FROM forum_posts
    JOIN users
      ON forum_posts.user_id = users.id
    WHERE forum_posts.user_id = $1
    ORDER BY created_at DESC
  `, [user_id]);

  return result.rows;
};
