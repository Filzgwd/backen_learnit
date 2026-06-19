const pool = require('../config/db');

// ================= QUIZ =================

// CREATE QUIZ
exports.createQuiz = async (data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const title = data.title;
    const category_id = data.category_id;
    const duration = data.duration || 10;
    const questions = data.questions || [];

    const quizResult = await client.query(`
      INSERT INTO quizzes (category_id, title, duration)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [category_id, title, duration]);

    const quiz = quizResult.rows[0];
    const quizQuestions = [];

    for (const q of questions) {
      const qResult = await client.query(`
        INSERT INTO questions (quiz_id, question)
        VALUES ($1, $2)
        RETURNING *
      `, [quiz.id, q.question || q.text]);

      const questionObj = qResult.rows[0];
      questionObj.options = [];

      const optionsList = q.options || [];
      for (const opt of optionsList) {
        const optResult = await client.query(`
          INSERT INTO options (question_id, option_text, is_correct)
          VALUES ($1, $2, $3)
          RETURNING *
        `, [questionObj.id, opt.option_text || opt.text, !!opt.is_correct]);

        questionObj.options.push(optResult.rows[0]);
      }

      quizQuestions.push(questionObj);
    }

    await client.query('COMMIT');
    return {
      ...quiz,
      questions: quizQuestions
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// GET QUIZ BY CATEGORY
exports.getQuizByCategory = async (categoryId) => {
  const result = await pool.query(
    `SELECT * FROM quizzes WHERE category_id = $1`,
    [categoryId]
  );

  return result.rows;
};

// ================= QUESTIONS =================

// CREATE QUESTION
exports.createQuestion = async (data) => {

  // kalau array → bulk insert
  if (Array.isArray(data)) {

    const results = [];

    for (const item of data) {

      const result = await pool.query(`
        INSERT INTO questions (
          quiz_id,
          question
        )
        VALUES ($1, $2)
        RETURNING *
      `, [item.quiz_id, item.question]);

      results.push(result.rows[0]);
    }

    return results;
  }

  // kalau object tunggal
  const result = await pool.query(`
    INSERT INTO questions (
      quiz_id,
      question
    )
    VALUES ($1, $2)
    RETURNING *
  `, [data.quiz_id, data.question]);

  return result.rows[0];
};

// ================= OPTIONS =================

// CREATE OPTION
exports.createOption = async (data) => {

  // bulk insert
  if (Array.isArray(data)) {

    const results = [];

    for (const item of data) {

      const result = await pool.query(`
        INSERT INTO options (
          question_id,
          option_text,
          is_correct
        )
        VALUES ($1, $2, $3)
        RETURNING *
      `, [
        item.question_id,
        item.option_text,
        item.is_correct
      ]);

      results.push(result.rows[0]);
    }

    return results;
  }

  // single insert
  const result = await pool.query(`
    INSERT INTO options (
      question_id,
      option_text,
      is_correct
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `, [
    data.question_id,
    data.option_text,
    data.is_correct
  ]);

  return result.rows[0];
};

// ================= GET QUIZ DETAIL =================

exports.getQuizDetail = async (quizId) => {
  const result = await pool.query(`
    SELECT 
      q.id as quiz_id,
      q.title,
      ques.id as question_id,
      ques.question,
      opt.id as option_id,
      opt.option_text
    FROM quizzes q
    JOIN questions ques ON q.id = ques.quiz_id
    JOIN options opt ON ques.id = opt.question_id
    WHERE q.id = $1
  `, [quizId]);

  return result.rows;
};

// ================= GET ALL QUIZZES =================
exports.getAllQuiz = async () => {

  // ambil semua quiz
  const quizResult = await pool.query(`
    SELECT 
      quizzes.id,
      quizzes.title,
      quizzes.duration,
      quizzes.category_id,
      categories.name AS category_name
    FROM quizzes
    JOIN categories
      ON quizzes.category_id = categories.id
  `);

  const quizzes = quizResult.rows;

  // looping setiap quiz
  for (const quiz of quizzes) {

    // ambil questions
    const questionResult = await pool.query(`
      SELECT *
      FROM questions
      WHERE quiz_id = $1
    `, [quiz.id]);

    const questions = questionResult.rows;

    // looping setiap question
    for (const question of questions) {

      // ambil options
      const optionResult = await pool.query(`
        SELECT id, option_text, is_correct
        FROM options
        WHERE question_id = $1
      `, [question.id]);

      question.options = optionResult.rows;
    }

    quiz.questions = questions;
  }

  return quizzes;
};

// ================= SUBMIT QUIZ =================

exports.submitQuiz = async (userId, { quiz_id, answers }) => {
  if (!userId) {
    throw new Error('User tidak valid. Silakan login ulang.');
  }

  if (!quiz_id) {
    throw new Error('quiz_id wajib diisi');
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new Error('Jawaban kuis wajib diisi');
  }

  let correctCount = 0;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const ans of answers) {
      const { question_id } = ans;
      const selectedOptionIds = ans.selected_option_ids || ans.selectedOptionIds || ans.selected_option_id || ans.selectedOptionId || [];
      const selectedIds = (Array.isArray(selectedOptionIds) ? selectedOptionIds : [selectedOptionIds])
        .filter(Boolean)
        .map(String);

      if (!question_id) {
        throw new Error('question_id wajib diisi pada setiap jawaban');
      }

      const correctOptions = await client.query(
        `SELECT id FROM options 
         WHERE question_id = $1 AND is_correct = true`,
        [question_id]
      );

      const correctIds = correctOptions.rows.map(o => String(o.id));

      const isCorrect =
        correctIds.length === selectedIds.length &&
        correctIds.every(id => selectedIds.includes(id));

      if (isCorrect) correctCount++;

      for (const optId of selectedIds) {
        await client.query(
          `INSERT INTO user_answers 
           (user_id, question_id, selected_option_id, is_correct)
           VALUES ($1, $2, $3, $4)`,
          [userId, question_id, optId, isCorrect]
        );
      }
    }

    const total = answers.length;
    const score = Math.round((correctCount / total) * 100);

    const result = await client.query(
      `INSERT INTO quiz_results 
       (user_id, quiz_id, score, total_questions, correct_answers)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, quiz_id, score, total, correctCount]
    );

    await client.query('COMMIT');
    return {
      ...result.rows[0],
      score,
      total,
      correct: correctCount
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// ================= GET RESULT =================

exports.getResults = async (userId) => {
  if (!userId) {
    throw new Error('User tidak valid. Silakan login ulang.');
  }

  const result = await pool.query(`
    SELECT 
      qr.id,
      qr.quiz_id,
      qr.score,
      qr.correct_answers,
      qr.total_questions,
      qr.created_at,
      q.category_id,
      q.title AS quiz_title,
      c.name AS category_name
    FROM quiz_results qr
    JOIN quizzes q ON qr.quiz_id = q.id
    JOIN categories c ON q.category_id = c.id
    WHERE qr.user_id = $1
    ORDER BY qr.created_at DESC
  `, [userId]);

  return result.rows;
};

// Update Quiz
exports.updateQuiz = async (id, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { category_id, title, duration, questions = [] } = data;

    // Update main quiz record
    const result = await client.query(
      `UPDATE quizzes
       SET category_id = $1,
           title = $2,
           duration = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [category_id, title, duration || 10, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Quiz tidak ditemukan');
    }

    const quiz = result.rows[0];

    // Delete old options of questions belonging to this quiz
    await client.query(`
      DELETE FROM options 
      WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = $1)
    `, [id]);

    // Delete questions
    await client.query(`
      DELETE FROM questions WHERE quiz_id = $1
    `, [id]);

    // Insert new questions and options
    const quizQuestions = [];
    for (const q of questions) {
      const qResult = await client.query(`
        INSERT INTO questions (quiz_id, question)
        VALUES ($1, $2)
        RETURNING *
      `, [id, q.question || q.text]);

      const questionObj = qResult.rows[0];
      questionObj.options = [];

      const optionsList = q.options || [];
      for (const opt of optionsList) {
        const optResult = await client.query(`
          INSERT INTO options (question_id, option_text, is_correct)
          VALUES ($1, $2, $3)
          RETURNING *
        `, [questionObj.id, opt.option_text || opt.text, !!opt.is_correct]);

        questionObj.options.push(optResult.rows[0]);
      }

      quizQuestions.push(questionObj);
    }

    await client.query('COMMIT');
    return {
      ...quiz,
      questions: quizQuestions
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

//delete quiz
exports.deleteQuiz = async (id) => {
  const result = await pool.query(
    `DELETE FROM quizzes WHERE id = $1 RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Quiz tidak ditemukan');
  }

  return result.rows[0];
};

//Update Question
exports.updateQuestion = async (id, { question }) => {
  const result = await pool.query(
    `UPDATE questions
     SET question = $1
     WHERE id = $2
     RETURNING *`,
    [question, id]
  );

  if (result.rows.length === 0) {
    throw new Error('Question tidak ditemukan');
  }

  return result.rows[0];
};

//delete questions
exports.deleteQuestion = async (id) => {
  const result = await pool.query(
    `DELETE FROM questions WHERE id = $1 RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Question tidak ditemukan');
  }

  return result.rows[0];
};

//Update options
exports.updateOption = async (id, { option_text, is_correct }) => {
  const result = await pool.query(
    `UPDATE options
     SET option_text = $1,
         is_correct = $2
     WHERE id = $3
     RETURNING *`,
    [option_text, is_correct, id]
  );

  if (result.rows.length === 0) {
    throw new Error('Option tidak ditemukan');
  }

  return result.rows[0];
};

//delete options
exports.deleteOption = async (id) => {
  const result = await pool.query(
    `DELETE FROM options WHERE id = $1 RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error('Option tidak ditemukan');
  }

  return result.rows[0];
};
