const pool = require('../config/db');

// create material
exports.createMaterial = async (data) => {

  // bulk insert
  if (Array.isArray(data)) {

    const results = [];

    for (const item of data) {

      const result = await pool.query(`
        INSERT INTO materials (
          category_id,
          title,
          description
        )
        VALUES ($1, $2, $3)
        RETURNING *
      `, [
        item.category_id,
        item.title,
        item.description
      ]);

      results.push(result.rows[0]);
    }

    return results;
  }

  // single insert
  const result = await pool.query(`
    INSERT INTO materials (
      category_id,
      title,
      description
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `, [
    data.category_id,
    data.title,
    data.description
  ]);

  return result.rows[0];
};

// get all materials
exports.getAllMaterials = async () => {
  const result = await pool.query(
    `SELECT m.*, c.name AS category_name
     FROM materials m
     JOIN categories c ON m.category_id = c.id`
  );
  return result.rows;
};

// get material by id
exports.getMaterialById = async (id) => {
  const result = await pool.query(
    `SELECT m.*, c.name AS category_name
     FROM materials m
     JOIN categories c ON m.category_id = c.id
     WHERE m.id = $1`,
    [id]
  );

  return result.rows[0];
};

//update material
exports.updateMaterial = async (id, { title, description, category_id }) => {
  const result = await pool.query(
    `UPDATE materials
     SET title = $1,
         description = $2,
         category_id = $3,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [title, description, category_id, id]
  );

  return result.rows[0];
};

//delete material
exports.deleteMaterial = async (id) => {
  await pool.query(
    'DELETE FROM materials WHERE id = $1',
    [id]
  );
};

// search materials by title or description
exports.searchMaterials = async (keyword) => {
  const result = await pool.query(
    `SELECT * FROM materials
     WHERE title ILIKE $1
     OR description ILIKE $1`,
    [`%${keyword}%`]
  );

  return result.rows;
};