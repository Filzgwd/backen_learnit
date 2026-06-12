const express = require('express');
const cors = require('cors');

const app = express();
const forumRoutes = require('./routes/forumRoutes');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://learnit.vercel.app'
  ]
}));
app.use(express.json());

// routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/material-contents', require('./routes/materialContentRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/forum-posts', require('./routes/forumRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

module.exports = app;