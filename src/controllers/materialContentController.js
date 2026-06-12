const service = require('../services/materialContentService');

exports.create = async (req, res) => {
  try {
    const { material_id, content_type, content, sequence } = req.body;

    if (!material_id || !content_type || !content) {
      return res.status(400).json({
        message: 'Field wajib: material_id, content_type, content'
      });
    }

    const result = await service.createContent({
      material_id,
      content_type,
      content,
      sequence
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByMaterial = async (req, res) => {
  try {
    const result = await service.getContentsByMaterial(req.params.materialId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await service.getContentById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Konten tidak ditemukan' });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await service.updateContent(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await service.deleteContent(req.params.id);
    res.json({ message: 'Konten berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};