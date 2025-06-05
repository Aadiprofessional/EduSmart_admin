import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaGraduationCap, 
  FaBookOpen, 
  FaPlay, 
  FaClock,
  FaRocket,
  FaStar,
  FaUser,
  FaDollarSign,
  FaChartLine,
  FaAward,
  FaLightbulb,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';
import { Course } from '../utils/types';
import { getCourses, deleteCourse, updateCourse, createCourse, getCourseById } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { formatCurrency } from '../utils/helpers';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'feature' | 'unfeature'>('delete');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'programming',
    level: 'beginner',
    duration: '',
    price: 0,
    original_price: 0,
    instructor_name: '',
    instructor_bio: '',
    prerequisites: '',
    learning_outcomes: '',
    skills_gained: '',
    tags: '',
    language: 'English',
    certificate: true,
    featured: false,
    status: 'active',
    image: '',
    video_preview_url: ''
  });

  const { enqueueSnackbar } = useSnackbar();
  const { getAdminUID } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      enqueueSnackbar('Error fetching courses', { variant: 'error' });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const adminUID = getAdminUID();
    if (!adminUID) {
      enqueueSnackbar('Admin UID not available', { variant: 'error' });
      return;
    }

    // Client-side validation
    const errors = [];
    if (!formData.title || formData.title.length < 5 || formData.title.length > 200) {
      errors.push('Title must be between 5 and 200 characters');
    }
    if (!formData.description || formData.description.length < 50) {
      errors.push('Description must be at least 50 characters');
    }
    if (!formData.instructor_name || formData.instructor_name.trim() === '') {
      errors.push('Instructor name is required');
    }
    if (!formData.duration || formData.duration.trim() === '') {
      errors.push('Duration is required');
    }
    if (!formData.category) {
      errors.push('Category is required');
    }
    if (!formData.level) {
      errors.push('Level is required');
    }

    // Validate URLs - reject base64 data
    if (formData.image && formData.image.trim() !== '') {
      if (formData.image.startsWith('data:')) {
        errors.push('Image field must be a valid URL, not uploaded file data. Please use an image hosting service.');
      } else {
        try {
          new URL(formData.image);
        } catch {
          errors.push('Image must be a valid URL');
        }
      }
    }

    if (formData.video_preview_url && formData.video_preview_url.trim() !== '') {
      if (formData.video_preview_url.startsWith('data:')) {
        errors.push('Video preview URL must be a valid URL, not uploaded file data. Please use a video hosting service.');
      } else {
        try {
          new URL(formData.video_preview_url);
        } catch {
          errors.push('Video preview URL must be a valid URL');
        }
      }
    }

    if (errors.length > 0) {
      enqueueSnackbar(errors.join(', '), { variant: 'error' });
      return;
    }
    
    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        level: formData.level,
        duration: formData.duration.trim(),
        price: formData.price || 0,
        original_price: formData.original_price || formData.price || 0,
        instructor_name: formData.instructor_name.trim(),
        instructor_bio: formData.instructor_bio.trim() || '',
        prerequisites: formData.prerequisites ? formData.prerequisites.split(',').map(t => t.trim()).filter(t => t.length > 0) : [],
        learning_outcomes: formData.learning_outcomes ? formData.learning_outcomes.split(',').map(t => t.trim()).filter(t => t.length > 0) : [],
        skills_gained: formData.skills_gained ? formData.skills_gained.split(',').map(t => t.trim()).filter(t => t.length > 0) : [],
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [],
        language: formData.language || 'English',
        certificate: formData.certificate,
        featured: formData.featured,
        status: formData.status || 'active',
        image: formData.image.trim() || null,
        video_preview_url: formData.video_preview_url.trim() || null,
        created_by: adminUID
      };

      console.log('Submitting course data:', submitData);

      let response;
      if (editingCourse) {
        response = await updateCourse(editingCourse.id, submitData);
      } else {
        response = await createCourse(submitData as Omit<Course, 'id' | 'created_at' | 'updated_at'>);
      }

      enqueueSnackbar(editingCourse ? 'Course updated successfully' : 'Course created successfully', { variant: 'success' });
      fetchCourses();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving course:', error);
      
      let errorMessage = 'Error saving course';
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCourse(id);
      enqueueSnackbar('Course deleted successfully', { variant: 'success' });
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      enqueueSnackbar('Error deleting course', { variant: 'error' });
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      category: course.category || 'programming',
      level: course.level || 'beginner',
      duration: course.duration || '',
      price: course.price || 0,
      original_price: course.original_price || course.price || 0,
      instructor_name: course.instructor_name || '',
      instructor_bio: course.instructor_bio || '',
      prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites.join(', ') : '',
      learning_outcomes: Array.isArray(course.learning_outcomes) ? course.learning_outcomes.join(', ') : '',
      skills_gained: Array.isArray(course.skills_gained) ? course.skills_gained.join(', ') : '',
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : '',
      language: course.language || 'English',
      certificate: course.certificate || false,
      featured: course.featured || false,
      status: course.status || 'active',
      image: course.image || '',
      video_preview_url: course.video_preview_url || ''
    });
    setIsModalOpen(true);
  };

  const handleView = (course: Course) => {
    setViewingCourse(course);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      category: 'programming',
      level: 'beginner',
      duration: '',
      price: 0,
      original_price: 0,
      instructor_name: '',
      instructor_bio: '',
      prerequisites: '',
      learning_outcomes: '',
      skills_gained: '',
      tags: '',
      language: 'English',
      certificate: true,
      featured: false,
      status: 'active',
      image: '',
      video_preview_url: ''
    });
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingCourse(null);
  };

  const handleAction = async () => {
    if (!selectedCourse) return;

    try {
      switch (actionType) {
        case 'delete':
          await deleteCourse(selectedCourse.id);
          enqueueSnackbar('Course deleted successfully', { variant: 'success' });
          break;
        case 'feature':
          await updateCourse(selectedCourse.id, { featured: true });
          enqueueSnackbar('Course marked as featured', { variant: 'success' });
          break;
        case 'unfeature':
          await updateCourse(selectedCourse.id, { featured: false });
          enqueueSnackbar('Course removed from featured', { variant: 'success' });
          break;
      }
      fetchCourses();
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error performing action:', error);
      enqueueSnackbar('Error performing action', { variant: 'error' });
    }
  };

  const openConfirmModal = (course: Course, action: 'delete' | 'feature' | 'unfeature') => {
    setSelectedCourse(course);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      category: 'programming',
      level: 'beginner',
      duration: '',
      price: 0,
      original_price: 0,
      instructor_name: '',
      instructor_bio: '',
      prerequisites: '',
      learning_outcomes: '',
      skills_gained: '',
      tags: '',
      language: 'English',
      certificate: true,
      featured: false,
      status: 'active',
      image: '',
      video_preview_url: ''
    });
    setIsModalOpen(true);
  };

  const filteredCourses = Array.isArray(courses) ? courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || course.category === filterCategory;
    const matchesLevel = !filterLevel || course.level === filterLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  }) : [];

  const uniqueCategories = Array.from(new Set(Array.isArray(courses) ? courses.map(c => c.category).filter(Boolean) : []));
  const uniqueLevels = Array.from(new Set(Array.isArray(courses) ? courses.map(c => c.level).filter(Boolean) : []));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <MainLayout title="Course Management">
        <div className="flex justify-center items-center h-64">
          <motion.div 
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Course Management">
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Futuristic Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 backdrop-blur-sm"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <motion.h1 
                className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Course Management
              </motion.h1>
              <motion.p 
                className="text-indigo-100 text-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Create and manage educational content for learners worldwide
              </motion.p>
            </div>
            <motion.div
              className="flex items-center gap-6"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-right">
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-indigo-200 text-sm">Total Courses</p>
              </div>
              <motion.button
                onClick={handleAddCourse}
                className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center gap-3 transition-all duration-300 border border-white/30"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconWrapper icon={FaRocket} />
                Create Course
              </motion.button>
            </motion.div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-300/20 rounded-full blur-lg animate-bounce"></div>
        </motion.div>

        {/* Advanced Filters */}
        <motion.div 
          className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200/50"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
              <IconWrapper icon={FaSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            >
              <option value="">All Levels</option>
              {uniqueLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-indigo-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                List
              </button>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterLevel('');
              }}
              className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300"
            >
              Clear All
            </button>
          </div>
        </motion.div>

        {/* Courses Grid/List */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={viewMode}
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
              : "space-y-6"
            }
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-gray-200/50 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                whileHover={{ y: -8, scale: 1.02 }}
                layout
              >
                {/* Course Image */}
                <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-48' : 'w-48 h-32'}`}>
                  {course.image ? (
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                      <IconWrapper icon={FaGraduationCap} className="text-white text-4xl" />
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {course.featured && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full backdrop-blur-md flex items-center gap-1">
                        <IconWrapper icon={FaStar} />
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                      onClick={() => handleView(course)}
                      className="p-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="View Course"
                    >
                      <IconWrapper icon={FaEye} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleEdit(course)}
                      className="p-2 bg-green-500/80 text-white rounded-full hover:bg-green-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Edit Course"
                    >
                      <IconWrapper icon={FaEdit} />
                    </motion.button>
                    <motion.button
                      onClick={() => openConfirmModal(course, course.featured ? 'unfeature' : 'feature')}
                      className="p-2 bg-yellow-500/80 text-white rounded-full hover:bg-yellow-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={course.featured ? 'Remove from Featured' : 'Mark as Featured'}
                    >
                      <IconWrapper icon={FaStar} />
                    </motion.button>
                    <motion.button
                      onClick={() => openConfirmModal(course, 'delete')}
                      className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Delete Course"
                    >
                      <IconWrapper icon={FaTrash} />
                    </motion.button>
                  </div>
                </div>

                {/* Course Content */}
                <div className={`p-6 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
                      {course.title}
                    </h3>
                    
                    {course.instructor_name && (
                      <div className="flex items-center gap-2 mb-3">
                        <IconWrapper icon={FaUser} className="text-indigo-500" />
                        <span className="text-gray-600 text-sm">By {course.instructor_name}</span>
                      </div>
                    )}

                    {course.description && (
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {course.description}
                      </p>
                    )}

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {course.level && (
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                          <IconWrapper icon={FaChartLine} className="text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-600 font-medium">Level</p>
                            <p className="text-sm font-bold text-blue-800">{course.level}</p>
                          </div>
                        </div>
                      )}
                      
                      {course.duration && (
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                          <IconWrapper icon={FaClock} className="text-green-600" />
                          <div>
                            <p className="text-xs text-green-600 font-medium">Duration</p>
                            <p className="text-sm font-bold text-green-800">{course.duration}</p>
                          </div>
                        </div>
                      )}
                      
                      {course.price !== undefined && (
                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                          <IconWrapper icon={FaDollarSign} className="text-purple-600" />
                          <div>
                            <p className="text-xs text-purple-600 font-medium">Price</p>
                            <p className="text-sm font-bold text-purple-800">
                              {course.price ? formatCurrency(course.price) : 'Free'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {course.category && (
                        <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                          <IconWrapper icon={FaBookOpen} className="text-orange-600" />
                          <div>
                            <p className="text-xs text-orange-600 font-medium">Category</p>
                            <p className="text-sm font-bold text-orange-800">{course.category}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Start Learning Button */}
                  <motion.button
                    onClick={() => handleView(course)}
                    className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconWrapper icon={FaPlay} />
                    Start Learning
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <motion.div 
            className="text-center py-16"
            variants={itemVariants}
          >
            <motion.div
              className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mb-6"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <IconWrapper icon={FaGraduationCap} className="text-white text-3xl" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory || filterLevel ? 'Try adjusting your filters' : 'Get started by creating your first course'}
            </p>
            <motion.button
              onClick={handleAddCourse}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconWrapper icon={FaPlus} />
              Create First Course
            </motion.button>
          </motion.div>
        )}

        {/* Course Creation/Edit Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="p-8">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {editingCourse ? 'Edit Course' : 'Create New Course'}
                    </h2>
                    <motion.button
                      onClick={handleCloseModal}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconWrapper icon={FaTimes} />
                    </motion.button>
                  </div>

                  {/* Course Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course Title *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Instructor Name *
                        </label>
                        <input
                          type="text"
                          value={formData.instructor_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, instructor_name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        >
                          <option value="programming">Programming</option>
                          <option value="data-science">Data Science</option>
                          <option value="business">Business</option>
                          <option value="design">Design</option>
                          <option value="marketing">Marketing</option>
                          <option value="language">Language</option>
                          <option value="test-prep">Test Prep</option>
                          <option value="academic">Academic</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Level *
                        </label>
                        <select
                          value={formData.level}
                          onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration *
                        </label>
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., 8 weeks, 3 months"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Original Price ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.original_price}
                          onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={formData.language}
                          onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                          <option value="Chinese">Chinese</option>
                          <option value="Japanese">Japanese</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description * (minimum 50 characters)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Provide a detailed description of the course (minimum 50 characters)..."
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.description.length}/50 characters minimum
                      </p>
                    </div>

                    {/* Instructor Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructor Bio
                      </label>
                      <textarea
                        value={formData.instructor_bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, instructor_bio: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {/* Array Fields with proper comma handling */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prerequisites (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={formData.prerequisites}
                          onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
                          placeholder="Basic programming, Math knowledge"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Skills Gained (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={formData.skills_gained}
                          onChange={(e) => setFormData(prev => ({ ...prev, skills_gained: e.target.value }))}
                          placeholder="React, Node.js, MongoDB"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Learning Outcomes (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={formData.learning_outcomes}
                          onChange={(e) => setFormData(prev => ({ ...prev, learning_outcomes: e.target.value }))}
                          placeholder="Build web apps, Deploy to production"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="Web Development, JavaScript, React"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Image and Video URLs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Course Image URL
                        </label>
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="https://images.unsplash.com/photo-example.jpg (URL only, no file uploads)"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            formData.image && formData.image.startsWith('data:') 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use image hosting services like Unsplash, Imgur, or Cloudinary. Do not paste file data.
                        </p>
                        {formData.image && formData.image.startsWith('data:') && (
                          <p className="text-red-500 text-xs mt-1">❌ File data detected. Please use a valid image URL instead.</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video Preview URL
                        </label>
                        <input
                          type="url"
                          value={formData.video_preview_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, video_preview_url: e.target.value }))}
                          placeholder="https://youtube.com/watch?v=example or https://vimeo.com/example"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            formData.video_preview_url && formData.video_preview_url.startsWith('data:') 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use video hosting services like YouTube, Vimeo, or direct video URLs. Do not paste file data.
                        </p>
                        {formData.video_preview_url && formData.video_preview_url.startsWith('data:') && (
                          <p className="text-red-500 text-xs mt-1">❌ File data detected. Please use a valid video URL instead.</p>
                        )}
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.certificate}
                          onChange={(e) => setFormData(prev => ({ ...prev, certificate: e.target.checked }))}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Provides Certificate</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Featured Course</span>
                      </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6">
                      <motion.button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconWrapper icon={FaSave} />
                        {loading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course View Modal */}
        <AnimatePresence>
          {isViewModalOpen && viewingCourse && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="p-8">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Course Details</h2>
                    <motion.button
                      onClick={handleCloseViewModal}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconWrapper icon={FaTimes} />
                    </motion.button>
                  </div>

                  {/* Course Details */}
                  <div className="space-y-6">
                    {/* Course Image */}
                    {viewingCourse.image && (
                      <div className="w-full h-64 rounded-xl overflow-hidden">
                        <img 
                          src={viewingCourse.image} 
                          alt={viewingCourse.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Basic Info */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{viewingCourse.title}</h3>
                      <p className="text-gray-600 mb-4">By {viewingCourse.instructor_name}</p>
                      <p className="text-gray-700 leading-relaxed">{viewingCourse.description}</p>
                    </div>

                    {/* Course Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <IconWrapper icon={FaChartLine} className="text-blue-600" />
                          <span className="text-blue-600 font-medium">Level</span>
                        </div>
                        <p className="text-blue-800 font-bold">{viewingCourse.level}</p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <IconWrapper icon={FaClock} className="text-green-600" />
                          <span className="text-green-600 font-medium">Duration</span>
                        </div>
                        <p className="text-green-800 font-bold">{viewingCourse.duration}</p>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <IconWrapper icon={FaDollarSign} className="text-purple-600" />
                          <span className="text-purple-600 font-medium">Price</span>
                        </div>
                        <p className="text-purple-800 font-bold">
                          {viewingCourse.price ? formatCurrency(viewingCourse.price) : 'Free'}
                        </p>
                      </div>
                      
                      <div className="bg-orange-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <IconWrapper icon={FaBookOpen} className="text-orange-600" />
                          <span className="text-orange-600 font-medium">Category</span>
                        </div>
                        <p className="text-orange-800 font-bold">{viewingCourse.category}</p>
                      </div>
                    </div>

                    {/* Additional Details */}
                    {viewingCourse.instructor_bio && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">About the Instructor</h4>
                        <p className="text-gray-700">{viewingCourse.instructor_bio}</p>
                      </div>
                    )}

                    {viewingCourse.prerequisites && viewingCourse.prerequisites.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Prerequisites</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingCourse.prerequisites.map((prereq, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {prereq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {viewingCourse.learning_outcomes && viewingCourse.learning_outcomes.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Learning Outcomes</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {viewingCourse.learning_outcomes.map((outcome, index) => (
                            <li key={index}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {viewingCourse.skills_gained && viewingCourse.skills_gained.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Skills You'll Gain</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingCourse.skills_gained.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {viewingCourse.tags && viewingCourse.tags.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingCourse.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                      <motion.button
                        onClick={() => {
                          handleCloseViewModal();
                          handleEdit(viewingCourse);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconWrapper icon={FaEdit} />
                        Edit Course
                      </motion.button>
                      <motion.button
                        onClick={handleCloseViewModal}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Close
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && selectedCourse && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200/50"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="text-center">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    actionType === 'delete' 
                      ? 'bg-red-100' 
                      : actionType === 'feature' 
                        ? 'bg-yellow-100' 
                        : 'bg-orange-100'
                  }`}>
                    <IconWrapper 
                      icon={actionType === 'delete' ? FaTrash : FaStar} 
                      className={`text-2xl ${
                        actionType === 'delete' 
                          ? 'text-red-600' 
                          : actionType === 'feature' 
                            ? 'text-yellow-600' 
                            : 'text-orange-600'
                      }`} 
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {actionType === 'delete' 
                      ? 'Delete Course' 
                      : actionType === 'feature' 
                        ? 'Feature Course' 
                        : 'Remove from Featured'}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {actionType === 'delete' 
                      ? `Are you sure you want to delete "${selectedCourse.title}"? This action cannot be undone.`
                      : actionType === 'feature' 
                        ? `Are you sure you want to mark "${selectedCourse.title}" as featured?`
                        : `Are you sure you want to remove "${selectedCourse.title}" from featured courses?`}
                  </p>
                  
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setShowConfirmModal(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleAction}
                      className={`flex-1 px-4 py-2 text-white rounded-xl transition-all duration-300 ${
                        actionType === 'delete' 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : actionType === 'feature' 
                            ? 'bg-yellow-500 hover:bg-yellow-600' 
                            : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {actionType === 'delete' 
                        ? 'Delete' 
                        : actionType === 'feature' 
                          ? 'Feature' 
                          : 'Remove'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </MainLayout>
  );
};

export default Courses; 