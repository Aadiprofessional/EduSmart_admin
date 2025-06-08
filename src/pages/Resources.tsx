import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaFileAlt, 
  FaVideo, 
  FaImage, 
  FaDownload,
  FaRocket,
  FaStar,
  FaUser,
  FaCalendarAlt,
  FaChartLine,
  FaAward,
  FaLightbulb,
  FaBook,
  FaTools,
  FaCloudDownloadAlt,
  FaExternalLinkAlt,
  FaTimes,
  FaCheck,
  FaGraduationCap
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';
import { responseAPI, useAdminUID } from '../utils/apiService';
import FileUpload from '../components/ui/FileUpload';
import { uploadFile } from '../utils/fileUpload';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'checklist' | 'video' | 'webinar' | 'ebook' | 'course';
  category: 'application' | 'study' | 'test-prep' | 'career' | 'visa' | 'finance';
  url?: string;
  file_size?: string;
  thumbnail?: string;
  download_link?: string;
  video_link?: string;
  downloads: number;
  featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'feature' | 'unfeature'>('delete');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'guide' as Resource['type'],
    category: 'application' as Resource['category'],
    url: '',
    file_size: '',
    thumbnail: '',
    download_link: '',
    video_link: '',
    featured: false,
    tags: '' // Changed to string for easier handling
  });

  const { enqueueSnackbar } = useSnackbar();
  const adminUID = useAdminUID();

  // Load resources from API
  useEffect(() => {
    loadResources();
    loadCategories();
    loadTypes();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const result = await responseAPI.getAll();
      if (result.success) {
        setResources(result.data.responses || []);
      } else {
        enqueueSnackbar('Failed to load resources: ' + result.error, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      enqueueSnackbar('Error loading resources', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await responseAPI.getCategories();
      if (result.success) {
        setCategories(result.data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTypes = async () => {
    try {
      const result = await responseAPI.getTypes();
      if (result.success) {
        setTypes(result.data.types || []);
      }
    } catch (error) {
      console.error('Error loading types:', error);
    }
  };

  const handleCreate = async () => {
    if (!adminUID) return;

    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      const result = await responseAPI.create(dataToSend, adminUID);
      if (result.success) {
        await loadResources();
        enqueueSnackbar('Resource created successfully', { variant: 'success' });
        setShowCreateModal(false);
        resetForm();
      } else {
        enqueueSnackbar('Error creating resource: ' + result.error, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error creating resource:', error);
      enqueueSnackbar('Error creating resource', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedResource || !adminUID) return;

    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      const result = await responseAPI.update(selectedResource.id, dataToSend, adminUID);
      if (result.success) {
        await loadResources();
        enqueueSnackbar('Resource updated successfully', { variant: 'success' });
        setShowEditModal(false);
        resetForm();
      } else {
        enqueueSnackbar('Error updating resource: ' + result.error, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      enqueueSnackbar('Error updating resource', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedResource || !adminUID) return;

    try {
      setLoading(true);
      let result;
      
      switch (actionType) {
        case 'delete':
          result = await responseAPI.delete(selectedResource.id, adminUID);
          if (result.success) {
            setResources(prev => prev.filter(r => r.id !== selectedResource.id));
            enqueueSnackbar('Resource deleted successfully', { variant: 'success' });
          }
          break;
        case 'feature':
          result = await responseAPI.update(selectedResource.id, { ...selectedResource, featured: true }, adminUID);
          if (result.success) {
            setResources(prev => prev.map(r => 
              r.id === selectedResource.id ? { ...r, featured: true } : r
            ));
            enqueueSnackbar('Resource marked as featured', { variant: 'success' });
          }
          break;
        case 'unfeature':
          result = await responseAPI.update(selectedResource.id, { ...selectedResource, featured: false }, adminUID);
          if (result.success) {
            setResources(prev => prev.map(r => 
              r.id === selectedResource.id ? { ...r, featured: false } : r
            ));
            enqueueSnackbar('Resource removed from featured', { variant: 'success' });
          }
          break;
      }
      
      if (!result?.success) {
        enqueueSnackbar('Error: ' + result?.error, { variant: 'error' });
      }
      
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error performing action:', error);
      enqueueSnackbar('Error performing action', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      type: 'guide',
      category: 'application',
      url: '',
      file_size: '',
      thumbnail: '',
      download_link: '',
      video_link: '',
      featured: false,
      tags: ''
    });
    setShowCreateModal(true);
  };

  const openEditModal = (resource: Resource) => {
    setSelectedResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      url: resource.url || '',
      file_size: resource.file_size || '',
      thumbnail: resource.thumbnail || '',
      download_link: resource.download_link || '',
      video_link: resource.video_link || '',
      featured: resource.featured,
      tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (resource: Resource) => {
    setSelectedResource(resource);
    setShowViewModal(true);
  };

  const openConfirmModal = (resource: Resource, action: 'delete' | 'feature' | 'unfeature') => {
    setSelectedResource(resource);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'guide',
      category: 'application',
      url: '',
      file_size: '',
      thumbnail: '',
      download_link: '',
      video_link: '',
      featured: false,
      tags: ''
    });
    setSelectedResource(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide': return FaBook;
      case 'template': return FaFileAlt;
      case 'checklist': return FaCheck;
      case 'video': return FaVideo;
      case 'webinar': return FaVideo;
      case 'ebook': return FaBook;
      case 'course': return FaGraduationCap;
      default: return FaFileAlt;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guide': return 'bg-blue-500';
      case 'template': return 'bg-green-500';
      case 'checklist': return 'bg-purple-500';
      case 'video': return 'bg-red-500';
      case 'webinar': return 'bg-orange-500';
      case 'ebook': return 'bg-indigo-500';
      case 'course': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredResources = Array.isArray(resources) ? resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || resource.type === filterType;
    const matchesCategory = !filterCategory || resource.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
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

  return (
    <MainLayout title="Resources">
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Resources</h1>
              <p className="text-blue-100 text-lg">Educational materials and tools</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold">{resources.length}</p>
                <p className="text-blue-200 text-sm">Total Resources</p>
              </div>
              <button
                onClick={openCreateModal}
                className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center gap-3 transition-all duration-300"
              >
                <IconWrapper icon={FaPlus} />
                Add Resource
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <IconWrapper icon={FaSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
                setFilterCategory('');
              }}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        </motion.div>

        {/* Resources Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {filteredResources.map((resource) => (
            <motion.div
              key={resource.id}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white"
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {/* Resource Image/Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                {resource.thumbnail ? (
                  <img 
                    src={resource.thumbnail} 
                    alt={resource.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className={`w-full h-full ${getTypeColor(resource.type)} flex items-center justify-center`}>
                    <IconWrapper icon={getTypeIcon(resource.type)} className="text-white text-4xl" />
                  </div>
                )}
                
                {/* Featured Badge */}
                {resource.featured && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <IconWrapper icon={FaStar} />
                      Featured
                    </span>
                  </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-black/50 text-white text-xs font-bold rounded-full capitalize">
                    {resource.type}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => openViewModal(resource)}
                    className="p-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-600/80"
                    title="View Resource"
                  >
                    <IconWrapper icon={FaEye} />
                  </button>
                  <button
                    onClick={() => openEditModal(resource)}
                    className="p-2 bg-green-500/80 text-white rounded-full hover:bg-green-600/80"
                    title="Edit Resource"
                  >
                    <IconWrapper icon={FaEdit} />
                  </button>
                  <button
                    onClick={() => openConfirmModal(resource, resource.featured ? 'unfeature' : 'feature')}
                    className="p-2 bg-yellow-500/80 text-white rounded-full hover:bg-yellow-600/80"
                    title={resource.featured ? 'Remove from Featured' : 'Mark as Featured'}
                  >
                    <IconWrapper icon={FaStar} />
                  </button>
                  <button
                    onClick={() => openConfirmModal(resource, 'delete')}
                    className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600/80"
                    title="Delete Resource"
                  >
                    <IconWrapper icon={FaTrash} />
                  </button>
                </div>
              </div>

              {/* Resource Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {resource.title}
                </h3>
                
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {resource.description}
                </p>

                {/* Resource Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <IconWrapper icon={FaDownload} className="text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Downloads</p>
                      <p className="text-sm font-bold text-blue-800">{resource.downloads}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                    <IconWrapper icon={FaUser} className="text-green-600" />
                    <div>
                      <p className="text-xs text-green-600 font-medium">Category</p>
                      <p className="text-sm font-bold text-green-800 capitalize">{resource.category}</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.tags?.slice(0, 3).map((tag: string, index: number) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {resource.tags?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{resource.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {resource.download_link && (
                    <a
                      href={resource.download_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <IconWrapper icon={FaDownload} />
                      Download
                    </a>
                  )}
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <IconWrapper icon={FaExternalLinkAlt} />
                      View
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <motion.div className="text-center py-16" variants={itemVariants}>
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6">
              <IconWrapper icon={FaBook} className="text-white text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType || filterCategory ? 'Try adjusting your filters' : 'Get started by adding your first resource'}
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <IconWrapper icon={FaPlus} />
              Add First Resource
            </button>
          </motion.div>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && selectedResource && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
              >
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <IconWrapper icon={actionType === 'delete' ? FaTrash : FaStar} className="text-red-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {actionType === 'delete' ? 'Delete Resource' : 
                     actionType === 'feature' ? 'Feature Resource' : 'Remove from Featured'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to {actionType} "{selectedResource.title}"?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAction}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {(showCreateModal || showEditModal) && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {showCreateModal ? 'Create Resource' : 'Edit Resource'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        resetForm();
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <IconWrapper icon={FaTimes} />
                    </button>
                  </div>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter resource title"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value as Resource['type']})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="guide">Guide</option>
                          <option value="template">Template</option>
                          <option value="checklist">Checklist</option>
                          <option value="video">Video</option>
                          <option value="webinar">Webinar</option>
                          <option value="ebook">E-book</option>
                          <option value="course">Course</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter resource description"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value as Resource['category']})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="application">Application</option>
                          <option value="study">Study</option>
                          <option value="test-prep">Test Prep</option>
                          <option value="career">Career</option>
                          <option value="visa">Visa</option>
                          <option value="finance">Finance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
                        <input
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData({...formData, url: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/resource"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                        <FileUpload
                          onFileSelect={async (file: File | null) => {
                            if (file) {
                              try {
                                // Upload file to Supabase storage
                                const uploadedUrl = await uploadFile(file, 'universityimages', 'resources');
                                setFormData({...formData, thumbnail: uploadedUrl});
                                enqueueSnackbar('Thumbnail uploaded successfully!', { variant: 'success' });
                              } catch (error) {
                                console.error('Upload error:', error);
                                enqueueSnackbar('Upload failed. Please try again.', { variant: 'error' });
                                // Fallback to temporary URL for preview
                                const tempUrl = URL.createObjectURL(file);
                                setFormData({...formData, thumbnail: tempUrl});
                              }
                            } else {
                              setFormData({...formData, thumbnail: ''});
                            }
                          }}
                          currentImageUrl={formData.thumbnail}
                          label="Resource Thumbnail"
                          placeholder="Upload resource thumbnail"
                          maxSize={5}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Download Link</label>
                        <input
                          type="url"
                          value={formData.download_link}
                          onChange={(e) => setFormData({...formData, download_link: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/download"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter tags separated by commas"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                        Mark as featured
                      </label>
                    </div>

                    <div className="flex gap-3 pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          setShowEditModal(false);
                          resetForm();
                        }}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={showCreateModal ? handleCreate : handleEdit}
                        disabled={loading || !formData.title || !formData.description || !formData.url}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : (showCreateModal ? 'Create Resource' : 'Update Resource')}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Modal */}
        <AnimatePresence>
          {showViewModal && selectedResource && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Resource Details</h3>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <IconWrapper icon={FaTimes} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedResource.title}</h4>
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`px-3 py-1 ${getTypeColor(selectedResource.type)} text-white text-sm font-bold rounded-full capitalize`}>
                          {selectedResource.type}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-bold rounded-full capitalize">
                          {selectedResource.category}
                        </span>
                        {selectedResource.featured && (
                          <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                      <p className="text-gray-700">{selectedResource.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Resource Information</h5>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Downloads:</span> {selectedResource.downloads}</p>
                          {selectedResource.file_size && (
                            <p><span className="font-medium">File Size:</span> {selectedResource.file_size}</p>
                          )}
                          <p><span className="font-medium">Created:</span> {new Date(selectedResource.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Links</h5>
                        <div className="space-y-2 text-sm">
                          {selectedResource.url && (
                            <p><span className="font-medium">URL:</span> <a href={selectedResource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Resource</a></p>
                          )}
                          {selectedResource.download_link && (
                            <p><span className="font-medium">Download:</span> <a href={selectedResource.download_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download File</a></p>
                          )}
                          {selectedResource.video_link && (
                            <p><span className="font-medium">Video:</span> <a href={selectedResource.video_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Watch Video</a></p>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedResource.tags && selectedResource.tags.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Tags</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedResource.tags.map((tag: string, index: number) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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

export default Resources; 