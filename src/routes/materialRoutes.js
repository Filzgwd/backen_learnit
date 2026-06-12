const router = require('express').Router();

const materialController = require('../controllers/materialController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

// ADMIN
router.post('/', auth, role('admin'), materialController.createMaterial);
router.put('/:id', auth, role('admin'), materialController.updateMaterial);
router.delete('/:id', auth, role('admin'), materialController.deleteMaterial);

// PUBLIC
router.get('/', materialController.getAllMaterials);
router.get('/search', materialController.searchMaterials);
router.get('/:id', materialController.getMaterialById);

module.exports = router;