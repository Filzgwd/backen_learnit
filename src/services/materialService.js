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
  try {
    const result = await pool.query(
      'DELETE FROM materials WHERE id = $1',
      [id]
    );
    
    if (result.rowCount === 0) {
      throw new Error(`Material dengan ID ${id} tidak ditemukan atau sudah dihapus`);
    }
    
    return { success: true, message: 'Materi berhasil dihapus' };
  } catch (error) {
    // Log detailed error for debugging
    console.error('[DELETE_MATERIAL_ERROR]', {
      materialId: id,
      errorName: error.name,
      errorCode: error.code,
      errorMessage: error.message,
    });
    
    // Handle specific database errors
    if (error.code === '23503') {
      // Foreign key constraint violation
      throw new Error(`Materi tidak bisa dihapus karena masih digunakan di data lain (quiz, progress, dll)`);
    }
    
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error(`Duplikat data - harap refresh dan coba lagi`);
    }
    
    // Re-throw other errors
    throw error;
  }
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