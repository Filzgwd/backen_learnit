const materialService = require('../services/materialService');

// CREATE MATERIAL
exports.createMaterial = async (req, res) => {
  try {
    const data = req.body;
    console.log('[CREATE_MATERIAL] Request body received:', {
      title: data.title || data.name,
      hasBlocks: !!data.blocks,
      blocksCount: (data.blocks || []).length
    });

    const result = await materialService.createMaterial(data);
    console.log('[CREATE_MATERIAL] Service returned successfully:', {
      id: result.id,
      title: result.title,
      hasBlocks: !!result.blocks,
      blocksCount: result.blocks?.length || 0,
      hasContents: !!result.contents,
      contentsCount: result.contents?.length || 0
    });

    res.status(201).json(result);

  } catch (error) {
    console.error('[CREATE_MATERIAL] Error caught:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack.split('\n').slice(0, 5).join('\n')
    });
    res.status(500).json({
      message: error.message,
      error: error.detail || error.code
    });

  }
};

// GET ALL MATERIALS
exports.getAllMaterials = async (req, res) => {
  try {
    const result = await materialService.getAllMaterials();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MATERIAL BY ID
exports.getMaterialById = async (req, res) => {
  try {
    const result = await materialService.getMaterialById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Materi tidak ditemukan' });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  UPDATE MATERIAL
exports.updateMaterial = async (req, res) => {
  try {
    const data = req.body;
    console.log('[UPDATE_MATERIAL] Request body:', data);

    const result = await materialService.updateMaterial(req.params.id, data);
    console.log('[UPDATE_MATERIAL] Updated material:', result);

    res.json(result);
  } catch (err) {
    console.error('[UPDATE_MATERIAL] Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// DELETE MATERIAL
exports.deleteMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;
    const userId = req.user?.id;
    
    console.log('[DELETE_MATERIAL] Request:', {
      materialId,
      userId,
      timestamp: new Date().toISOString(),
    });

    const result = await materialService.deleteMaterial(materialId);
    
    console.log('[DELETE_MATERIAL] Success:', result);
    res.json(result);
  } catch (err) {
    console.error('[DELETE_MATERIAL] Error:', {
      error: err.message,
      code: err.code,
      materialId: req.params.id,
      stack: err.stack,
    });
    
    res.status(500).json({ 
      message: err.message || 'Gagal menghapus materi'
    });
  }
};

// search materials by title or description
exports.searchMaterials = async (req, res) => {
  try {
    const { keyword } = req.query;

    const result = await materialService.searchMaterials(keyword);

    res.json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};