const pool = require('../config/db');

exports.createContent = async ({ material_id, content_type, content, sequence }) => {
  const result = await pool.query(
    `INSERT INTO material_contents (material_id, content_type, content, sequence)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [material_id, content_type, content, sequence]
  );

  return result.rows[0];
};

exports.getContentsByMaterial = async (material_id) => {
  const result = await pool.query(
    `SELECT *
     FROM material_contents
     WHERE material_id = $1
     ORDER BY sequence ASC`,
    [material_id]
  );

  return result.rows;
};

exports.getContentById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM material_contents WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

exports.updateContent = async (id, { content_type, content, sequence }) => {
  const result = await pool.query(
    `UPDATE material_contents
     SET content_type = $1,
         content = $2,
         sequence = $3
     WHERE id = $4
     RETURNING *`,
    [content_type, content, sequence, id]
  );

  return result.rows[0];
};

exports.deleteContent = async (id) => {
  await pool.query(
    `DELETE FROM material_contents WHERE id = $1`,
    [id]
  );
};