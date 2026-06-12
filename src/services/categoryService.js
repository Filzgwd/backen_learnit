const pool = require('../config/db');

// CREATE CATEGORY
exports.createCategory = async (data) => {

  // bulk insert
  if (Array.isArray(data)) {

    const results = [];

    for (const item of data) {

      const result = await pool.query(`
        INSERT INTO categories (
          name,
          description,
          image_url
        )
        VALUES ($1, $2, $3)
        RETURNING *
      `, [
        item.name,
        item.description,
        item.image_url
      ]);

      results.push(result.rows[0]);
    }

    return results;
  }

  // single insert
  const result = await pool.query(`
    INSERT INTO categories (
      name,
      description,
      image_url
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `, [
    data.name,
    data.description,
    data.image_url
  ]);

  return result.rows[0];
};

// GET ALL CATEGORIES
exports.getAllCategories = async () => {
  const result = await pool.query(
    `SELECT * FROM categories ORDER BY created_at DESC`
  );
  return result.rows;
};

// GET CATEGORY BY ID
exports.getCategoryById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM categories WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

// UPDATE CATEGORY
exports.updateCategory = async (id, { name, description, image_url }) => {
  const result = await pool.query(
    `UPDATE categories
     SET name = $1,
         description = $2,
         image_url = $3
     WHERE id = $4
     RETURNING *`,
    [name, description, image_url, id]
  );
  return result.rows[0];
};

// DELETE CATEGORY
exports.deleteCategory = async (id) => {
  await pool.query(
    `DELETE FROM categories WHERE id = $1`,
    [id]
  );
};