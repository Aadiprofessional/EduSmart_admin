import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaImage, FaTimes, FaSpinner } from 'react-icons/fa';
import { IconWrapper } from '../../utils/IconWrapper';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  currentImageUrl?: string;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  placeholder?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  currentImageUrl,
  accept = "image/*",
  maxSize = 5,
  label = "Upload Image",
  placeholder = "Click to upload or drag and drop"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type based on accept prop
    const isVideo = accept.includes('video');
    const isImage = accept.includes('image');
    
    if (isVideo && !file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    
    if (isImage && !file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview only for display purposes - don't pass this to parent
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        // For videos, create object URL for preview only
        const videoUrl = URL.createObjectURL(file);
        setPreview(videoUrl);
      }

      // Pass the actual File object to the parent component
      // The parent is responsible for uploading and getting the real URL
      onFileSelect(file);
    } catch (error) {
      setError('Failed to process file');
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    // Clean up blob URLs to prevent memory leaks
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {preview ? (
        <div className="relative">
          <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
            {preview.startsWith('data:image') || (preview.startsWith('blob:') && accept.includes('image')) ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : preview.startsWith('blob:') && accept.includes('video') ? (
              <video
                src={preview}
                className="w-full h-full object-cover"
                controls
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <motion.button
                type="button"
                onClick={handleRemove}
                className="opacity-0 hover:opacity-100 bg-red-500 text-white p-2 rounded-full transition-opacity duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconWrapper icon={FaTimes} />
              </motion.button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Click the × to remove and upload a new {accept.includes('video') ? 'video' : 'image'}</p>
        </div>
      ) : (
        <motion.div
          className={`relative w-full h-32 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {isUploading ? (
              <>
                <IconWrapper icon={FaSpinner} className="text-2xl mb-2 animate-spin text-purple-500" />
                <p className="text-sm">Uploading...</p>
              </>
            ) : (
              <>
                <IconWrapper icon={isDragging ? FaImage : FaUpload} className="text-2xl mb-2" />
                <p className="text-sm text-center px-2">
                  {placeholder}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Max size: {maxSize}MB
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}

      {error && (
        <motion.p
          className="text-red-500 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload; 