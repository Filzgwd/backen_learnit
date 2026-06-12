const router = require('express').Router();

const controller = require('../controllers/materialContentController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

// ADMIN
router.post('/', auth, role('admin'), controller.create);
router.put('/:id', auth, role('admin'), controller.update);
router.delete('/:id', auth, role('admin'), controller.delete);

// PUBLIC
router.get('/material/:materialId', controller.getByMaterial);
router.get('/:id', controller.getById);

module.exports = router;