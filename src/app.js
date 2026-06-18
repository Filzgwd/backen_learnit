const express = require('express');

const app = express();

// Manual CORS middleware - NO cors() package
app.use((req, res, next) => {
  console.log('[CORS]', req.method, req.path);
  
  res.set('X-Manual-CORS', 'active');
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  console.log('[CORS] Headers set');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Responding to OPTIONS');
    return res.status(200).end();
  }
  
  next();
});
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