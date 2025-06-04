import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaBookOpen,
  FaCalendarAlt,
  FaUser,
  FaTags,
  FaGlobe,
  FaRocket,
  FaStar,
  FaHeart
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';
import { useAuth } from '../utils/AuthContext';
import { blogAPI } from '../utils/apiService';

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  image: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
    avatar_url?: string;
  };
}

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    image: ''
  });

  const { enqueueSnackbar } = useSnackbar();
  const { getAdminUID } = useAuth();

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getAll();
      if (response.success) {
        // Handle the API response structure
        let blogsData = response.data;
        
        // The API returns { blogs: [...], pagination: {...} }
        if (blogsData && blogsData.blogs) {
          blogsData = blogsData.blogs;
        }
        
        // Ensure we always set an array
        setBlogs(Array.isArray(blogsData) ? blogsData : []);
      } else {
        console.error('Failed to fetch blogs:', response.error);
        enqueueSnackbar('Failed to fetch blogs', { variant: 'error' });
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      enqueueSnackbar('Error fetching blogs', { variant: 'error' });
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await blogAPI.getCategories();
      if (response.success && response.data && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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
    if (!formData.content || formData.content.length < 50) {
      errors.push('Content must be at least 50 characters');
    }
    if (!formData.excerpt || formData.excerpt.trim() === '') {
      errors.push('Excerpt is required');
    }
    if (!formData.category || formData.category.trim() === '') {
      errors.push('Category is required');
    }
    if (formData.image && formData.image.trim() !== '') {
      try {
        new URL(formData.image);
      } catch {
        errors.push('Image must be a valid URL');
      }
    }

    if (errors.length > 0) {
      enqueueSnackbar(errors.join(', '), { variant: 'error' });
      return;
    }
    
    try {
      const submitData = {
        author_id: adminUID,
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim(),
        category: formData.category.trim(),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [],
        image_url: formData.image.trim() || undefined,
        is_published: true,
        author_name: 'Admin'
      };

      console.log('Submitting blog data:', submitData);
      console.log('Admin UID:', adminUID);

      let response;
      if (editingBlog) {
        response = await blogAPI.update(editingBlog.id, submitData, adminUID);
      } else {
        response = await blogAPI.create(submitData, adminUID);
      }

      console.log('API Response:', response);

      if (response.success) {
        enqueueSnackbar(editingBlog ? 'Blog updated successfully' : 'Blog created successfully', { variant: 'success' });
        fetchBlogs();
        fetchCategories(); // Refresh categories in case a new one was added
        handleCloseModal();
      } else {
        // Handle server validation errors more gracefully
        console.error('Server validation error:', response);
        console.error('Error details:', response.details);
        
        let errorMessage = 'Failed to save blog';
        if (response.error) {
          errorMessage = response.error;
        }
        
        // If there are detailed validation errors, show them
        if (response.details && response.details.errors && Array.isArray(response.details.errors)) {
          console.error('Validation errors array:', response.details.errors);
          errorMessage = `Validation errors: ${response.details.errors.join(', ')}`;
        }
        
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    } catch (error: any) {
      console.error('Error saving blog:', error);
      
      // Extract more detailed error information
      let errorMessage = 'Error saving blog';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    const adminUID = getAdminUID();
    if (!adminUID) {
      enqueueSnackbar('Admin UID not available', { variant: 'error' });
      return;
    }

    try {
      const response = await blogAPI.delete(id, adminUID);
      if (response.success) {
        enqueueSnackbar('Blog deleted successfully', { variant: 'success' });
        fetchBlogs();
      } else {
        throw new Error(response.error || 'Failed to delete blog');
      }
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      enqueueSnackbar(error.message || 'Error deleting blog', { variant: 'error' });
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      category: blog.category,
      tags: blog.tags?.join(', ') || '',
      image: blog.image || ''
    });
    setIsViewModalOpen(false);
    setIsModalOpen(true);
  };

  const handleView = (blog: Blog) => {
    setViewingBlog(blog);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      tags: '',
      image: ''
    });
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingBlog(null);
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxWords: number) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const filteredBlogs = Array.isArray(blogs) ? blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (blog.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || blog.category === filterCategory;

    return matchesSearch && matchesCategory;
  }) : [];

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
      <MainLayout title="Blog Management">
        <div className="flex justify-center items-center h-64">
          <motion.div 
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Blog Management">
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Futuristic Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 backdrop-blur-sm"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <motion.h1 
                className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Blog Management
              </motion.h1>
              <motion.p 
                className="text-blue-100 text-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Create and manage engaging content for your audience
              </motion.p>
            </div>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center gap-3 transition-all duration-300 border border-white/30"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <IconWrapper icon={FaRocket} />
              Create Blog Post
            </motion.button>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <IconWrapper icon={FaSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search blogs, authors, content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white shadow-lg' 
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
              }}
              className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300"
            >
              Clear All
            </button>
          </div>
        </motion.div>

        {/* Blog Posts Grid/List */}
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
            {filteredBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                variants={itemVariants}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 ${
                  viewMode === 'grid' 
                    ? 'bg-white border border-gray-200/50' 
                    : 'bg-white border border-gray-200/50 flex'
                }`}
                whileHover={{ y: -8, scale: 1.02 }}
                layout
              >
                {/* Blog Image */}
                <div className={`relative overflow-hidden ${
                  viewMode === 'grid' ? 'h-48' : 'w-48 h-32'
                }`}>
                  {blog.image ? (
                    <img 
                      src={blog.image} 
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <IconWrapper icon={FaBookOpen} className="text-white text-3xl" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-blue-500/80 text-white">
                      {blog.category}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                      onClick={() => handleEdit(blog)}
                      className="p-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconWrapper icon={FaEdit} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(blog.id)}
                      className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconWrapper icon={FaTrash} />
                    </motion.button>
                  </div>
                </div>

                {/* Blog Content */}
                <div className={`p-6 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {truncateText(blog.excerpt, 20)}
                    </p>

                    {/* Meta Information */}
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <IconWrapper icon={FaUser} className="text-blue-500" />
                        <span>{blog.author?.name || 'Unknown Author'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconWrapper icon={FaCalendarAlt} className="text-green-500" />
                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{blog.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Read More Button */}
                  <motion.button
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleView(blog)}
                  >
                    <IconWrapper icon={FaEye} />
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredBlogs.length === 0 && (
          <motion.div 
            className="text-center py-16"
            variants={itemVariants}
          >
            <motion.div
              className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6"
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
              <IconWrapper icon={FaBookOpen} className="text-white text-3xl" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No blog posts found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory ? 'Try adjusting your filters' : 'Get started by creating your first blog post'}
            </p>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconWrapper icon={FaPlus} />
              Create Your First Blog Post
            </motion.button>
          </motion.div>
        )}

        {/* Futuristic Modal */}
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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
                    </h2>
                    <motion.button
                      onClick={handleCloseModal}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title * <span className="text-xs text-gray-500">({formData.title.length}/200 characters)</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 ${
                            formData.title.length > 0 && (formData.title.length < 5 || formData.title.length > 200)
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-gray-300/50'
                          }`}
                          placeholder="Enter blog title (5-200 characters)..."
                        />
                        {formData.title.length > 0 && (formData.title.length < 5 || formData.title.length > 200) && (
                          <p className="text-red-500 text-xs mt-1">Title must be between 5 and 200 characters</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 ${
                            formData.category === '' ? 'border-red-300 focus:ring-red-500' : 'border-gray-300/50'
                          }`}
                        >
                          <option value="">Select a category</option>
                          {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                          ))}
                          <option value="Technology">Technology</option>
                          <option value="Education">Education</option>
                          <option value="Programming">Programming</option>
                          <option value="Career">Career</option>
                          <option value="Study Tips">Study Tips</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Category (if not in list)
                        </label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="Enter custom category..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Featured Image URL
                        </label>
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 ${
                            formData.image && formData.image.trim() !== '' && (() => {
                              try { new URL(formData.image); return false; } catch { return true; }
                            })() ? 'border-red-300 focus:ring-red-500' : 'border-gray-300/50'
                          }`}
                          placeholder="https://example.com/image.jpg (optional)"
                        />
                        {formData.image && formData.image.trim() !== '' && (() => {
                          try { new URL(formData.image); return false; } catch { return true; }
                        })() && (
                          <p className="text-red-500 text-xs mt-1">Please enter a valid URL</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Excerpt * <span className="text-xs text-gray-500">(Brief description)</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 ${
                          formData.excerpt.trim() === '' ? 'border-red-300 focus:ring-red-500' : 'border-gray-300/50'
                        }`}
                        placeholder="Brief description of the blog post..."
                      />
                      {formData.excerpt.trim() === '' && (
                        <p className="text-red-500 text-xs mt-1">Excerpt is required</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content * <span className="text-xs text-gray-500">({formData.content.length} characters, minimum 50)</span>
                      </label>
                      <textarea
                        required
                        rows={8}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 ${
                          formData.content.length > 0 && formData.content.length < 50
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300/50'
                        }`}
                        placeholder="Write your blog content here (minimum 50 characters)..."
                      />
                      {formData.content.length > 0 && formData.content.length < 50 && (
                        <p className="text-red-500 text-xs mt-1">Content must be at least 50 characters (currently {formData.content.length})</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        placeholder="education, technology, tips, etc."
                      />
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                      <motion.button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconWrapper icon={editingBlog ? FaEdit : FaRocket} />
                        {editingBlog ? 'Update Blog' : 'Publish Blog'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Modal */}
        <AnimatePresence>
          {isViewModalOpen && (
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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {viewingBlog?.title}
                    </h2>
                    <motion.button
                      onClick={handleCloseViewModal}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Featured Image */}
                    {viewingBlog?.image && (
                      <div className="mb-6">
                        <img 
                          src={viewingBlog.image} 
                          alt={viewingBlog.title}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Meta Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <IconWrapper icon={FaUser} className="text-blue-500" />
                        <span className="text-sm text-gray-700">{viewingBlog?.author?.name || 'Unknown Author'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconWrapper icon={FaCalendarAlt} className="text-green-500" />
                        <span className="text-sm text-gray-700">{viewingBlog?.created_at ? new Date(viewingBlog.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconWrapper icon={FaTags} className="text-purple-500" />
                        <span className="text-sm text-gray-700">{viewingBlog?.category || 'Uncategorized'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-800 mb-3">
                        Excerpt
                      </label>
                      <div className="text-gray-600 mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        {viewingBlog?.excerpt || 'No excerpt available'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-800 mb-3">
                        Full Content
                      </label>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                        {viewingBlog?.content || 'No content available'}
                      </div>
                    </div>

                    {viewingBlog?.tags && viewingBlog.tags.length > 0 && (
                      <div>
                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {viewingBlog.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                      <motion.button
                        onClick={() => handleEdit(viewingBlog!)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconWrapper icon={FaEdit} />
                        Edit Blog
                      </motion.button>
                      <motion.button
                        onClick={handleCloseViewModal}
                        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
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
      </motion.div>
    </MainLayout>
  );
};

export default Blogs; 