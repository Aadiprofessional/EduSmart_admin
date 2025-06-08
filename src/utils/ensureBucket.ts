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
      
      // Create the bucket
      const { error: createError } = await supabaseAdmin.storage.createBucket('universityimages', {
        public: true,
        allowedMimeTypes: ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 52428800 // 50MB
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