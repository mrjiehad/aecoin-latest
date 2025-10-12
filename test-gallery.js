// Quick test script to verify gallery table exists
import { db } from './server/db.js';
import { galleryImages } from './shared/schema.js';

async function testGallery() {
  try {
    console.log('Testing gallery table...');
    
    // Try to fetch all gallery images
    const images = await db.select().from(galleryImages);
    console.log('✅ Gallery table exists!');
    console.log(`Found ${images.length} images in gallery`);
    
    if (images.length > 0) {
      console.log('First image:', images[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testGallery();
