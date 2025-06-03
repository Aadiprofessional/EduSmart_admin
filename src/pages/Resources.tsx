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
  FaExternalLinkAlt
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'image' | 'tool' | 'link';
  category: string;
  url: string;
  file_size?: string;
  downloads: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  author: string;
  tags: string[];
}

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([
    {
      id: '1',
      title: 'Complete React Development Guide',
      description: 'Comprehensive guide covering React fundamentals, hooks, and advanced patterns',
      type: 'document',
      category: 'Programming',
      url: '/resources/react-guide.pdf',
      file_size: '2.5 MB',
      downloads: 1250,
      is_featured: true,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      author: 'John Doe',
      tags: ['React', 'JavaScript', 'Frontend']
    },
    {
      id: '2',
      title: 'Machine Learning Fundamentals',
      description: 'Video series explaining core ML concepts and algorithms',
      type: 'video',
      category: 'Data Science',
      url: 'https://youtube.com/watch?v=example',
      downloads: 890,
      is_featured: false,
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
      author: 'Jane Smith',
      tags: ['Machine Learning', 'AI', 'Python']
    },
    {
      id: '3',
      title: 'Design System Templates',
      description: 'Collection of modern UI components and design patterns',
      type: 'tool',
      category: 'Design',
      url: '/resources/design-system.zip',
      file_size: '15.2 MB',
      downloads: 567,
      is_featured: true,
      created_at: '2024-01-08',
      updated_at: '2024-01-08',
      author: 'Alex Johnson',
      tags: ['Design', 'UI/UX', 'Templates']
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'feature' | 'unfeature'>('delete');

  const { enqueueSnackbar } = useSnackbar();

  const handleAction = async () => {
    if (!selectedResource) return;

    try {
      switch (actionType) {
        case 'delete':
          setResources(prev => prev.filter(r => r.id !== selectedResource.id));
          enqueueSnackbar('Resource deleted successfully', { variant: 'success' });
          break;
        case 'feature':
          setResources(prev => prev.map(r => 
            r.id === selectedResource.id ? { ...r, is_featured: true } : r
          ));
          enqueueSnackbar('Resource marked as featured', { variant: 'success' });
          break;
        case 'unfeature':
          setResources(prev => prev.map(r => 
            r.id === selectedResource.id ? { ...r, is_featured: false } : r
          ));
          enqueueSnackbar('Resource removed from featured', { variant: 'success' });
          break;
      }
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error performing action:', error);
      enqueueSnackbar('Error performing action', { variant: 'error' });
    }
  };

  const openConfirmModal = (resource: Resource, action: 'delete' | 'feature' | 'unfeature') => {
    setSelectedResource(resource);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return FaFileAlt;
      case 'video': return FaVideo;
      case 'image': return FaImage;
      case 'tool': return FaTools;
      case 'link': return FaExternalLinkAlt;
      default: return FaFileAlt;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'from-blue-400 to-blue-600';
      case 'video': return 'from-red-400 to-red-600';
      case 'image': return 'from-green-400 to-green-600';
      case 'tool': return 'from-purple-400 to-purple-600';
      case 'link': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const filteredResources = Array.isArray(resources) ? resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !filterType || resource.type === filterType;
    const matchesCategory = !filterCategory || resource.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  }) : [];

  const uniqueTypes = Array.from(new Set(Array.isArray(resources) ? resources.map(r => r.type) : []));
  const uniqueCategories = Array.from(new Set(Array.isArray(resources) ? resources.map(r => r.category) : []));

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
    <MainLayout title="Resource Management">
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Futuristic Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 backdrop-blur-sm"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <motion.h1 
                className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Resource Management
              </motion.h1>
              <motion.p 
                className="text-emerald-100 text-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Manage educational resources, documents, and learning materials
              </motion.p>
            </div>
            <motion.div
              className="flex items-center gap-6"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-right">
                <p className="text-2xl font-bold">{resources.length}</p>
                <p className="text-emerald-200 text-sm">Total Resources</p>
              </div>
              <motion.button
                className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center gap-3 transition-all duration-300 border border-white/30"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconWrapper icon={FaRocket} />
                Add Resource
              </motion.button>
            </motion.div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-300/20 rounded-full blur-lg animate-bounce"></div>
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
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                List
              </button>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
                setFilterCategory('');
              }}
              className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300"
            >
              Clear All
            </button>
          </div>
        </motion.div>

        {/* Resources Grid/List */}
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
            {filteredResources.map((resource) => (
              <motion.div
                key={resource.id}
                variants={itemVariants}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-gray-200/50 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                whileHover={{ y: -8, scale: 1.02 }}
                layout
              >
                {/* Resource Icon */}
                <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-48' : 'w-48 h-32'}`}>
                  <div className={`w-full h-full bg-gradient-to-br ${getTypeColor(resource.type)} flex items-center justify-center`}>
                    <IconWrapper icon={getTypeIcon(resource.type)} className="text-white text-4xl" />
                  </div>
                  
                  {/* Featured Badge */}
                  {resource.is_featured && (
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
                      className="p-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Download Resource"
                    >
                      <IconWrapper icon={FaDownload} />
                    </motion.button>
                    <motion.button
                      className="p-2 bg-green-500/80 text-white rounded-full hover:bg-green-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Edit Resource"
                    >
                      <IconWrapper icon={FaEdit} />
                    </motion.button>
                    <motion.button
                      onClick={() => openConfirmModal(resource, resource.is_featured ? 'unfeature' : 'feature')}
                      className="p-2 bg-yellow-500/80 text-white rounded-full hover:bg-yellow-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={resource.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                    >
                      <IconWrapper icon={FaStar} />
                    </motion.button>
                    <motion.button
                      onClick={() => openConfirmModal(resource, 'delete')}
                      className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Delete Resource"
                    >
                      <IconWrapper icon={FaTrash} />
                    </motion.button>
                  </div>
                </div>

                {/* Resource Content */}
                <div className={`p-6 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
                      {resource.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <IconWrapper icon={FaUser} className="text-emerald-500" />
                      <span className="text-gray-600 text-sm">By {resource.author}</span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {resource.description}
                    </p>

                    {/* Resource Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                        <IconWrapper icon={FaChartLine} className="text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-600 font-medium">Downloads</p>
                          <p className="text-sm font-bold text-blue-800">{resource.downloads.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                        <IconWrapper icon={FaCalendarAlt} className="text-green-600" />
                        <div>
                          <p className="text-xs text-green-600 font-medium">Created</p>
                          <p className="text-sm font-bold text-green-800">
                            {new Date(resource.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                        <IconWrapper icon={FaBook} className="text-purple-600" />
                        <div>
                          <p className="text-xs text-purple-600 font-medium">Category</p>
                          <p className="text-sm font-bold text-purple-800">{resource.category}</p>
                        </div>
                      </div>
                      
                      {resource.file_size && (
                        <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                          <IconWrapper icon={FaCloudDownloadAlt} className="text-orange-600" />
                          <div>
                            <p className="text-xs text-orange-600 font-medium">Size</p>
                            <p className="text-sm font-bold text-orange-800">{resource.file_size}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Download Button */}
                  <motion.button
                    className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconWrapper icon={FaDownload} />
                    Download Resource
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <motion.div 
            className="text-center py-16"
            variants={itemVariants}
          >
            <motion.div
              className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-6"
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
              <IconWrapper icon={FaBook} className="text-white text-3xl" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType || filterCategory ? 'Try adjusting your filters' : 'Get started by adding your first resource'}
            </p>
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconWrapper icon={FaPlus} />
              Add First Resource
            </motion.button>
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
                      ? 'Delete Resource' 
                      : actionType === 'feature' 
                        ? 'Feature Resource' 
                        : 'Remove from Featured'}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {actionType === 'delete' 
                      ? `Are you sure you want to delete "${selectedResource.title}"? This action cannot be undone.`
                      : actionType === 'feature' 
                        ? `Are you sure you want to mark "${selectedResource.title}" as featured?`
                        : `Are you sure you want to remove "${selectedResource.title}" from featured resources?`}
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

export default Resources; 