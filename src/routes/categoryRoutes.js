const router = require('express').Router();

const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

// ADMIN ONLY
router.post('/', auth, role('admin'), categoryController.createCategory);
router.put('/:id', auth, role('admin'), categoryController.updateCategory);
router.delete('/:id', auth, role('admin'), categoryController.deleteCategory);

// PUBLIC
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

module.exports = router;