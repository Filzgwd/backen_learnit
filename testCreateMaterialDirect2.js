/**
 * Direct test of material creation with blocks
 */
require('dotenv').config();
const materialService = require('./src/services/materialService');

async function testCreateMaterialWithBlocks() {
  try {
    console.log('🧪 Testing material creation with blocks...\n');

    const testData = {
      title: 'Test Material With Blocks',
      description: 'This is a test',
      category_id: '7240b709-c2f4-49ac-a434-2f9bbdfdcb9e', // Pengembangan Website
      image: 'https://via.placeholder.com/300x200?text=Test+Image',
      videoLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      blocks: [
        {
          title: 'Introduction Block',
          paragraph: 'This is the introduction paragraph with detailed information',
          example: 'Example: How to use this material',
          list: 'Point 1\nPoint 2\nPoint 3',
          listType: 'bullet',
          image: ''
        },
        {
          title: 'Second Block',
          paragraph: 'Another block with content',
          example: '',
          list: '',
          listType: 'bullet',
          image: ''
        }
      ]
    };

    console.log('📤 Sending data:');
    console.log(`   - Title: ${testData.title}`);
    console.log(`   - Blocks: ${testData.blocks.length}`);
    testData.blocks.forEach((b, i) => {
      console.log(`     ${i + 1}. "${b.title}" - ${b.paragraph?.substring(0, 30)}...`);
    });
    console.log();

    const result = await materialService.createMaterial(testData);

    console.log('\n✅ Material created successfully!');
    console.log(`   ID: ${result.id}`);
    console.log(`   Title: ${result.title}`);
    console.log(`   Blocks in response: ${result.blocks?.length || 0}`);
    console.log(`   Contents in response: ${result.contents?.length || 0}`);

    if (result.contents && result.contents.length > 0) {
      console.log('\n📋 Contents stored in database:');
      result.contents.forEach((c, i) => {
        console.log(`   ${i + 1}. [${c.content_type}] seq=${c.sequence}`);
      });
    } else {
      console.log('\n⚠️  WARNING: No contents returned in response!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

testCreateMaterialWithBlocks();
