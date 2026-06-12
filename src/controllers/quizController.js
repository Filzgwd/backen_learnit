const quizService = require('../services/quizService');

// CREATE QUIZ
exports.createQuiz = async (req, res) => {
  try {

    const data = req.body;

    const result = await quizService.createQuiz(data);

    res.status(201).json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// GET QUIZ BY CATEGORY
exports.getQuizByCategory = async (req, res) => {
  try {
    const result = await quizService.getQuizByCategory(req.params.categoryId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// CREATE QUESTION
exports.createQuestion = async (req, res) => {
  try {

    const data = req.body;

    const result = await quizService.createQuestion(data);

    res.status(201).json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// CREATE OPTION
exports.createOption = async (req, res) => {
  try {

    const data = req.body;

    const result = await quizService.createOption(data);

    res.status(201).json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// GET DETAIL QUIZ
exports.getQuizDetail = async (req, res) => {
  try {
    const result = await quizService.getQuizDetail(req.params.quizId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET ALL QUIZZES
exports.getAllQuiz = async (req, res) => {
  try {

    const result = await quizService.getAllQuiz();

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// SUBMIT QUIZ
exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await quizService.submitQuiz(userId, req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET RESULT
exports.getResults = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await quizService.getResults(userId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//UPDATE QUIZ
exports.updateQuiz = async (req, res) => {
  try {
    const result = await quizService.updateQuiz(
      req.params.id,
      req.body
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const result = await quizService.deleteQuiz(req.params.id);
    res.json({ message: 'Quiz berhasil dihapus', data: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//update question
exports.updateQuestion = async (req, res) => {
  try {
    const result = await quizService.updateQuestion(
      req.params.id,
      req.body
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//delete questions
exports.deleteQuestion = async (req, res) => {
  try {
    const result = await quizService.deleteQuestion(req.params.id);
    res.json({ message: 'Question berhasil dihapus', data: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//update option
exports.updateOption = async (req, res) => {
  try {
    const result = await quizService.updateOption(
      req.params.id,
      req.body
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//delete options
exports.deleteOption = async (req, res) => {
  try {
    const result = await quizService.deleteOption(req.params.id);
    res.json({ message: 'Option berhasil dihapus', data: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};