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
  FaBookmark,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';
import { caseStudyAPI, useAdminUID } from '../utils/apiService';

interface CaseStudy {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  student_name: string;
  student_image?: string;
  student_background?: string;
  previous_education?: string;
  target_program?: string;
  target_university?: string;
  target_country?: string;
  outcome: string;
  application_year?: number;
  story_content?: string;
  challenges_faced?: string[];
  strategies_used?: string[];
  advice_given?: string[];
  timeline?: string;
  test_scores?: any;
  category?: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const CaseStudies: React.FC = () => {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'feature' | 'unfeature'>('delete');
  const [formData, setFormData] = useState<Partial<CaseStudy>>({});

  const { enqueueSnackbar } = useSnackbar();
  const adminUID = useAdminUID();

  // Load case studies from API
  useEffect(() => {
    loadCaseStudies();
  }, []);

  const loadCaseStudies = async () => {
    try {
      setLoading(true);
      const result = await caseStudyAPI.getAll();
      if (result.success) {
        setCaseStudies(result.data.caseStudies || []);
      } else {
        enqueueSnackbar('Failed to load success stories: ' + result.error, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error loading success stories:', error);
      enqueueSnackbar('Error loading success stories', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedCaseStudy || !adminUID) return;

    try {
      setLoading(true);
      let result;
      
      switch (actionType) {
        case 'delete':
          result = await caseStudyAPI.delete(selectedCaseStudy.id, adminUID);
          if (result.success) {
            setCaseStudies(prev => prev.filter(cs => cs.id !== selectedCaseStudy.id));
            enqueueSnackbar('Success story deleted successfully', { variant: 'success' });
          }
          break;
        case 'feature':
          result = await caseStudyAPI.update(selectedCaseStudy.id, { ...selectedCaseStudy, featured: true }, adminUID);
          if (result.success) {
            setCaseStudies(prev => prev.map(cs => 
              cs.id === selectedCaseStudy.id ? { ...cs, featured: true } : cs
            ));
            enqueueSnackbar('Success story marked as featured', { variant: 'success' });
          }
          break;
        case 'unfeature':
          result = await caseStudyAPI.update(selectedCaseStudy.id, { ...selectedCaseStudy, featured: false }, adminUID);
          if (result.success) {
            setCaseStudies(prev => prev.map(cs => 
              cs.id === selectedCaseStudy.id ? { ...cs, featured: false } : cs
            ));
            enqueueSnackbar('Success story removed from featured', { variant: 'success' });
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

  const handleCreate = async () => {
    if (!adminUID) return;

    try {
      setLoading(true);
      const result = await caseStudyAPI.create(formData, adminUID);
      if (result.success) {
        await loadCaseStudies();
        enqueueSnackbar('Success story created successfully', { variant: 'success' });
        setShowCreateModal(false);
        setFormData({});
      } else {
        enqueueSnackbar('Error creating success story: ' + result.error, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error creating success story:', error);
      enqueueSnackbar('Error creating success story', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCaseStudy || !adminUID) return;

    try {
      setLoading(true);
      const result = await caseStudyAPI.update(selectedCaseStudy.id, formData, adminUID);
      if (result.success) {
        await loadCaseStudies();
        enqueueSnackbar('Success story updated successfully', { variant: 'success' });
        setShowEditModal(false);
        setFormData({});
      } else {
        enqueueSnackbar('Error updating success story: ' + result.error, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error updating success story:', error);
      enqueueSnackbar('Error updating success story', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (caseStudy: CaseStudy, action: 'delete' | 'feature' | 'unfeature') => {
    setSelectedCaseStudy(caseStudy);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const openCreateModal = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      student_name: '',
      student_background: '',
      previous_education: '',
      target_program: '',
      target_university: '',
      target_country: '',
      outcome: 'accepted',
      application_year: new Date().getFullYear(),
      story_content: '',
      challenges_faced: [],
      strategies_used: [],
      advice_given: [],
      timeline: '',
      featured: false
    });
    setShowCreateModal(true);
  };

  const openEditModal = (caseStudy: CaseStudy) => {
    setSelectedCaseStudy(caseStudy);
    setFormData(caseStudy);
    setShowEditModal(true);
  };

  const openViewModal = (caseStudy: CaseStudy) => {
    setSelectedCaseStudy(caseStudy);
    setShowViewModal(true);
  };

  const filteredCaseStudies = Array.isArray(caseStudies) ? caseStudies.filter(caseStudy => {
    const matchesSearch = caseStudy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseStudy.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseStudy.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || caseStudy.category === filterCategory;

    return matchesSearch && matchesCategory;
  }) : [];

  const uniqueCategories = Array.from(new Set(Array.isArray(caseStudies) ? caseStudies.map(cs => cs.category).filter(Boolean) : []));

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
    <MainLayout title="Success Stories">
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-8 text-white"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Success Stories</h1>
              <p className="text-amber-100 text-lg">Inspiring success stories</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold">{caseStudies.length}</p>
                <p className="text-amber-200 text-sm">Success Stories</p>
              </div>
              <button
                onClick={openCreateModal}
                className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center gap-3 transition-all duration-300"
              >
                <IconWrapper icon={FaPlus} />
                Add Success Story
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
            <div className="relative md:col-span-2">
              <IconWrapper icon={FaSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search success stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
              }}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        </motion.div>

        {/* Case Studies Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {filteredCaseStudies.map((caseStudy) => (
            <motion.div
              key={caseStudy.id}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white"
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {/* Case Study Image */}
              <div className="relative h-48 overflow-hidden">
                {caseStudy.student_image ? (
                  <img 
                    src={caseStudy.student_image} 
                    alt={caseStudy.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <IconWrapper icon={FaTrophy} className="text-white text-4xl" />
                  </div>
                )}
                
                {/* Featured Badge */}
                {caseStudy.featured && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <IconWrapper icon={FaStar} />
                      Featured
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => openViewModal(caseStudy)}
                    className="p-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-600/80"
                    title="View Success Story"
                  >
                    <IconWrapper icon={FaEye} />
                  </button>
                  <button
                    onClick={() => openEditModal(caseStudy)}
                    className="p-2 bg-green-500/80 text-white rounded-full hover:bg-green-600/80"
                    title="Edit Success Story"
                  >
                    <IconWrapper icon={FaEdit} />
                  </button>
                  <button
                    onClick={() => openConfirmModal(caseStudy, caseStudy.featured ? 'unfeature' : 'feature')}
                    className="p-2 bg-yellow-500/80 text-white rounded-full hover:bg-yellow-600/80"
                    title={caseStudy.featured ? 'Remove from Featured' : 'Mark as Featured'}
                  >
                    <IconWrapper icon={FaStar} />
                  </button>
                  <button
                    onClick={() => openConfirmModal(caseStudy, 'delete')}
                    className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600/80"
                    title="Delete Success Story"
                  >
                    <IconWrapper icon={FaTrash} />
                  </button>
                </div>
              </div>

              {/* Case Study Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {caseStudy.title}
                </h3>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <IconWrapper icon={FaUser} className="text-white text-sm" />
                  </div>
                  <span className="text-gray-600 text-sm font-medium">{caseStudy.student_name}</span>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">
                  {caseStudy.description}
                </p>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <IconWrapper icon={FaTrophy} className="text-amber-600" />
                    <span className="text-xs text-amber-600 font-medium">Outcome</span>
                  </div>
                  <p className="text-sm font-bold text-amber-800">{caseStudy.outcome}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredCaseStudies.length === 0 && (
          <motion.div className="text-center py-16" variants={itemVariants}>
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6">
              <IconWrapper icon={FaTrophy} className="text-white text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No success stories found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory ? 'Try adjusting your filters' : 'Get started by adding your first success story'}
            </p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <IconWrapper icon={FaPlus} />
              Add First Success Story
            </button>
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
                    {actionType === 'delete' ? 'Delete Success Story' : 
                     actionType === 'feature' ? 'Feature Success Story' : 'Remove from Featured'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to {actionType} "{selectedCaseStudy.title}"?
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
                      {showCreateModal ? 'Create Success Story' : 'Edit Success Story'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        setFormData({});
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
                          value={formData.title || ''}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                          placeholder="Enter success story title"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
                        <input
                          type="text"
                          value={formData.student_name || ''}
                          onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                          placeholder="Enter student name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter success story description (minimum 50 characters)"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {(formData.description || '').length}/50 characters minimum
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Story Content *</label>
                      <textarea
                        value={formData.story_content || ''}
                        onChange={(e) => setFormData({...formData, story_content: e.target.value})}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter the detailed story content (minimum 100 characters)"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {(formData.story_content || '').length}/100 characters minimum
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={formData.category || ''}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="">Select category</option>
                          <option value="undergraduate">Undergraduate</option>
                          <option value="graduate">Graduate</option>
                          <option value="phd">PhD</option>
                          <option value="mba">MBA</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Outcome *</label>
                        <select
                          value={formData.outcome || 'accepted'}
                          onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                          required
                        >
                          <option value="accepted">Accepted</option>
                          <option value="waitlisted">Waitlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="deferred">Deferred</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Application Year</label>
                        <input
                          type="number"
                          value={formData.application_year || new Date().getFullYear()}
                          onChange={(e) => setFormData({...formData, application_year: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                          min="2000"
                          max="2030"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Challenges Faced</label>
                      <textarea
                        value={Array.isArray(formData.challenges_faced) ? formData.challenges_faced.join(', ') : ''}
                        onChange={(e) => setFormData({...formData, challenges_faced: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter challenges separated by commas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Strategies Used</label>
                      <textarea
                        value={Array.isArray(formData.strategies_used) ? formData.strategies_used.join(', ') : ''}
                        onChange={(e) => setFormData({...formData, strategies_used: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter strategies separated by commas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Advice Given</label>
                      <textarea
                        value={Array.isArray(formData.advice_given) ? formData.advice_given.join(', ') : ''}
                        onChange={(e) => setFormData({...formData, advice_given: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter advice separated by commas"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured || false}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
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
                          setFormData({});
                        }}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={showCreateModal ? handleCreate : handleEdit}
                        disabled={loading || !formData.title || !formData.student_name || !formData.description || (formData.description || '').length < 50 || !formData.story_content || (formData.story_content || '').length < 100}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : (showCreateModal ? 'Create Success Story' : 'Update Success Story')}
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
          {showViewModal && selectedCaseStudy && (
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
                    <h3 className="text-2xl font-bold text-gray-900">Success Story Details</h3>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <IconWrapper icon={FaTimes} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedCaseStudy.title}</h4>
                      {selectedCaseStudy.subtitle && (
                        <p className="text-lg text-gray-600 mb-4">{selectedCaseStudy.subtitle}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Student Information</h5>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Name:</span> {selectedCaseStudy.student_name}</p>
                          {selectedCaseStudy.student_background && (
                            <p><span className="font-medium">Background:</span> {selectedCaseStudy.student_background}</p>
                          )}
                          {selectedCaseStudy.previous_education && (
                            <p><span className="font-medium">Previous Education:</span> {selectedCaseStudy.previous_education}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Application Details</h5>
                        <div className="space-y-2 text-sm">
                          {selectedCaseStudy.target_program && (
                            <p><span className="font-medium">Program:</span> {selectedCaseStudy.target_program}</p>
                          )}
                          {selectedCaseStudy.target_university && (
                            <p><span className="font-medium">University:</span> {selectedCaseStudy.target_university}</p>
                          )}
                          {selectedCaseStudy.target_country && (
                            <p><span className="font-medium">Country:</span> {selectedCaseStudy.target_country}</p>
                          )}
                          <p><span className="font-medium">Outcome:</span> {selectedCaseStudy.outcome}</p>
                          {selectedCaseStudy.application_year && (
                            <p><span className="font-medium">Year:</span> {selectedCaseStudy.application_year}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                      <p className="text-gray-700">{selectedCaseStudy.description}</p>
                    </div>

                    {selectedCaseStudy.story_content && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Story</h5>
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedCaseStudy.story_content}</p>
                      </div>
                    )}

                    {selectedCaseStudy.challenges_faced && selectedCaseStudy.challenges_faced.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Challenges Faced</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {selectedCaseStudy.challenges_faced.map((challenge, index) => (
                            <li key={index}>{challenge}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedCaseStudy.strategies_used && selectedCaseStudy.strategies_used.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Strategies Used</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {selectedCaseStudy.strategies_used.map((strategy, index) => (
                            <li key={index}>{strategy}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedCaseStudy.advice_given && selectedCaseStudy.advice_given.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Advice Given</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {selectedCaseStudy.advice_given.map((advice, index) => (
                            <li key={index}>{advice}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedCaseStudy.timeline && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Timeline</h5>
                        <p className="text-gray-700">{selectedCaseStudy.timeline}</p>
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

export default CaseStudies;