const router = require('express').Router();

const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

// READ profile sendiri
router.get('/profile', auth, userController.getProfile);
// READ by ID
router.get('/:id', auth, userController.getUserById);

// READ semua user (admin)
router.get('/', auth, role('admin'), userController.getAllUsers);

// UPDATE
router.put('/profile', auth, userController.updateProfile);
// UPDATE by ID
router.put('/:id', auth, userController.updateUser);

// DELETE
router.delete('/profile', auth, userController.deleteAccount);
// DELETE by ID
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;