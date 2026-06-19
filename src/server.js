require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

app.get('/', (req, res) => {
  res.setHeader('X-Deployment-Check', 'backend-learnit-20260618');
  res.send('LearnIT Backend Running - deploy-check');
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

// Seed categories on startup
async function seedCategories() {
  const categories = [
    { name: 'Algoritma & Pemrograman', description: 'Pembelajaran dasar algoritma dan pemrograman' },
    { name: 'Pengembangan Website', description: 'Pembelajaran web development' },
    { name: 'Desain UI/UX', description: 'Pembelajaran desain antarmuka dan user experience' },
    { name: 'Kecerdasan Buatan', description: 'Pembelajaran AI dan machine learning' },
    { name: 'Pemrograman Mobile', description: 'Pembelajaran mobile app development' },
  ];

  try {
    for (const category of categories) {
      const existing = await pool.query(
        'SELECT id FROM categories WHERE name = $1',
        [category.name]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2)',
          [category.name, category.description]
        );
        console.log(`✅ Created category: ${category.name}`);
      }
    }
  } catch (error) {
    console.error('⚠️  Error seeding categories:', error.message);
  }
}

// Verify DB connectivity with a simple query (avoids holding a client open)
pool.query('SELECT 1')
  .then(async () => {
    console.log('Database connected');

    // Seed categories on startup
    await seedCategories();

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