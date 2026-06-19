const pool = require('../config/db');

// create material
exports.createMaterial = async (data) => {
  console.log('[createMaterial] Received data:', JSON.stringify({
    title: data.title || data.name,
    category_id: data.category_id,
    hasImage: !!data.image,
    hasVideoLink: !!data.videoLink,
    blocksCount: (data.blocks || []).length,
    blocksTitles: (data.blocks || []).map(b => b.title || '(empty)').join(', ')
  }, null, 2));

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
  console.log(`[createMaterial] Created material ${material.id}: ${title}`);

  let sequence = 1;

  // Insert image as material content if provided
  if (image && image.trim()) {
    await pool.query(`
      INSERT INTO material_contents (material_id, content_type, content, sequence)
      VALUES ($1, $2, $3, $4)
    `, [material.id, 'image', image, sequence++]);
    console.log(`[createMaterial] Stored image for material ${material.id}`);
  } else {
    console.log(`[createMaterial] Skipped image (empty or null)`);
  }

  // Insert video link as material content if provided
  if (videoLink && videoLink.trim()) {
    await pool.query(`
      INSERT INTO material_contents (material_id, content_type, content, sequence)
      VALUES ($1, $2, $3, $4)
    `, [material.id, 'video', videoLink, sequence++]);
    console.log(`[createMaterial] Stored video link for material ${material.id}`);
  } else {
    console.log(`[createMaterial] Skipped video (empty or null)`);
  }

  // Insert blocks as material content
  let blocksStored = 0;
  console.log(`[createMaterial] Processing ${blocks.length} blocks...`);
  
  for (const block of blocks) {
    // Store block even if title is empty - just skip completely empty blocks
    const hasContent = block.title || block.paragraph || block.example || block.list || block.image;
    
    if (hasContent) {
      await pool.query(`
        INSERT INTO material_contents (material_id, content_type, content, sequence)
        VALUES ($1, $2, $3, $4)
      `, [material.id, 'text', JSON.stringify(block), sequence++]);
      blocksStored++;
      console.log(`[createMaterial] Stored block: title="${block.title || '(empty)'}" for material ${material.id}`);
    } else {
      console.log(`[createMaterial] Skipped completely empty block for material ${material.id}`);
    }
  }
  console.log(`[createMaterial] Total blocks stored: ${blocksStored}/${blocks.length}`);

  // Fetch the complete material with category info and contents
  const completeResult = await pool.query(`
    SELECT m.*, c.name AS category_name FROM materials m
    LEFT JOIN categories c ON m.category_id = c.id
    WHERE m.id = $1
  `, [material.id]);

  const completeMaterial = completeResult.rows[0];

  // Fetch contents from database to verify they were stored
  const contentsResult = await pool.query(`
    SELECT * FROM material_contents WHERE material_id = $1 ORDER BY sequence
  `, [material.id]);

  const contents = contentsResult.rows;
  
  console.log(`[createMaterial] Final response - material ${material.id}:`);
  console.log(`  - Stored blocks count: ${blocksStored}`);
  console.log(`  - DB contents count: ${contents.length}`);
  console.log(`  - Original blocks count: ${blocks.length}`);
  console.log(`  - Contents from DB:`, contents.map(c => ({ type: c.content_type, seq: c.sequence })));

  // Reconstruct the response with all original data
  const responseData = {
    ...completeMaterial,
    image,
    videoLink,
    blocks,
    contents
  };
  
  console.log(`[createMaterial] Returning response with blocks:`, responseData.blocks?.length || 0);
  return responseData;
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
    console.log(`[getAllMaterials] Material ${material.id}: ${contents.length} contents found`);

    // Reconstruct image, videoLink, and blocks from contents
    let image = null;
    let videoLink = null;
    const blocks = [];

    for (const content of contents) {
      try {
        if (content.content_type === 'image') {
          image = content.content;
        } else if (content.content_type === 'video') {
          videoLink = content.content;
        } else if (content.content_type === 'text') {
          const blockData = JSON.parse(content.content);
          blocks.push(blockData);
          console.log(`[getAllMaterials] Parsed block: ${blockData.title}`);
        }
      } catch (error) {
        console.error(`[getAllMaterials] Error parsing content: ${error.message}`, content);
      }
    }

    material.image = image;
    material.videoLink = videoLink;
    material.blocks = blocks;
    console.log(`[getAllMaterials] Material ${material.title}: ${blocks.length} blocks loaded`);
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
  console.log(`[getMaterialById] Material ${id}: ${contents.length} contents found`);

  // Reconstruct image, videoLink, and blocks from contents
  let image = null;
  let videoLink = null;
  const blocks = [];

  for (const content of contents) {
    try {
      if (content.content_type === 'image') {
        image = content.content;
      } else if (content.content_type === 'video') {
        videoLink = content.content;
      } else if (content.content_type === 'text') {
        const blockData = JSON.parse(content.content);
        blocks.push(blockData);
        console.log(`[getMaterialById] Parsed block: ${blockData.title}`);
      }
    } catch (error) {
      console.error(`[getMaterialById] Error parsing content: ${error.message}`, content);
    }
  }

  material.image = image;
  material.videoLink = videoLink;
  material.blocks = blocks;
  console.log(`[getMaterialById] Material ${material.title}: ${blocks.length} blocks loaded`);

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