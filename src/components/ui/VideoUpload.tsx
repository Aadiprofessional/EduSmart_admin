import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaVideo, FaTimes, FaSpinner, FaPlay } from 'react-icons/fa';
import { IconWrapper } from '../../utils/IconWrapper';

interface VideoUploadProps {
  onFileSelect: (file: File | null) => void;
  currentVideoUrl?: string;
  maxSize?: number; // in MB
  label?: string;
  placeholder?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onFileSelect,
  currentVideoUrl,
  maxSize = 100,
  label = "Upload Video",
  placeholder = "Click to upload video or drag and drop"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentVideoUrl || null);
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

    // Validate file type - accept video files
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL for video
      const videoUrl = URL.createObjectURL(file);
      setPreview(videoUrl);

      // Pass the file to the parent component
      onFileSelect(file);
    } catch (error) {
      setError('Failed to process video file');
      console.error('Video upload error:', error);
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
          <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
            <video
              src={preview}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            <div className="absolute top-2 right-2">
              <motion.button
                type="button"
                onClick={handleRemove}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconWrapper icon={FaTimes} size={12} />
              </motion.button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Click the × to remove and upload a new video</p>
        </div>
      ) : (
        <motion.div
          className={`relative w-full h-48 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
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
                <IconWrapper icon={FaSpinner} className="text-3xl mb-3 animate-spin text-blue-500" />
                <p className="text-sm">Uploading video...</p>
              </>
            ) : (
              <>
                <IconWrapper icon={isDragging ? FaPlay : FaVideo} className="text-3xl mb-3 text-blue-500" />
                <p className="text-sm text-center px-4">
                  {placeholder}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supported formats: MP4, WebM, AVI, MOV
                </p>
                <p className="text-xs text-gray-400">
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
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default VideoUpload; 