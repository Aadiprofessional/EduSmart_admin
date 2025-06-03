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
  FaUser, 
  FaCalendarAlt,
  FaRocket,
  FaStar,
  FaChartLine,
  FaAward,
  FaLightbulb,
  FaBook,
  FaTrophy,
  FaHeart,
  FaThumbsUp,
  FaShare,
  FaBookmark
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  student_name: string;
  student_image?: string;
  category: string;
  outcome: string;
  duration: string;
  success_metrics: string[];
  challenges: string[];
  solutions: string[];
  is_featured: boolean;
  likes: number;
  views: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  image_url?: string;
}

const CaseStudies: React.FC = () => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([
    {
      id: '1',
      title: 'From Zero to Full-Stack Developer',
      description: 'How Sarah transformed her career from marketing to software development in 8 months through our comprehensive program.',
      student_name: 'Sarah Johnson',
      student_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      category: 'Career Change',
      outcome: 'Landed a $85k/year position at a tech startup',
      duration: '8 months',
      success_metrics: ['85% salary increase', 'Completed 12 projects', '95% course completion rate'],
      challenges: ['No prior coding experience', 'Limited time due to full-time job', 'Imposter syndrome'],
      solutions: ['Structured learning path', 'Flexible scheduling', 'Mentorship program'],
      is_featured: true,
      likes: 245,
      views: 1850,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      tags: ['Full-Stack', 'Career Change', 'Success Story'],
      image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop'
    },
    {
      id: '2',
      title: 'AI Engineer Success Story',
      description: 'Michael\'s journey from mechanical engineer to AI specialist, now working at a Fortune 500 company.',
      student_name: 'Michael Chen',
      student_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      category: 'AI/ML',
      outcome: 'Senior AI Engineer at Fortune 500 company',
      duration: '12 months',
      success_metrics: ['120% salary increase', 'Published 3 research papers', 'Led team of 5 engineers'],
      challenges: ['Complex mathematical concepts', 'Transitioning from hardware to software', 'Keeping up with rapid AI advances'],
      solutions: ['Math fundamentals course', 'Hands-on projects', 'Industry mentorship'],
      is_featured: true,
      likes: 189,
      views: 1420,
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
      tags: ['AI', 'Machine Learning', 'Engineering'],
      image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop'
    },
    {
      id: '3',
      title: 'UX Design Transformation',
      description: 'Emma\'s transition from graphic design to UX design, now leading design at a major e-commerce platform.',
      student_name: 'Emma Rodriguez',
      student_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      category: 'Design',
      outcome: 'Lead UX Designer at major e-commerce platform',
      duration: '6 months',
      success_metrics: ['60% salary increase', 'Improved user engagement by 40%', 'Led redesign of main platform'],
      challenges: ['Understanding user psychology', 'Learning new design tools', 'Building a portfolio'],
      solutions: ['User research workshops', 'Tool-specific training', 'Portfolio development program'],
      is_featured: false,
      likes: 156,
      views: 980,
      created_at: '2024-01-08',
      updated_at: '2024-01-08',
      tags: ['UX Design', 'Career Growth', 'E-commerce'],
      image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop'
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'feature' | 'unfeature'>('delete');

  const { enqueueSnackbar } = useSnackbar();

  const handleAction = async () => {
    if (!selectedCaseStudy) return;

    try {
      switch (actionType) {
        case 'delete':
          setCaseStudies(prev => prev.filter(cs => cs.id !== selectedCaseStudy.id));
          enqueueSnackbar('Case study deleted successfully', { variant: 'success' });
          break;
        case 'feature':
          setCaseStudies(prev => prev.map(cs => 
            cs.id === selectedCaseStudy.id ? { ...cs, is_featured: true } : cs
          ));
          enqueueSnackbar('Case study marked as featured', { variant: 'success' });
          break;
        case 'unfeature':
          setCaseStudies(prev => prev.map(cs => 
            cs.id === selectedCaseStudy.id ? { ...cs, is_featured: false } : cs
          ));
          enqueueSnackbar('Case study removed from featured', { variant: 'success' });
          break;
      }
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error performing action:', error);
      enqueueSnackbar('Error performing action', { variant: 'error' });
    }
  };

  const openConfirmModal = (caseStudy: CaseStudy, action: 'delete' | 'feature' | 'unfeature') => {
    setSelectedCaseStudy(caseStudy);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const handleLike = (id: string) => {
    setCaseStudies(prev => prev.map(cs => 
      cs.id === id ? { ...cs, likes: cs.likes + 1 } : cs
    ));
  };

  const filteredCaseStudies = Array.isArray(caseStudies) ? caseStudies.filter(caseStudy => {
    const matchesSearch = caseStudy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseStudy.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseStudy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseStudy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || caseStudy.category === filterCategory;

    return matchesSearch && matchesCategory;
  }) : [];

  const uniqueCategories = Array.from(new Set(Array.isArray(caseStudies) ? caseStudies.map(cs => cs.category) : []));

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
    <MainLayout title="Case Studies">
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Futuristic Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-8 text-white"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-red-400/20 backdrop-blur-sm"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <motion.h1 
                className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Case Studies
              </motion.h1>
              <motion.p 
                className="text-amber-100 text-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Inspiring success stories and transformative learning journeys
              </motion.p>
            </div>
            <motion.div
              className="flex items-center gap-6"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-right">
                <p className="text-2xl font-bold">{caseStudies.length}</p>
                <p className="text-amber-200 text-sm">Success Stories</p>
              </div>
              <motion.button
                className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center gap-3 transition-all duration-300 border border-white/30"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconWrapper icon={FaRocket} />
                Add Case Study
              </motion.button>
            </motion.div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-300/20 rounded-full blur-lg animate-bounce"></div>
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
                placeholder="Search case studies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
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
                    ? 'bg-amber-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-amber-500 text-white shadow-lg' 
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

        {/* Case Studies Grid/List */}
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
            {filteredCaseStudies.map((caseStudy) => (
              <motion.div
                key={caseStudy.id}
                variants={itemVariants}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-gray-200/50 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                whileHover={{ y: -8, scale: 1.02 }}
                layout
              >
                {/* Case Study Image */}
                <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-48' : 'w-48 h-32'}`}>
                  {caseStudy.image_url ? (
                    <img 
                      src={caseStudy.image_url} 
                      alt={caseStudy.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <IconWrapper icon={FaTrophy} className="text-white text-4xl" />
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {caseStudy.is_featured && (
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
                      title="View Case Study"
                    >
                      <IconWrapper icon={FaEye} />
                    </motion.button>
                    <motion.button
                      className="p-2 bg-green-500/80 text-white rounded-full hover:bg-green-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Edit Case Study"
                    >
                      <IconWrapper icon={FaEdit} />
                    </motion.button>
                    <motion.button
                      onClick={() => openConfirmModal(caseStudy, caseStudy.is_featured ? 'unfeature' : 'feature')}
                      className="p-2 bg-yellow-500/80 text-white rounded-full hover:bg-yellow-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={caseStudy.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                    >
                      <IconWrapper icon={FaStar} />
                    </motion.button>
                    <motion.button
                      onClick={() => openConfirmModal(caseStudy, 'delete')}
                      className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Delete Case Study"
                    >
                      <IconWrapper icon={FaTrash} />
                    </motion.button>
                  </div>
                </div>

                {/* Case Study Content */}
                <div className={`p-6 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors duration-300">
                      {caseStudy.title}
                    </h3>
                    
                    {/* Student Info */}
                    <div className="flex items-center gap-3 mb-3">
                      {caseStudy.student_image ? (
                        <img 
                          src={caseStudy.student_image} 
                          alt={caseStudy.student_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                          <IconWrapper icon={FaUser} className="text-white text-sm" />
                        </div>
                      )}
                      <span className="text-gray-600 text-sm font-medium">{caseStudy.student_name}</span>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {caseStudy.description}
                    </p>

                    {/* Case Study Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                        <IconWrapper icon={FaChartLine} className="text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-600 font-medium">Category</p>
                          <p className="text-sm font-bold text-blue-800">{caseStudy.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                        <IconWrapper icon={FaCalendarAlt} className="text-green-600" />
                        <div>
                          <p className="text-xs text-green-600 font-medium">Duration</p>
                          <p className="text-sm font-bold text-green-800">{caseStudy.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                        <IconWrapper icon={FaThumbsUp} className="text-purple-600" />
                        <div>
                          <p className="text-xs text-purple-600 font-medium">Likes</p>
                          <p className="text-sm font-bold text-purple-800">{caseStudy.likes}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                        <IconWrapper icon={FaEye} className="text-orange-600" />
                        <div>
                          <p className="text-xs text-orange-600 font-medium">Views</p>
                          <p className="text-sm font-bold text-orange-800">{caseStudy.views}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {caseStudy.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Outcome */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <IconWrapper icon={FaTrophy} className="text-amber-600" />
                        <span className="text-xs text-amber-600 font-medium">Outcome</span>
                      </div>
                      <p className="text-sm font-bold text-amber-800">{caseStudy.outcome}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleLike(caseStudy.id)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconWrapper icon={FaHeart} />
                      Like
                    </motion.button>
                    <motion.button
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconWrapper icon={FaShare} />
                      Share
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredCaseStudies.length === 0 && (
          <motion.div 
            className="text-center py-16"
            variants={itemVariants}
          >
            <motion.div
              className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6"
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
              <IconWrapper icon={FaTrophy} className="text-white text-3xl" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No case studies found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory ? 'Try adjusting your filters' : 'Get started by adding your first success story'}
            </p>
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconWrapper icon={FaPlus} />
              Add First Case Study
            </motion.button>
          </motion.div>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && selectedCaseStudy && (
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
                      ? 'Delete Case Study' 
                      : actionType === 'feature' 
                        ? 'Feature Case Study' 
                        : 'Remove from Featured'}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {actionType === 'delete' 
                      ? `Are you sure you want to delete "${selectedCaseStudy.title}"? This action cannot be undone.`
                      : actionType === 'feature' 
                        ? `Are you sure you want to mark "${selectedCaseStudy.title}" as featured?`
                        : `Are you sure you want to remove "${selectedCaseStudy.title}" from featured case studies?`}
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

export default CaseStudies; 