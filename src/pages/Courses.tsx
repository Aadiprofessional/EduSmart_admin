import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { motion } from 'framer-motion';
import { 
  MdSearch, 
  MdEdit, 
  MdDelete, 
  MdAdd, 
  MdRefresh,
  MdWarning,
  MdVisibility,
  MdFeaturedPlayList,
  MdOutlineFeaturedPlayList
} from 'react-icons/md';
import { IconType } from 'react-icons';
import { Course } from '../utils/types';
import { getCourses, deleteCourse, updateCourse } from '../utils/api';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { renderIcon } from '../utils/IconWrapper';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter courses when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchTerm, courses]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCourses();
      setCourses(data);
      setFilteredCourses(data);
    } catch (err) {
      setError('Failed to fetch courses. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      enqueueSnackbar('Course deleted successfully', { variant: 'success' });
      fetchCourses(); // Refresh course list
      setShowConfirmDelete(false);
    } catch (err) {
      enqueueSnackbar('Failed to delete course', { variant: 'error' });
      console.error(err);
    }
  };

  const handleEditCourse = (course: Course) => {
    navigate(`/courses/edit/${course.id}`, { state: { course } });
  };

  const handleViewCourse = (course: Course) => {
    navigate(`/courses/view/${course.id}`, { state: { course } });
  };

  const handleAddCourse = () => {
    navigate('/courses/new');
  };

  const handleToggleFeatured = async (course: Course) => {
    try {
      await updateCourse(course.id, { is_featured: !course.is_featured });
      enqueueSnackbar(
        `Course ${course.is_featured ? 'removed from' : 'marked as'} featured`, 
        { variant: 'success' }
      );
      fetchCourses();
    } catch (err) {
      enqueueSnackbar('Failed to update course', { variant: 'error' });
      console.error(err);
    }
  };

  return (
    <MainLayout title="Course Management">
      <div className="p-4">
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold mb-4 md:mb-0">Courses</h1>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {renderIcon(MdSearch, { className: "absolute left-3 top-3 text-gray-400", size: 20 })}
            </div>
            <button
              onClick={fetchCourses}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 mr-2"
              title="Refresh"
            >
              {renderIcon(MdRefresh, { size: 24 })}
            </button>
            <button
              onClick={handleAddCourse}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              {renderIcon(MdAdd, { className: "mr-1", size: 20 })} Add Course
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex items-center">
            {renderIcon(MdWarning, { className: "mr-2", size: 24 })}
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12"
          >
            <div className="loader rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600 w-12 h-12 animate-spin"></div>
          </motion.div>
        ) : (
          <>
            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-lg shadow overflow-hidden"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {course.image_url ? (
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      {course.is_featured && (
                        <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold uppercase px-2 py-1 rounded text-gray-800">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1 truncate">{course.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {course.instructor_name ? `By ${course.instructor_name}` : 'No instructor'}
                      </p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-600">{course.category || 'Uncategorized'}</span>
                        <span className="text-sm font-bold text-blue-600">
                          {course.price ? formatCurrency(course.price) : 'Free'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                        <span>{course.level || 'All Levels'}</span>
                        <span>{course.duration || 'Self-paced'}</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewCourse(course)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                            title="View Details"
                          >
                            {renderIcon(MdVisibility, { size: 18 })}
                          </button>
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"
                            title="Edit Course"
                          >
                            {renderIcon(MdEdit, { size: 18 })}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setShowConfirmDelete(true);
                            }}
                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                            title="Delete Course"
                          >
                            {renderIcon(MdDelete, { size: 18 })}
                          </button>
                        </div>
                        <button
                          onClick={() => handleToggleFeatured(course)}
                          className={`p-1.5 rounded ${
                            course.is_featured
                              ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                          title={course.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                        >
                          {course.is_featured ? 
                            renderIcon(MdFeaturedPlayList, { size: 18 }) : 
                            renderIcon(MdOutlineFeaturedPlayList, { size: 18 })
                          }
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  No courses found. {searchTerm ? 'Try a different search term.' : 'Add your first course.'}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {showConfirmDelete && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete the course <span className="font-semibold">{selectedCourse.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCourse(selectedCourse.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </MainLayout>
  );
};

export default Courses; 