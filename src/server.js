require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

app.get('/', (req, res) => {
  res.send('LearnIT Backend Running');
});

// Ensure DB configuration exists before trying to connect
// Debug: show which DB host will be used (temporary)
if (process.env.DATABASE_URL) {
  try {
    const parsed = new URL(process.env.DATABASE_URL);
    console.log('Detected DATABASE_URL host:', parsed.hostname);
  } catch (err) {
    console.log('DATABASE_URL set but could not parse host');
  }
} else {
  console.log('Detected DB_HOST from env:', process.env.DB_HOST);
}

if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  console.error('No database configuration found. Set DATABASE_URL or DB_HOST/DB_USER/DB_PASS in your environment.');
  process.exit(1);
}

// Verify DB connectivity with a simple query (avoids holding a client open)
pool.query('SELECT 1')
  .then(() => {
    console.log('Database connected');

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Database connection error:', err);
    process.exit(1);
  });
// Removed debug logging of DB password