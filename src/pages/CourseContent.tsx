import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaVideo,
  FaFileAlt,
  FaQuestionCircle,
  FaTasks,
  FaDownload,
  FaUsers,
  FaChartLine,
  FaEye,
  FaChevronDown,
  FaChevronUp,
  FaSave,
  FaTimes,
  FaSpinner,
  FaPlay,
  FaClock,
  FaGraduationCap,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';
import { useAuth } from '../utils/AuthContext';

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
  thumbnail_image?: string;
  instructor_name: string;
  status: string;
  featured: boolean;
  total_students?: number;
  total_lectures?: number;
  total_sections?: number;
  created_at: string;
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

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  progress_percentage: number;
  completed_lectures: number;
  enrolled_at: string;
  last_accessed_at?: string;
  completed_at?: string;
  profiles?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

const CourseContent: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { profile } = useAuth();
  
  // State management
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'enrollments' | 'analytics'>('content');
  
  // Content management state
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [editingSection, setEditingSection] = useState<CourseSection | null>(null);
  const [editingLecture, setEditingLecture] = useState<CourseLecture | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Form data
  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: '',
    section_order: 1
  });
  
  const [lectureForm, setLectureForm] = useState({
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

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  // API Functions
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCourseDetails(),
        fetchCourseSections(),
        fetchCourseEnrollments()
      ]);
    } catch (error) {
      console.error('Error fetching course data:', error);
      enqueueSnackbar('Error loading course data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async () => {
    const response = await fetch(`${API_BASE}/courses/${courseId}`);
    const data = await response.json();
    
    if (data.success) {
      setCourse(data.data.course);
    } else {
      throw new Error(data.error || 'Failed to fetch course details');
    }
  };

  const fetchCourseSections = async () => {
    const response = await fetch(`${API_BASE}/courses/${courseId}/sections?uid=${profile?.id}`);
    const data = await response.json();
    
    if (data.success) {
      setSections(data.data.sections || []);
      // Expand all sections by default
      setExpandedSections(data.data.sections?.map((s: CourseSection) => s.id) || []);
    } else {
      throw new Error(data.error || 'Failed to fetch course sections');
    }
  };

  const fetchCourseEnrollments = async () => {
    try {
      // This would need a new API endpoint to get course enrollments
      // For now, we'll use a placeholder
      setEnrollments([]);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  // Section Management
  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingSection 
        ? `${API_BASE}/sections/${editingSection.id}`
        : `${API_BASE}/courses/${courseId}/sections`;
      
      const method = editingSection ? 'PUT' : 'POST';
      
      const requestBody = {
        ...sectionForm,
        uid: profile?.id
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (data.success) {
        enqueueSnackbar(
          editingSection ? 'Section updated successfully' : 'Section created successfully',
          { variant: 'success' }
        );
        setShowSectionForm(false);
        setEditingSection(null);
        setSectionForm({ title: '', description: '', section_order: 1 });
        await fetchCourseSections();
      } else {
        throw new Error(data.error || 'Failed to save section');
      }
    } catch (error: any) {
      console.error('Error saving section:', error);
      enqueueSnackbar(error.message || 'Error saving section', { variant: 'error' });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    setConfirmMessage('Are you sure you want to delete this section? This will also delete all lectures in this section.');
    setConfirmAction(() => async () => {
      try {
        const response = await fetch(`${API_BASE}/sections/${sectionId}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        
        if (data.success) {
          enqueueSnackbar('Section deleted successfully', { variant: 'success' });
          await fetchCourseSections();
        } else {
          throw new Error(data.error || 'Failed to delete section');
        }
      } catch (error: any) {
        console.error('Error deleting section:', error);
        enqueueSnackbar(error.message || 'Error deleting section', { variant: 'error' });
      }
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  // Lecture Management
  const handleLectureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingLecture 
        ? `${API_BASE}/lectures/${editingLecture.id}`
        : `${API_BASE}/sections/${selectedSectionId}/lectures`;
      
      const method = editingLecture ? 'PUT' : 'POST';
      
      const requestBody = {
        ...lectureForm,
        uid: profile?.id
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (data.success) {
        enqueueSnackbar(
          editingLecture ? 'Lecture updated successfully' : 'Lecture created successfully',
          { variant: 'success' }
        );
        setShowLectureForm(false);
        setEditingLecture(null);
        setSelectedSectionId('');
        setLectureForm({
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
        await fetchCourseSections();
      } else {
        throw new Error(data.error || 'Failed to save lecture');
      }
    } catch (error: any) {
      console.error('Error saving lecture:', error);
      enqueueSnackbar(error.message || 'Error saving lecture', { variant: 'error' });
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    setConfirmMessage('Are you sure you want to delete this lecture?');
    setConfirmAction(() => async () => {
      try {
        const response = await fetch(`${API_BASE}/lectures/${lectureId}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        
        if (data.success) {
          enqueueSnackbar('Lecture deleted successfully', { variant: 'success' });
          await fetchCourseSections();
        } else {
          throw new Error(data.error || 'Failed to delete lecture');
        }
      } catch (error: any) {
        console.error('Error deleting lecture:', error);
        enqueueSnackbar(error.message || 'Error deleting lecture', { variant: 'error' });
      }
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  // Utility functions
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getLectureIcon = (type: string) => {
    switch (type) {
      case 'video': return FaVideo;
      case 'article': return FaFileAlt;
      case 'quiz': return FaQuestionCircle;
      case 'assignment': return FaTasks;
      case 'resource': return FaDownload;
      default: return FaFileAlt;
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (loading) {
    return (
      <MainLayout title="Course Content">
        <div className="flex justify-center items-center h-64">
          <IconWrapper icon={FaSpinner} className="animate-spin text-4xl text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout title="Course Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${course.title} - Content Management`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/courses')}
                className="p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <IconWrapper icon={FaArrowLeft} size={20} />
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600 mt-1">Manage course content and enrollments</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white rounded-xl shadow-md">
                <span className="text-sm text-gray-600">Status: </span>
                <span className={`font-semibold capitalize ${
                  course.status === 'published' ? 'text-green-600' : 
                  course.status === 'draft' ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {course.status}
                </span>
              </div>
            </div>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <IconWrapper icon={FaUsers} className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{course.total_students || 0}</p>
                  <p className="text-gray-600">Students</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <IconWrapper icon={FaGraduationCap} className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{sections.length}</p>
                  <p className="text-gray-600">Sections</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <IconWrapper icon={FaVideo} className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {sections.reduce((acc, section) => acc + (section.course_lectures?.length || 0), 0)}
                  </p>
                  <p className="text-gray-600">Lectures</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <IconWrapper icon={FaClock} className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{course.duration}</p>
                  <p className="text-gray-600">Duration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg mb-8">
            <div className="flex border-b border-gray-200">
              {[
                { id: 'content', label: 'Course Content', icon: FaVideo },
                { id: 'enrollments', label: 'Enrollments', icon: FaUsers },
                { id: 'analytics', label: 'Analytics', icon: FaChartLine }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconWrapper icon={tab.icon} size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Course Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  {/* Add Section Button */}
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Course Sections</h2>
                    <button
                      onClick={() => {
                        setShowSectionForm(true);
                        setEditingSection(null);
                        setSectionForm({ 
                          title: '', 
                          description: '', 
                          section_order: sections.length + 1 
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <IconWrapper icon={FaPlus} size={14} />
                      Add Section
                    </button>
                  </div>

                  {/* Sections List */}
                  <div className="space-y-4">
                    {sections.map((section, index) => (
                      <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Section Header */}
                        <div className="bg-gray-50 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => toggleSection(section.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <IconWrapper 
                                  icon={expandedSections.includes(section.id) ? FaChevronUp : FaChevronDown} 
                                  size={16} 
                                />
                              </button>
                              
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Section {section.section_order}: {section.title}
                                </h3>
                                {section.description && (
                                  <p className="text-gray-600 text-sm mt-1">{section.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span>{section.course_lectures?.length || 0} lectures</span>
                                  {section.duration_minutes && (
                                    <span>{Math.floor(section.duration_minutes / 60)}h {section.duration_minutes % 60}m</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSectionId(section.id);
                                  setShowLectureForm(true);
                                  setEditingLecture(null);
                                  setLectureForm({
                                    title: '',
                                    description: '',
                                    lecture_type: 'video',
                                    video_url: '',
                                    video_duration_seconds: 0,
                                    article_content: '',
                                    resource_url: '',
                                    lecture_order: (section.course_lectures?.length || 0) + 1,
                                    is_preview: false,
                                    is_free: false
                                  });
                                }}
                                className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 text-sm"
                              >
                                <IconWrapper icon={FaPlus} size={12} />
                                Add Lecture
                              </button>
                              
                              <button
                                onClick={() => {
                                  setEditingSection(section);
                                  setSectionForm({
                                    title: section.title,
                                    description: section.description || '',
                                    section_order: section.section_order
                                  });
                                  setShowSectionForm(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <IconWrapper icon={FaEdit} size={14} />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteSection(section.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <IconWrapper icon={FaTrash} size={14} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Section Content */}
                        {expandedSections.includes(section.id) && section.course_lectures && (
                          <div className="px-6 py-4 space-y-3">
                            {section.course_lectures.map((lecture, lectureIndex) => (
                              <div key={lecture.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                    <IconWrapper icon={getLectureIcon(lecture.lecture_type)} size={16} />
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{lecture.title}</h4>
                                    {lecture.description && (
                                      <p className="text-sm text-gray-600 mt-1">{lecture.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                      <span className="capitalize">{lecture.lecture_type}</span>
                                      {lecture.video_duration_seconds && (
                                        <span>{formatDuration(lecture.video_duration_seconds)}</span>
                                      )}
                                      {lecture.is_preview && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded">Preview</span>
                                      )}
                                      {lecture.is_free && (
                                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded">Free</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingLecture(lecture);
                                      setSelectedSectionId(section.id);
                                      setLectureForm({
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
                                      setShowLectureForm(true);
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  >
                                    <IconWrapper icon={FaEdit} size={14} />
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteLecture(lecture.id)}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  >
                                    <IconWrapper icon={FaTrash} size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            
                            {(!section.course_lectures || section.course_lectures.length === 0) && (
                              <div className="text-center py-8 text-gray-500">
                                <IconWrapper icon={FaVideo} className="text-4xl mx-auto mb-4 opacity-50" />
                                <p>No lectures in this section yet.</p>
                                <button
                                  onClick={() => {
                                    setSelectedSectionId(section.id);
                                    setShowLectureForm(true);
                                    setEditingLecture(null);
                                    setLectureForm({
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
                                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Add First Lecture
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {sections.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <IconWrapper icon={FaGraduationCap} className="text-4xl mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No sections created yet.</p>
                        <p className="mb-4">Start building your course by adding the first section.</p>
                        <button
                          onClick={() => {
                            setShowSectionForm(true);
                            setEditingSection(null);
                            setSectionForm({ title: '', description: '', section_order: 1 });
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Create First Section
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enrollments Tab */}
              {activeTab === 'enrollments' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Course Enrollments</h2>
                  
                  <div className="text-center py-12 text-gray-500">
                    <IconWrapper icon={FaUsers} className="text-4xl mx-auto mb-4 opacity-50" />
                    <p>Enrollment management coming soon...</p>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Course Analytics</h2>
                  
                  <div className="text-center py-12 text-gray-500">
                    <IconWrapper icon={FaChartLine} className="text-4xl mx-auto mb-4 opacity-50" />
                    <p>Analytics dashboard coming soon...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Form Modal */}
        <AnimatePresence>
          {showSectionForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingSection ? 'Edit Section' : 'Add New Section'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowSectionForm(false);
                        setEditingSection(null);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <IconWrapper icon={FaTimes} size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSectionSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title *</label>
                      <input
                        type="text"
                        value={sectionForm.title}
                        onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter section title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={sectionForm.description}
                        onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter section description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Section Order</label>
                      <input
                        type="number"
                        value={sectionForm.section_order}
                        onChange={(e) => setSectionForm({ ...sectionForm, section_order: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSectionForm(false);
                          setEditingSection(null);
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
                        {editingSection ? 'Update Section' : 'Create Section'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lecture Form Modal */}
        <AnimatePresence>
          {showLectureForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingLecture ? 'Edit Lecture' : 'Add New Lecture'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowLectureForm(false);
                        setEditingLecture(null);
                        setSelectedSectionId('');
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <IconWrapper icon={FaTimes} size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleLectureSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Lecture Title *</label>
                        <input
                          type="text"
                          value={lectureForm.title}
                          onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter lecture title"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Lecture Type *</label>
                        <select
                          value={lectureForm.lecture_type}
                          onChange={(e) => setLectureForm({ ...lectureForm, lecture_type: e.target.value as any })}
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
                        value={lectureForm.description}
                        onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter lecture description"
                      />
                    </div>

                    {/* Conditional fields based on lecture type */}
                    {lectureForm.lecture_type === 'video' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL</label>
                          <input
                            type="url"
                            value={lectureForm.video_url}
                            onChange={(e) => setLectureForm({ ...lectureForm, video_url: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/video.mp4"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (seconds)</label>
                          <input
                            type="number"
                            value={lectureForm.video_duration_seconds}
                            onChange={(e) => setLectureForm({ ...lectureForm, video_duration_seconds: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                          />
                        </div>
                      </div>
                    )}

                    {lectureForm.lecture_type === 'article' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Article Content</label>
                        <textarea
                          value={lectureForm.article_content}
                          onChange={(e) => setLectureForm({ ...lectureForm, article_content: e.target.value })}
                          rows={8}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter article content (supports markdown)"
                        />
                      </div>
                    )}

                    {(lectureForm.lecture_type === 'resource' || lectureForm.lecture_type === 'assignment') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Resource URL</label>
                        <input
                          type="url"
                          value={lectureForm.resource_url}
                          onChange={(e) => setLectureForm({ ...lectureForm, resource_url: e.target.value })}
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
                          value={lectureForm.lecture_order}
                          onChange={(e) => setLectureForm({ ...lectureForm, lecture_order: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                          required
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lectureForm.is_preview}
                            onChange={(e) => setLectureForm({ ...lectureForm, is_preview: e.target.checked })}
                            className="sr-only"
                          />
                          <div className={`relative w-12 h-6 rounded-full transition-colors ${lectureForm.is_preview ? 'bg-blue-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${lectureForm.is_preview ? 'translate-x-6' : ''}`} />
                          </div>
                          <span className="ml-3 text-sm font-semibold text-gray-700">Preview Lecture</span>
                        </label>
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lectureForm.is_free}
                            onChange={(e) => setLectureForm({ ...lectureForm, is_free: e.target.checked })}
                            className="sr-only"
                          />
                          <div className={`relative w-12 h-6 rounded-full transition-colors ${lectureForm.is_free ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${lectureForm.is_free ? 'translate-x-6' : ''}`} />
                          </div>
                          <span className="ml-3 text-sm font-semibold text-gray-700">Free Lecture</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowLectureForm(false);
                          setEditingLecture(null);
                          setSelectedSectionId('');
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
                        {editingLecture ? 'Update Lecture' : 'Create Lecture'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Dialog */}
        <AnimatePresence>
          {showConfirmDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <IconWrapper icon={FaTimesCircle} className="text-red-600" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{confirmMessage}</p>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowConfirmDialog(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmAction}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default CourseContent; 