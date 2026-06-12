const router = require('express').Router();
const controller = require('../controllers/quizController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

// QUIZ
router.post('/', auth, role("admin"), controller.createQuiz);
router.put('/:id', auth, role("admin"), controller.updateQuiz);
router.delete('/:id', auth, role("admin"), controller.deleteQuiz);
router.get('/category/:categoryId', auth, controller.getQuizByCategory);

// QUESTIONS
router.post('/question', auth, role("admin"), controller.createQuestion);
router.put('/question/:id', auth, role("admin"), controller.updateQuestion);
router.delete('/question/:id', auth, role("admin"), controller.deleteQuestion);

// OPTIONS
router.post('/option', auth, role("admin"), controller.createOption);
router.put('/option/:id', auth, role("admin"), controller.updateOption);
router.delete('/option/:id', auth, role("admin"), controller.deleteOption);

// DETAIL QUIZ
router.get('/', auth, controller.getAllQuiz);
router.get('/:quizId', auth, controller.getQuizDetail);

// SUBMIT
router.post('/submit', auth, controller.submitQuiz);

// RESULTS
router.get('/results/me', auth, controller.getResults);

module.exports = router;