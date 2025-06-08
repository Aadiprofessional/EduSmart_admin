import { supabaseAdmin } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import './ensureBucket'; // Ensure bucket exists when this module is loaded

/**
 * Upload a file to Supabase storage
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param folder The folder path within the bucket
 * @returns The URL of the uploaded file
 */
export const uploadFile = async (
  file: File,
  bucket: string = 'universityimages',
  folder: string = 'uploads'
): Promise<string> => {
  try {
    // Ensure bucket exists before uploading
    await createBucketIfNotExists(bucket);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete a file from Supabase storage
 * @param fileUrl The URL of the file to delete
 * @param bucket The storage bucket name
 * @returns Success status
 */
export const deleteFile = async (
  fileUrl: string,
  bucket: string = 'universityimages'
): Promise<boolean> => {
  try {
    // Extract the path from the public URL
    const baseUrl = `https://cdqrmxmqsoxncnkxiqwu.supabase.co/storage/v1/object/public/${bucket}/`;
    const filePath = fileUrl.replace(baseUrl, '');

    // Delete the file
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Create a Storage bucket if it doesn't exist
 * @param bucketName The name of the bucket to create
 * @param isPublic Whether the bucket should be publicly accessible
 * @returns Success status
 */
export const createBucketIfNotExists = async (
  bucketName: string,
  isPublic: boolean = true
): Promise<boolean> => {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.find(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      // Create the bucket
      const { error } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: isPublic,
      });

      if (error) {
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error('Error creating bucket:', error);
    return false;
  }
}; 