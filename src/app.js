const express = require('express');
const cors = require('cors');

const app = express();

// CORS with function-based origin check
const corsOptions = {
  origin: function(origin, callback) {
    console.log('[CORS] Checking origin:', origin);
    // Allow all origins including undefined (for non-CORS requests)
    callback(null, true);
  },
  credentials: false,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

app.use(cors(corsOptions));
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