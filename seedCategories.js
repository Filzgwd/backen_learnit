const pool = require('./src/config/db');

const categories = [
  { name: 'Algoritma & Pemrograman', description: 'Pembelajaran dasar algoritma dan pemrograman' },
  { name: 'Pengembangan Website', description: 'Pembelajaran web development' },
  { name: 'Desain UI/UX', description: 'Pembelajaran desain antarmuka dan user experience' },
  { name: 'Kecerdasan Buatan', description: 'Pembelajaran AI dan machine learning' },
  { name: 'Pemrograman Mobile', description: 'Pembelajaran mobile app development' },
  { name: 'Game Development', description: 'Pembelajaran game development' },
  { name: 'Data Science', description: 'Pembelajaran data science dan analytics' }
];

async function seedCategories() {
  try {
    console.log('🌱 Seeding categories...');

    for (const category of categories) {
      // Check if category exists
      const existing = await pool.query(
        'SELECT id FROM categories WHERE name = $1',
        [category.name]
      );

      if (existing.rows.length === 0) {
        const result = await pool.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
          [category.name, category.description]
        );
        console.log(`✅ Created category: ${category.name} (ID: ${result.rows[0].id})`);
      } else {
        console.log(`⏭️  Category already exists: ${category.name} (ID: ${existing.rows[0].id})`);
      }
    }

    // Fetch and display all categories
    console.log('\n📋 All categories:');
    const allCategories = await pool.query('SELECT * FROM categories ORDER BY created_at');
    for (const cat of allCategories.rows) {
      console.log(`  - ${cat.name} (ID: ${cat.id})`);
    }

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
