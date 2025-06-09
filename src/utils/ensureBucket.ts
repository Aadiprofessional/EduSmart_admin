import { supabaseAdmin } from './supabase';

/**
 * Ensure the universityimages bucket exists and is properly configured
 */
export const ensureBucket = async () => {
  try {
    console.log('Checking if universityimages bucket exists...');
    
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.find(bucket => bucket.name === 'universityimages');
    
    if (!bucketExists) {
      console.log('Creating universityimages bucket...');
      
      // Create the bucket with proper configuration
      const { error: createError } = await supabaseAdmin.storage.createBucket('universityimages', {
        public: true,
        allowedMimeTypes: [
          // Images
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          'image/bmp',
          'image/x-icon',
          // Videos
          'video/mp4',
          'video/webm',
          'video/avi',
          'video/x-msvideo',
          'video/quicktime',
          'video/x-ms-wmv',
          'video/x-flv',
          'video/x-matroska',
          'video/3gpp',
          // Audio
          'audio/mpeg',
          'audio/wav',
          'audio/ogg',
          'audio/aac',
          // Documents
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ],
        fileSizeLimit: 104857600 // 100MB (increased from 50MB)
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }
      
      console.log('✅ universityimages bucket created successfully!');
    } else {
      console.log('✅ universityimages bucket already exists');
    }
    
    // Test bucket access
    const { data: files, error: testError } = await supabaseAdmin.storage
      .from('universityimages')
      .list('', { limit: 1 });
    
    if (testError) {
      console.error('Error accessing bucket:', testError);
      return false;
    }
    
    console.log('✅ Bucket access test successful');
    return true;
    
  } catch (error) {
    console.error('Error ensuring bucket:', error);
    return false;
  }
};

// Run this function when the module is imported
ensureBucket(); 