const categoryService = require('../services/categoryService');

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {

    const data = req.body;

    const result = await categoryService.createCategory(data);

    res.status(201).json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// GET ALL CATEGORIES
exports.getAllCategories = async (req, res) => {
  try {
    const result = await categoryService.getAllCategories();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CATEGORY BY ID
exports.getCategoryById = async (req, res) => {
  try {
    const result = await categoryService.getCategoryById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    const result = await categoryService.updateCategory(
      req.params.id,
      { name, description, image_url }
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};