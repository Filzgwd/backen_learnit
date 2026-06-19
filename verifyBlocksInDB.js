/**
 * Verify if blocks are being stored in material_contents table
 */
require('dotenv').config();
const pool = require('./src/config/db');

async function verifyBlocksInDatabase() {
  try {
    console.log('🔍 Checking database for materials and their contents...\n');

    // Get all materials
    const materialsResult = await pool.query(`
      SELECT id, title, category_id, created_at 
      FROM materials 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    const materials = materialsResult.rows;
    console.log(`📊 Found ${materials.length} recent materials:\n`);

    for (const material of materials) {
      console.log(`📌 Material: ${material.title} (ID: ${material.id})`);
      console.log(`   Created: ${material.created_at}`);

      // Get contents for this material
      const contentsResult = await pool.query(`
        SELECT id, content_type, sequence, 
               CASE 
                 WHEN content_type = 'text' THEN 'Block: ' || (content::jsonb->>'title')
                 ELSE content_type || ': ' || LEFT(content, 50)
               END as preview
        FROM material_contents 
        WHERE material_id = $1 
        ORDER BY sequence
      `, [material.id]);

      const contents = contentsResult.rows;
      console.log(`   └─ Contents: ${contents.length} items`);

      if (contents.length === 0) {
        console.log(`      ⚠️  NO CONTENTS FOUND!`);
      } else {
        for (const content of contents) {
          console.log(`      ${content.sequence}. [${content.content_type}] ${content.preview}`);
        }
      }
      console.log();
    }

    // Check specifically for the most recently created material
    if (materials.length > 0) {
      const latestMaterial = materials[0];
      console.log(`\n📝 Detailed check for latest material: "${latestMaterial.title}"`);
      
      const contentsResult = await pool.query(`
        SELECT * FROM material_contents 
        WHERE material_id = $1 
        ORDER BY sequence
      `, [latestMaterial.id]);

      const contents = contentsResult.rows;
      console.log(`\nTotal contents in DB: ${contents.length}`);
      
      if (contents.length > 0) {
        console.log('\nContents data:');
        contents.forEach((c, i) => {
          console.log(`\n[${i + 1}] Type: ${c.content_type}, Sequence: ${c.sequence}`);
          if (c.content_type === 'text') {
            try {
              const block = JSON.parse(c.content);
              console.log(`    Title: ${block.title}`);
              console.log(`    Paragraph: ${block.paragraph?.substring(0, 50)}...`);
              console.log(`    Example: ${block.example?.substring(0, 50)}...`);
              console.log(`    List: ${block.list?.substring(0, 50)}...`);
            } catch (e) {
              console.log(`    Content: ${c.content.substring(0, 100)}`);
            }
          } else {
            console.log(`    Content: ${c.content.substring(0, 100)}`);
          }
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyBlocksInDatabase();
