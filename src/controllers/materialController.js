const materialService = require('../services/materialService');

// CREATE MATERIAL
exports.createMaterial = async (req, res) => {
  try {

    const data = req.body;

    const result = await materialService.createMaterial(data);

    res.status(201).json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
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
    const { title, description, category_id } = req.body;

    const result = await materialService.updateMaterial(
      req.params.id,
      { title, description, category_id }
    );

    res.json(result);
  } catch (err) {
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