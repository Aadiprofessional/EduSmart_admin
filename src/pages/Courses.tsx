import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
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
  FaTimes,
  FaVideo,
  FaFileAlt,
  FaQuestionCircle,
  FaDownload,
  FaUpload,
  FaImage,
  FaLayerGroup,
  FaListOl,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';
import { getCourses, deleteCourse, updateCourse, createCourse, getCourseById } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import { formatCurrency } from '../utils/helpers';

// Enhanced API service
const API_BASE = 'http://localhost:8000/api/v2';

interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  level: string;
  language: string;
  duration: string;
  price: number;
  original_price?: number;
  thumbnail_image?: string;
  preview_video_url?: string;
  instructor_name: string;
  instructor_bio?: string;
  instructor_image?: string;
  what_you_will_learn?: string[];
  prerequisites?: string[];
  target_audience?: string[];
  course_includes?: string[];
  tags?: string[];
  status: string;
  featured: boolean;
  rating?: number;
  total_reviews?: number;
  total_students?: number;
  total_lectures?: number;
  total_sections?: number;
  created_at: string;
  updated_at: string;
}

interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  section_order: number;
  duration_minutes?: number;
  course_lectures?: CourseLecture[];
}

interface CourseLecture {
  id: string;
  section_id: string;
  course_id: string;
  title: string;
  description?: string;
  lecture_type: 'video' | 'article' | 'quiz' | 'assignment' | 'resource';
  video_url?: string;
  video_duration_seconds?: number;
  article_content?: string;
  resource_url?: string;
  lecture_order: number;
  is_preview: boolean;
  is_free: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

const Courses: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { profile } = useAuth();
  
  // State management
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'view' | 'sections'>('list');
  
  // Course form state (for editing only)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
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

  // Section and lecture management
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<CourseSection | null>(null);
  const [sectionFormData, setSectionFormData] = useState({
    title: '',
    description: '',
    section_order: 1
  });
  const [lectureFormData, setLectureFormData] = useState({
    title: '',
    description: '',
    lecture_type: 'video' as 'video' | 'article' | 'quiz' | 'assignment' | 'resource',
    video_url: '',
    video_duration_seconds: 0,
    article_content: '',
    resource_url: '',
    lecture_order: 1,
    is_preview: false,
    is_free: false
  });

  // Computed filtered courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchTerm || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || course.category === filterCategory;
    const matchesLevel = !filterLevel || course.level === filterLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (id && id !== 'new') {
      if (window.location.pathname.includes('/view/')) {
        setCurrentView('view');
        fetchCourseDetails(id);
      } else if (window.location.pathname.includes('/edit/')) {
        setCurrentView('edit');
        fetchCourseDetails(id);
      }
    } else {
      setCurrentView('list');
    }
  }, [id]);

  // API Functions
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/courses`);
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      enqueueSnackbar('Error fetching courses', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/course-categories`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCourseDetails = async (courseId: string) => {
    try {
      const response = await fetch(`${API_BASE}/courses/${courseId}`);
      const data = await response.json();
      
      if (data.success) {
        const course = data.data.course;
        setSelectedCourse(course);
        
        // Populate form data for editing
        setFormData({
          title: course.title || '',
          subtitle: course.subtitle || '',
          description: course.description || '',
          category: course.category || 'programming',
          level: course.level || 'beginner',
          language: course.language || 'English',
          duration: course.duration || '',
          price: course.price || 0,
          original_price: course.original_price || 0,
          thumbnail_image: course.thumbnail_image || '',
          preview_video_url: course.preview_video_url || '',
          instructor_name: course.instructor_name || '',
          instructor_bio: course.instructor_bio || '',
          what_you_will_learn: Array.isArray(course.what_you_will_learn) ? course.what_you_will_learn.join('\n') : '',
          prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites.join('\n') : '',
          target_audience: Array.isArray(course.target_audience) ? course.target_audience.join('\n') : '',
          course_includes: Array.isArray(course.course_includes) ? course.course_includes.join('\n') : '',
          tags: Array.isArray(course.tags) ? course.tags.join(', ') : '',
          status: course.status || 'published',
          featured: course.featured || false
        });
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      enqueueSnackbar('Error fetching course details', { variant: 'error' });
    }
  };

  const fetchCourseSections = async (courseId: string) => {
    try {
      const response = await fetch(`${API_BASE}/courses/${courseId}/sections?uid=${profile?.id}`);
      const data = await response.json();
      
      if (data.success) {
        setCourseSections(data.data.sections || []);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      enqueueSnackbar('Error fetching sections', { variant: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      enqueueSnackbar('Admin UID not available', { variant: 'error' });
      return;
    }

    try {
      const submitData = {
        ...formData,
        what_you_will_learn: formData.what_you_will_learn.split('\n').filter(item => item.trim()),
        prerequisites: formData.prerequisites.split('\n').filter(item => item.trim()),
        target_audience: formData.target_audience.split('\n').filter(item => item.trim()),
        course_includes: formData.course_includes.split('\n').filter(item => item.trim()),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        uid: profile.id
      };

      const response = await fetch(`${API_BASE}/courses/${selectedCourse?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      
      if (data.success) {
        enqueueSnackbar('Course updated successfully', { variant: 'success' });
        navigate('/courses');
        fetchCourses();
      } else {
        throw new Error(data.error || 'Failed to save course');
      }
    } catch (error: any) {
      console.error('Error saving course:', error);
      enqueueSnackbar(error.message || 'Error saving course', { variant: 'error' });
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/courses/${courseId}?uid=${profile?.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        enqueueSnackbar('Course deleted successfully', { variant: 'success' });
        fetchCourses();
      } else {
        throw new Error(data.error || 'Failed to delete course');
      }
    } catch (error: any) {
      console.error('Error deleting course:', error);
      enqueueSnackbar(error.message || 'Error deleting course', { variant: 'error' });
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
    setSelectedCourse(null);
    setCourseSections([]);
  };

  // Section Management Functions
  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id || !selectedCourse) {
      enqueueSnackbar('Admin UID or course not available', { variant: 'error' });
      return;
    }

    try {
      const submitData = {
        ...sectionFormData,
        uid: profile.id
      };

      const url = selectedSection 
        ? `${API_BASE}/sections/${selectedSection.id}` 
        : `${API_BASE}/courses/${selectedCourse.id}/sections`;
      
      const method = selectedSection ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      
      if (data.success) {
        enqueueSnackbar(
          selectedSection ? 'Section updated successfully' : 'Section created successfully', 
          { variant: 'success' }
        );
        setShowSectionModal(false);
        setSelectedSection(null);
        setSectionFormData({ title: '', description: '', section_order: courseSections.length + 1 });
        fetchCourseSections(selectedCourse.id);
      } else {
        throw new Error(data.error || 'Failed to save section');
      }
    } catch (error: any) {
      console.error('Error saving section:', error);
      enqueueSnackbar(error.message || 'Error saving section', { variant: 'error' });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section? All lectures in this section will also be deleted.')) return;
    
    try {
      const response = await fetch(`${API_BASE}/sections/${sectionId}?uid=${profile?.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        enqueueSnackbar('Section deleted successfully', { variant: 'success' });
        if (selectedCourse) {
          fetchCourseSections(selectedCourse.id);
        }
      } else {
        throw new Error(data.error || 'Failed to delete section');
      }
    } catch (error: any) {
      console.error('Error deleting section:', error);
      enqueueSnackbar(error.message || 'Error deleting section', { variant: 'error' });
    }
  };

  // Lecture Management Functions
  const handleLectureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id || !selectedSection) {
      enqueueSnackbar('Admin UID or section not available', { variant: 'error' });
      return;
    }

    try {
      const submitData = {
        ...lectureFormData,
        uid: profile.id
      };

      // Check if we're editing an existing lecture
      const isEditing = lectureFormData.title && selectedSection.course_lectures?.some(l => l.title === lectureFormData.title);
      
      let url, method;
      if (isEditing) {
        // Find the lecture ID for editing
        const existingLecture = selectedSection.course_lectures?.find(l => l.title === lectureFormData.title);
        if (existingLecture) {
          url = `${API_BASE}/lectures/${existingLecture.id}`;
          method = 'PUT';
        } else {
          throw new Error('Lecture not found for editing');
        }
      } else {
        url = `${API_BASE}/sections/${selectedSection.id}/lectures`;
        method = 'POST';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      
      if (data.success) {
        enqueueSnackbar(
          isEditing ? 'Lecture updated successfully' : 'Lecture created successfully', 
          { variant: 'success' }
        );
        setShowLectureModal(false);
        setSelectedSection(null);
        setLectureFormData({
          title: '',
          description: '',
          lecture_type: 'video',
          video_url: '',
          video_duration_seconds: 0,
          article_content: '',
          resource_url: '',
          lecture_order: 1,
          is_preview: false,
          is_free: false
        });
        if (selectedCourse) {
          fetchCourseSections(selectedCourse.id);
        }
      } else {
        throw new Error(data.error || 'Failed to save lecture');
      }
    } catch (error: any) {
      console.error('Error saving lecture:', error);
      enqueueSnackbar(error.message || 'Error saving lecture', { variant: 'error' });
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/lectures/${lectureId}?uid=${profile?.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        enqueueSnackbar('Lecture deleted successfully', { variant: 'success' });
        if (selectedCourse) {
          fetchCourseSections(selectedCourse.id);
        }
      } else {
        throw new Error(data.error || 'Failed to delete lecture');
      }
    } catch (error: any) {
      console.error('Error deleting lecture:', error);
      enqueueSnackbar(error.message || 'Error deleting lecture', { variant: 'error' });
    }
  };

  // Computed values
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

  // Render Course List View
  const renderCourseList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <IconWrapper icon={FaGraduationCap} size={24} />
            </div>
            Course Management
          </h1>
          <p className="text-gray-600 mt-2">Manage your courses, sections, and lectures</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/courses/new')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <IconWrapper icon={FaPlus} size={16} />
          Create New Course
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <IconWrapper icon={FaSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.slug}>{category.name}</option>
            ))}
          </select>
          
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all-levels">All Levels</option>
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <IconWrapper icon={FaLayerGroup} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <IconWrapper icon={FaListOl} />
            </button>
          </div>
        </div>
      </div>

      {/* Course Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <IconWrapper icon={FaSpinner} className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${viewMode === 'list' ? 'flex' : ''}`}
            >
              {/* Course Image */}
              <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'}`}>
                <img
                  src={course.thumbnail_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {course.featured && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <IconWrapper icon={FaStar} size={12} />
                    Featured
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{course.title}</h3>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <IconWrapper icon={FaUser} size={12} />
                    {course.instructor_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <IconWrapper icon={FaClock} size={12} />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <IconWrapper icon={FaBookOpen} size={12} />
                    {course.total_lectures || 0} lectures
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">${course.price}</span>
                    {course.original_price && course.original_price > course.price && (
                      <span className="text-lg text-gray-400 line-through">${course.original_price}</span>
                    )}
                  </div>
                  
                  {course.rating && (
                    <div className="flex items-center gap-1">
                      <IconWrapper icon={FaStar} className="text-yellow-400" size={14} />
                      <span className="text-sm font-semibold">{course.rating}</span>
                      <span className="text-sm text-gray-500">({course.total_reviews})</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/courses/${course.id}/content`)}
                    className="flex-1 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg font-semibold hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <IconWrapper icon={FaVideo} size={14} />
                    Content
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/courses/view/${course.id}`)}
                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <IconWrapper icon={FaEye} size={14} />
                    View
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/courses/edit/${course.id}`)}
                    className="flex-1 px-4 py-2 bg-green-100 text-green-600 rounded-lg font-semibold hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <IconWrapper icon={FaEdit} size={14} />
                    Edit
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(course.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-colors flex items-center justify-center"
                  >
                    <IconWrapper icon={FaTrash} size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // Render Course Form (Create/Edit)
  const renderCourseForm = () => (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
            <IconWrapper icon={FaGraduationCap} size={24} />
          </div>
          {currentView === 'edit' ? 'Edit Course' : 'Create New Course'}
        </h1>
        
        <button
          onClick={() => navigate('/courses')}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <IconWrapper icon={FaTimes} size={14} />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <IconWrapper icon={FaBookOpen} className="text-blue-500" />
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail Image URL</label>
              <input
                type="url"
                value={formData.thumbnail_image}
                onChange={(e) => setFormData({ ...formData, thumbnail_image: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preview Video URL</label>
              <input
                type="url"
                value={formData.preview_video_url}
                onChange={(e) => setFormData({ ...formData, preview_video_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/video.mp4"
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
          >
            Cancel
          </button>
          
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <IconWrapper icon={FaSave} size={16} />
            {currentView === 'edit' ? 'Update Course' : 'Create Course'}
          </motion.button>
        </div>
      </form>
    </div>
  );

  // Render Course View
  const renderCourseView = () => {
    if (!selectedCourse) return null;

    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <IconWrapper icon={FaEye} size={24} />
            </div>
            Course Details
          </h1>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentView('sections');
                fetchCourseSections(selectedCourse.id);
              }}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
            >
              <IconWrapper icon={FaLayerGroup} size={14} />
              Manage Content
            </button>
            <button
              onClick={() => navigate(`/courses/edit/${selectedCourse.id}`)}
              className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
            >
              <IconWrapper icon={FaEdit} size={14} />
              Edit Course
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <IconWrapper icon={FaTimes} size={14} />
              Back to List
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Image and Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={selectedCourse.thumbnail_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                alt={selectedCourse.title}
                className="w-full h-64 object-cover"
              />
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedCourse.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedCourse.status}
                  </span>
                  
                  {selectedCourse.featured && (
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-semibold flex items-center gap-1">
                      <IconWrapper icon={FaStar} size={12} />
                      Featured
                    </span>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Price:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">${selectedCourse.price}</span>
                      {selectedCourse.original_price && selectedCourse.original_price > selectedCourse.price && (
                        <span className="text-lg text-gray-400 line-through">${selectedCourse.original_price}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{selectedCourse.duration}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-semibold capitalize">{selectedCourse.level}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-semibold">{selectedCourse.language}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-semibold">{selectedCourse.total_students || 0}</span>
                  </div>
                  
                  {selectedCourse.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        <IconWrapper icon={FaStar} className="text-yellow-400" size={14} />
                        <span className="font-semibold">{selectedCourse.rating}</span>
                        <span className="text-gray-500">({selectedCourse.total_reviews})</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedCourse.title}</h2>
              {selectedCourse.subtitle && (
                <p className="text-lg text-gray-600 mb-4">{selectedCourse.subtitle}</p>
              )}
              <p className="text-gray-700 leading-relaxed">{selectedCourse.description}</p>
            </div>

            {/* Instructor Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <IconWrapper icon={FaUser} className="text-purple-500" />
                Instructor
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedCourse.instructor_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedCourse.instructor_name}</h4>
                  {selectedCourse.instructor_bio && (
                    <p className="text-gray-600 mt-2">{selectedCourse.instructor_bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Learning Outcomes */}
            {selectedCourse.what_you_will_learn && selectedCourse.what_you_will_learn.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <IconWrapper icon={FaLightbulb} className="text-yellow-500" />
                  What You'll Learn
                </h3>
                <ul className="space-y-2">
                  {selectedCourse.what_you_will_learn.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <IconWrapper icon={FaCheck} className="text-green-500 mt-1 flex-shrink-0" size={14} />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Prerequisites</h3>
                <ul className="space-y-2">
                  {selectedCourse.prerequisites.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {selectedCourse.tags && selectedCourse.tags.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Sections Management View
  const renderSectionsManagement = () => {
    if (!selectedCourse) return null;

    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <IconWrapper icon={FaLayerGroup} size={24} />
            </div>
            Course Content Management
          </h1>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowSectionModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <IconWrapper icon={FaPlus} size={14} />
              Add Section
            </button>
            <button
              onClick={() => navigate(`/courses/view/${selectedCourse.id}`)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <IconWrapper icon={FaTimes} size={14} />
              Back to Course
            </button>
          </div>
        </div>

        {/* Course Info Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={selectedCourse.thumbnail_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
              alt={selectedCourse.title}
              className="w-20 h-20 object-cover rounded-xl"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
              <p className="text-gray-600">{selectedCourse.subtitle}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>{courseSections.length} sections</span>
                <span>{courseSections.reduce((total, section) => total + (section.course_lectures?.length || 0), 0)} lectures</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sections List */}
        <div className="space-y-6">
          {courseSections.map((section, sectionIndex) => (
            <div key={section.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Section Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Section {section.section_order}: {section.title}
                    </h3>
                    {section.description && (
                      <p className="text-gray-600 mt-1">{section.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{section.course_lectures?.length || 0} lectures</span>
                      {section.duration_minutes && (
                        <span>{Math.floor(section.duration_minutes / 60)}h {section.duration_minutes % 60}m</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedSection(section);
                        setShowLectureModal(true);
                        setLectureFormData({
                          ...lectureFormData,
                          lecture_order: (section.course_lectures?.length || 0) + 1
                        });
                      }}
                      className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                    >
                      <IconWrapper icon={FaPlus} size={12} />
                      Add Lecture
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedSection(section);
                        setSectionFormData({
                          title: section.title,
                          description: section.description || '',
                          section_order: section.section_order
                        });
                        setShowSectionModal(true);
                      }}
                      className="px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <IconWrapper icon={FaEdit} size={12} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <IconWrapper icon={FaTrash} size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Lectures List */}
              {section.course_lectures && section.course_lectures.length > 0 && (
                <div className="p-6">
                  <div className="space-y-3">
                    {section.course_lectures.map((lecture, lectureIndex) => (
                      <div key={lecture.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {lecture.lecture_type === 'video' && <IconWrapper icon={FaVideo} className="text-blue-600" size={16} />}
                            {lecture.lecture_type === 'article' && <IconWrapper icon={FaFileAlt} className="text-green-600" size={16} />}
                            {lecture.lecture_type === 'quiz' && <IconWrapper icon={FaQuestionCircle} className="text-purple-600" size={16} />}
                            {lecture.lecture_type === 'assignment' && <IconWrapper icon={FaEdit} className="text-orange-600" size={16} />}
                            {lecture.lecture_type === 'resource' && <IconWrapper icon={FaDownload} className="text-gray-600" size={16} />}
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900">{lecture.title}</h4>
                            {lecture.description && (
                              <p className="text-sm text-gray-600">{lecture.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full capitalize">
                                {lecture.lecture_type}
                              </span>
                              {lecture.video_duration_seconds && (
                                <span className="text-xs text-gray-500">
                                  {Math.floor(lecture.video_duration_seconds / 60)}:{(lecture.video_duration_seconds % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                              {lecture.is_preview && (
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                                  Preview
                                </span>
                              )}
                              {lecture.is_free && (
                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full">
                                  Free
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSection(section);
                              setLectureFormData({
                                title: lecture.title,
                                description: lecture.description || '',
                                lecture_type: lecture.lecture_type,
                                video_url: lecture.video_url || '',
                                video_duration_seconds: lecture.video_duration_seconds || 0,
                                article_content: lecture.article_content || '',
                                resource_url: lecture.resource_url || '',
                                lecture_order: lecture.lecture_order,
                                is_preview: lecture.is_preview,
                                is_free: lecture.is_free
                              });
                              setShowLectureModal(true);
                            }}
                            className="px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <IconWrapper icon={FaEdit} size={12} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteLecture(lecture.id)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <IconWrapper icon={FaTrash} size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(!section.course_lectures || section.course_lectures.length === 0) && (
                <div className="p-6 text-center text-gray-500">
                  <IconWrapper icon={FaVideo} className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No lectures in this section yet.</p>
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      setShowLectureModal(true);
                      setLectureFormData({
                        ...lectureFormData,
                        lecture_order: 1
                      });
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Lecture
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {courseSections.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <IconWrapper icon={FaLayerGroup} className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No sections yet</h3>
              <p className="text-gray-600 mb-6">Start building your course by adding the first section.</p>
              <button
                onClick={() => setShowSectionModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <IconWrapper icon={FaPlus} size={16} />
                Create First Section
              </button>
            </div>
          )}
        </div>

        {/* Section Modal */}
        {showSectionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedSection ? 'Edit Section' : 'Create New Section'}
                </h3>
              </div>
              
              <form onSubmit={handleSectionSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title *</label>
                  <input
                    type="text"
                    value={sectionFormData.title}
                    onChange={(e) => setSectionFormData({ ...sectionFormData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter section title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={sectionFormData.description}
                    onChange={(e) => setSectionFormData({ ...sectionFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter section description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Section Order *</label>
                  <input
                    type="number"
                    value={sectionFormData.section_order}
                    onChange={(e) => setSectionFormData({ ...sectionFormData, section_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSectionModal(false);
                      setSelectedSection(null);
                      setSectionFormData({ title: '', description: '', section_order: courseSections.length + 1 });
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <IconWrapper icon={FaSave} size={16} />
                    {selectedSection ? 'Update Section' : 'Create Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lecture Modal */}
        {showLectureModal && selectedSection && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {lectureFormData.title ? 'Edit Lecture' : 'Create New Lecture'}
                </h3>
                <p className="text-gray-600 mt-1">Section: {selectedSection.title}</p>
              </div>
              
              <form onSubmit={handleLectureSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lecture Title *</label>
                    <input
                      type="text"
                      value={lectureFormData.title}
                      onChange={(e) => setLectureFormData({ ...lectureFormData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter lecture title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lecture Type *</label>
                    <select
                      value={lectureFormData.lecture_type}
                      onChange={(e) => setLectureFormData({ ...lectureFormData, lecture_type: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="video">Video</option>
                      <option value="article">Article</option>
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Assignment</option>
                      <option value="resource">Resource</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={lectureFormData.description}
                    onChange={(e) => setLectureFormData({ ...lectureFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter lecture description"
                  />
                </div>
                
                {lectureFormData.lecture_type === 'video' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL</label>
                      <input
                        type="url"
                        value={lectureFormData.video_url}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, video_url: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (seconds)</label>
                      <input
                        type="number"
                        value={lectureFormData.video_duration_seconds}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, video_duration_seconds: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                )}
                
                {lectureFormData.lecture_type === 'article' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Article Content</label>
                    <textarea
                      value={lectureFormData.article_content}
                      onChange={(e) => setLectureFormData({ ...lectureFormData, article_content: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter article content (supports markdown)"
                    />
                  </div>
                )}
                
                {lectureFormData.lecture_type === 'resource' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Resource URL</label>
                    <input
                      type="url"
                      value={lectureFormData.resource_url}
                      onChange={(e) => setLectureFormData({ ...lectureFormData, resource_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/resource.pdf"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lecture Order</label>
                    <input
                      type="number"
                      value={lectureFormData.lecture_order}
                      onChange={(e) => setLectureFormData({ ...lectureFormData, lecture_order: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lectureFormData.is_preview}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, is_preview: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${lectureFormData.is_preview ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${lectureFormData.is_preview ? 'translate-x-6' : ''}`} />
                      </div>
                      <span className="ml-3 text-sm font-semibold text-gray-700">Preview</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lectureFormData.is_free}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, is_free: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${lectureFormData.is_free ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${lectureFormData.is_free ? 'translate-x-6' : ''}`} />
                      </div>
                      <span className="ml-3 text-sm font-semibold text-gray-700">Free</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLectureModal(false);
                      setSelectedSection(null);
                      setLectureFormData({
                        title: '',
                        description: '',
                        lecture_type: 'video',
                        video_url: '',
                        video_duration_seconds: 0,
                        article_content: '',
                        resource_url: '',
                        lecture_order: 1,
                        is_preview: false,
                        is_free: false
                      });
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <IconWrapper icon={FaSave} size={16} />
                    {lectureFormData.title ? 'Update Lecture' : 'Create Lecture'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main render
  return (
    <MainLayout title="Course Management">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {currentView === 'list' && renderCourseList()}
        {currentView === 'edit' && renderCourseForm()}
        {currentView === 'view' && renderCourseView()}
        {currentView === 'sections' && renderSectionsManagement()}
      </div>
    </MainLayout>
  );
};

export default Courses; 