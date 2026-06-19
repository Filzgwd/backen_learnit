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

  // single insert - map frontend fields to database fields
  const title = data.title || data.name || '';
  const description = data.description || data.desc || '';
  const category_id = data.category_id || null;
  const image = data.image || null;
  const videoLink = data.videoLink || null;
  const blocks = data.blocks || [];

  // Insert main material record
  const materialResult = await pool.query(`
    INSERT INTO materials (
      category_id,
      title,
      description
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `, [
    category_id,
    title,
    description
  ]);

  const material = materialResult.rows[0];
  let sequence = 1;

  // Insert image as material content if provided
  if (image && image.trim()) {
    await pool.query(`
      INSERT INTO material_contents (material_id, content_type, content, sequence)
      VALUES ($1, $2, $3, $4)
    `, [material.id, 'image', image, sequence++]);
  }

  // Insert video link as material content if provided
  if (videoLink && videoLink.trim()) {
    await pool.query(`
      INSERT INTO material_contents (material_id, content_type, content, sequence)
      VALUES ($1, $2, $3, $4)
    `, [material.id, 'video', videoLink, sequence++]);
  }

  // Insert blocks as material content
  for (const block of blocks) {
    if (block.title) {
      await pool.query(`
        INSERT INTO material_contents (material_id, content_type, content, sequence)
        VALUES ($1, $2, $3, $4)
      `, [material.id, 'text', JSON.stringify(block), sequence++]);
    }
  }

  // Fetch the complete material with category info and contents
  const completeResult = await pool.query(`
    SELECT m.*, c.name AS category_name FROM materials m
    LEFT JOIN categories c ON m.category_id = c.id
    WHERE m.id = $1
  `, [material.id]);

  const completeMaterial = completeResult.rows[0];

  // Fetch contents
  const contentsResult = await pool.query(`
    SELECT * FROM material_contents WHERE material_id = $1 ORDER BY sequence
  `, [material.id]);

  const contents = contentsResult.rows;

  // Reconstruct the response with all original data
  return {
    ...completeMaterial,
    image,
    videoLink,
    blocks,
    contents
  };
};

// get all materials
exports.getAllMaterials = async () => {
  const materialsResult = await pool.query(
    `SELECT m.*, c.name AS category_name
     FROM materials m
     LEFT JOIN categories c ON m.category_id = c.id
     ORDER BY m.created_at DESC`
  );

  const materials = materialsResult.rows;

  // Fetch contents for each material
  for (const material of materials) {
    const contentsResult = await pool.query(
      `SELECT * FROM material_contents WHERE material_id = $1 ORDER BY sequence`,
      [material.id]
    );

    const contents = contentsResult.rows;

    // Reconstruct image, videoLink, and blocks from contents
    let image = null;
    let videoLink = null;
    const blocks = [];

    for (const content of contents) {
      if (content.content_type === 'image') {
        image = content.content;
      } else if (content.content_type === 'video') {
        videoLink = content.content;
      } else if (content.content_type === 'text') {
        blocks.push(JSON.parse(content.content));
      }
    }

    material.image = image;
    material.videoLink = videoLink;
    material.blocks = blocks;
  }

  return materials;
};

// get material by id
exports.getMaterialById = async (id) => {
  const result = await pool.query(
    `SELECT m.*, c.name AS category_name
     FROM materials m
     LEFT JOIN categories c ON m.category_id = c.id
     WHERE m.id = $1`,
    [id]
  );

  const material = result.rows[0];
  if (!material) return null;

  // Fetch contents
  const contentsResult = await pool.query(
    `SELECT * FROM material_contents WHERE material_id = $1 ORDER BY sequence`,
    [id]
  );

  const contents = contentsResult.rows;

  // Reconstruct image, videoLink, and blocks from contents
  let image = null;
  let videoLink = null;
  const blocks = [];

  for (const content of contents) {
    if (content.content_type === 'image') {
      image = content.content;
    } else if (content.content_type === 'video') {
      videoLink = content.content;
    } else if (content.content_type === 'text') {
      blocks.push(JSON.parse(content.content));
    }
  }

  material.image = image;
  material.videoLink = videoLink;
  material.blocks = blocks;

  return material;
};

//update material
exports.updateMaterial = async (id, data) => {
  // Map frontend fields to database fields
  const title = data.title || data.name || '';
  const description = data.description || data.desc || '';
  const category_id = data.category_id || null;
  const image = data.image || null;
  const videoLink = data.videoLink || null;
  const blocks = data.blocks || [];

  // Update main material record
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

  const material = result.rows[0];

  // Delete old contents
  await pool.query(
    `DELETE FROM material_contents WHERE material_id = $1`,
    [id]
  );

  let sequence = 1;

  // Insert image as material content if provided
  if (image && image.trim()) {
    await pool.query(`
      INSERT INTO material_contents (material_id, content_type, content, sequence)
      VALUES ($1, $2, $3, $4)
    `, [id, 'image', image, sequence++]);
  }

  // Insert video link as material content if provided
  if (videoLink && videoLink.trim()) {
    await pool.query(`
      INSERT INTO material_contents (material_id, content_type, content, sequence)
      VALUES ($1, $2, $3, $4)
    `, [id, 'video', videoLink, sequence++]);
  }

  // Insert blocks as material content
  for (const block of blocks) {
    if (block.title) {
      await pool.query(`
        INSERT INTO material_contents (material_id, content_type, content, sequence)
        VALUES ($1, $2, $3, $4)
      `, [id, 'text', JSON.stringify(block), sequence++]);
    }
  }

  // Fetch updated material with all data
  return module.exports.getMaterialById(id);
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