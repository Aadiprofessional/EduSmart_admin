import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft,
  FaBook,
  FaUser,
  FaImage,
  FaLightbulb,
  FaRocket,
  FaSave,
  FaSpinner,
  FaDollarSign,
  FaClock,
  FaGlobe,
  FaGraduationCap,
  FaTag
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';
import { useAuth } from '../utils/AuthContext';
import FileUpload from '../components/ui/FileUpload';
import VideoUpload from '../components/ui/VideoUpload';
import { uploadFile } from '../utils/fileUpload';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { profile } = useAuth();
  
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Course form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'programming',
    level: 'beginner',
    language: 'English',
    duration: '',
    price: 0,
    original_price: 0,
    thumbnail_image: '',
    preview_video_url: '',
    instructor_name: '',
    instructor_bio: '',
    what_you_will_learn: '',
    prerequisites: '',
    target_audience: '',
    course_includes: '',
    tags: '',
    status: 'published',
    featured: false
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // API Functions
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/course-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.instructor_name) {
        enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
        return;
      }

      // Prepare course data
      const courseData = {
        ...formData,
        what_you_will_learn: formData.what_you_will_learn.split('\n').filter(item => item.trim()),
        prerequisites: formData.prerequisites.split('\n').filter(item => item.trim()),
        target_audience: formData.target_audience.split('\n').filter(item => item.trim()),
        course_includes: formData.course_includes.split('\n').filter(item => item.trim()),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      // Make API call to create course
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        enqueueSnackbar('Course created successfully!', { variant: 'success' });
        resetForm();
        navigate('/courses');
      } else {
        const errorData = await response.json();
        enqueueSnackbar(errorData.message || 'Failed to create course', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error creating course:', error);
      enqueueSnackbar('An error occurred while creating the course', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      category: 'programming',
      level: 'beginner',
      language: 'English',
      duration: '',
      price: 0,
      original_price: 0,
      thumbnail_image: '',
      preview_video_url: '',
      instructor_name: '',
      instructor_bio: '',
      what_you_will_learn: '',
      prerequisites: '',
      target_audience: '',
      course_includes: '',
      tags: '',
      status: 'published',
      featured: false
    });
  };

  return (
    <MainLayout title="Create New Course">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                <IconWrapper icon={FaGraduationCap} size={24} />
              </div>
              Create New Course
            </h1>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <IconWrapper icon={FaArrowLeft} size={14} />
                Reset Form
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <IconWrapper icon={FaArrowLeft} size={14} />
                Cancel
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IconWrapper icon={FaBook} className="text-blue-500" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter course title"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter course subtitle"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter course description"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.slug}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Level *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all-levels">All Levels</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., English"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration *</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 10 hours"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IconWrapper icon={FaDollarSign} className="text-green-500" />
                Pricing
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price ($)</label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Instructor Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IconWrapper icon={FaUser} className="text-purple-500" />
                Instructor Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Instructor Name *</label>
                  <input
                    type="text"
                    value={formData.instructor_name}
                    onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter instructor name"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Instructor Bio</label>
                  <textarea
                    value={formData.instructor_bio}
                    onChange={(e) => setFormData({ ...formData, instructor_bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter instructor bio"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IconWrapper icon={FaImage} className="text-pink-500" />
                Media
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail Image</label>
                  <FileUpload
                    onFileSelect={async (file: File | null) => {
                      if (file) {
                        try {
                          // Upload file to Supabase storage
                          const uploadedUrl = await uploadFile(file, 'universityimages', 'courses');
                          setFormData({ ...formData, thumbnail_image: uploadedUrl });
                          enqueueSnackbar('Thumbnail uploaded successfully!', { variant: 'success' });
                        } catch (error) {
                          console.error('Upload error:', error);
                          enqueueSnackbar('Upload failed. Please try again.', { variant: 'error' });
                          // Fallback to temporary URL for preview
                          const tempUrl = URL.createObjectURL(file);
                          setFormData({ ...formData, thumbnail_image: tempUrl });
                        }
                      } else {
                        setFormData({ ...formData, thumbnail_image: '' });
                      }
                    }}
                    currentImageUrl={formData.thumbnail_image}
                    label="Course Thumbnail"
                    placeholder="Upload course thumbnail image"
                    maxSize={5}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preview Video</label>
                  <VideoUpload
                    onFileSelect={async (video: File | null) => {
                      if (video) {
                        try {
                          // Upload video to Supabase storage
                          const uploadedUrl = await uploadFile(video, 'universityimages', 'courses');
                          setFormData({ ...formData, preview_video_url: uploadedUrl });
                          enqueueSnackbar('Video uploaded successfully!', { variant: 'success' });
                        } catch (error) {
                          console.error('Upload error:', error);
                          enqueueSnackbar('Upload failed. Please try again.', { variant: 'error' });
                          // Fallback to temporary URL for preview
                          const tempUrl = URL.createObjectURL(video);
                          setFormData({ ...formData, preview_video_url: tempUrl });
                        }
                      } else {
                        setFormData({ ...formData, preview_video_url: '' });
                      }
                    }}
                    currentVideoUrl={formData.preview_video_url}
                    label="Preview Video"
                    placeholder="Upload course preview video"
                    maxSize={50}
                  />
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IconWrapper icon={FaLightbulb} className="text-yellow-500" />
                Course Content
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">What You Will Learn (one per line)</label>
                  <textarea
                    value={formData.what_you_will_learn}
                    onChange={(e) => setFormData({ ...formData, what_you_will_learn: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Master React fundamentals&#10;Build modern web applications&#10;Understand state management"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prerequisites (one per line)</label>
                  <textarea
                    value={formData.prerequisites}
                    onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Basic JavaScript knowledge&#10;HTML/CSS fundamentals"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience (one per line)</label>
                  <textarea
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Beginner developers&#10;Frontend developers&#10;JavaScript developers"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Includes (one per line)</label>
                  <textarea
                    value={formData.course_includes}
                    onChange={(e) => setFormData({ ...formData, course_includes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25 hours of video&#10;Downloadable resources&#10;Certificate of completion"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="React, JavaScript, Frontend, Web Development"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <IconWrapper icon={FaRocket} className="text-indigo-500" />
                Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`relative w-12 h-6 rounded-full transition-colors ${formData.featured ? 'bg-blue-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.featured ? 'translate-x-6' : ''}`} />
                    </div>
                    <span className="ml-3 text-sm font-semibold text-gray-700">Featured Course</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              
              <motion.button
                type="submit"
                whileHover={{ scale: submitting ? 1 : 1.05 }}
                whileTap={{ scale: submitting ? 1 : 0.95 }}
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <IconWrapper icon={FaSpinner} className="animate-spin" size={16} />
                    Creating Course...
                  </>
                ) : (
                  <>
                    <IconWrapper icon={FaSave} size={16} />
                    Create Course
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateCourse; 