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
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Get the correct content type from the file
    const contentType = file.type || getContentTypeFromExtension(fileExt || '');
    
    console.log(`Uploading file: ${fileName}, Type: ${contentType}, Size: ${file.size} bytes`);
    
    // Try multiple upload methods to ensure compatibility
    let uploadResult;
    
    try {
      // Method 1: Upload as ArrayBuffer (most reliable for binary data)
      const arrayBuffer = await file.arrayBuffer();
      uploadResult = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, arrayBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType,
        });
    } catch (arrayBufferError) {
      console.warn('ArrayBuffer upload failed, trying Blob method:', arrayBufferError);
      
      // Method 2: Upload as Blob (fallback)
      const blob = new Blob([file], { type: contentType });
      uploadResult = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType,
        });
    }

    const { data, error } = uploadResult;

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    console.log('Upload successful:', data);

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log('Generated public URL:', publicUrl);
    
    // Verify the upload by checking if the file exists
    try {
      const { data: fileData, error: checkError } = await supabaseAdmin.storage
        .from(bucket)
        .list(folder, {
          search: fileName
        });
      
      if (checkError || !fileData || fileData.length === 0) {
        console.warn('File verification failed, but continuing with URL');
      } else {
        console.log('File verified successfully:', fileData[0]);
      }
    } catch (verifyError) {
      console.warn('File verification error:', verifyError);
    }
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Get content type from file extension
 * @param extension File extension
 * @returns MIME type
 */
const getContentTypeFromExtension = (extension: string): string => {
  const ext = extension.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    
    // Videos
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'mkv': 'video/x-matroska',
    '3gp': 'video/3gpp',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'aac': 'audio/aac',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
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

/**
 * Validate that an uploaded file URL returns the correct content type
 * @param url The URL to validate
 * @returns Promise<boolean> indicating if the URL is valid
 */
export const validateFileUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    
    console.log(`URL validation - Status: ${response.status}, Content-Type: ${contentType}`);
    
    return response.ok && contentType !== null && !contentType.includes('application/json');
  } catch (error) {
    console.error('Error validating file URL:', error);
    return false;
  }
};

/**
 * Upload a file to Supabase storage with validation
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param folder The folder path within the bucket
 * @returns The URL of the uploaded file
 */
export const uploadFileWithValidation = async (
  file: File,
  bucket: string = 'universityimages',
  folder: string = 'uploads'
): Promise<string> => {
  const url = await uploadFile(file, bucket, folder);
  
  // Wait a moment for the file to be available
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Validate the uploaded file
  const isValid = await validateFileUrl(url);
  
  if (!isValid) {
    console.warn('Uploaded file URL validation failed, but returning URL anyway');
    // Don't throw error, just log warning as the file might still be processing
  }
  
  return url;
};

/**
 * Debug function to test file upload process
 * @param file The file to test upload
 */
export const debugFileUpload = async (file: File): Promise<void> => {
  console.log('=== DEBUG FILE UPLOAD ===');
  console.log('File details:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  });

  try {
    // Test bucket access
    console.log('Testing bucket access...');
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) {
      console.error('Bucket list error:', listError);
      return;
    }
    console.log('Available buckets:', buckets?.map(b => b.name));

    // Test file upload
    console.log('Testing file upload...');
    const url = await uploadFile(file, 'universityimages', 'debug');
    console.log('Upload successful, URL:', url);

    // Test URL access
    console.log('Testing URL access...');
    const response = await fetch(url, { method: 'HEAD' });
    console.log('URL response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      cacheControl: response.headers.get('cache-control')
    });

    // Test actual content
    console.log('Testing content download...');
    const contentResponse = await fetch(url);
    const contentType = contentResponse.headers.get('content-type');
    console.log('Content response:', {
      status: contentResponse.status,
      contentType: contentType,
      size: contentResponse.headers.get('content-length')
    });

    if (contentType?.includes('application/json')) {
      const jsonContent = await contentResponse.text();
      console.log('JSON content (first 500 chars):', jsonContent.substring(0, 500));
    }

  } catch (error) {
    console.error('Debug upload error:', error);
  }
  console.log('=== END DEBUG ===');
}; 