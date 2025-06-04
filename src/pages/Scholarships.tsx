import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaDollarSign, 
  FaGraduationCap, 
  FaCalendarAlt, 
  FaGlobe,
  FaRocket,
  FaStar,
  FaAward,
  FaBookOpen,
  FaUniversity,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';
import { useAuth } from '../utils/AuthContext';
import { scholarshipAPI } from '../utils/apiService';

interface Scholarship {
  id: string;
  title: string;
  description: string;
  amount: number;
  eligibility: string;
  deadline: string;
  university: string;
  country: string;
  application_link: string;
  requirements: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const Scholarships: React.FC = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [viewingScholarship, setViewingScholarship] = useState<Scholarship | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    eligibility: '',
    deadline: '',
    university: '',
    country: '',
    application_link: '',
    requirements: ''
  });

  const { enqueueSnackbar } = useSnackbar();
  const { getAdminUID } = useAuth();

  useEffect(() => {
    fetchScholarships();
    fetchCountries();
    fetchUniversities();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const response = await scholarshipAPI.getAll();
      if (response.success) {
        // Handle the API response structure
        let scholarshipsData = response.data;
        
        // The API returns { scholarships: [...], pagination: {...} }
        if (scholarshipsData && scholarshipsData.scholarships) {
          scholarshipsData = scholarshipsData.scholarships;
        }
        
        // Ensure we always set an array
        setScholarships(Array.isArray(scholarshipsData) ? scholarshipsData : []);
      } else {
        console.error('Failed to fetch scholarships:', response.error);
        enqueueSnackbar('Failed to fetch scholarships', { variant: 'error' });
        setScholarships([]);
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      enqueueSnackbar('Error fetching scholarships', { variant: 'error' });
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await scholarshipAPI.getCountries();
      if (response.success && response.data && response.data.countries) {
        setCountries(response.data.countries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await scholarshipAPI.getUniversities();
      if (response.success && response.data && response.data.universities) {
        setUniversities(response.data.universities);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
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
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.push('Amount must be a positive number');
    }
    if (!formData.eligibility || formData.eligibility.trim() === '') {
      errors.push('Eligibility is required');
    }
    if (!formData.deadline || formData.deadline.trim() === '') {
      errors.push('Deadline is required');
    }
    if (!formData.university || formData.university.trim() === '') {
      errors.push('University is required');
    }
    if (!formData.country || formData.country.trim() === '') {
      errors.push('Country is required');
    }
    if (formData.application_link && formData.application_link.trim() !== '') {
      try {
        new URL(formData.application_link);
      } catch {
        errors.push('Application link must be a valid URL');
      }
    }

    if (errors.length > 0) {
      enqueueSnackbar(errors.join(', '), { variant: 'error' });
      return;
    }
    
    try {
      const submitData = {
        uid: adminUID,
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: Number(formData.amount),
        eligibility: formData.eligibility.trim(),
        deadline: formData.deadline,
        university: formData.university.trim(),
        country: formData.country.trim(),
        application_link: formData.application_link.trim() || undefined,
        requirements: formData.requirements.trim() || undefined
      };

      console.log('Submitting scholarship data:', submitData);

      if (editingScholarship) {
        const response = await scholarshipAPI.update(editingScholarship.id, submitData, adminUID);
        if (response.success) {
          enqueueSnackbar('Scholarship updated successfully', { variant: 'success' });
        } else {
          throw new Error(response.error || 'Failed to update scholarship');
        }
      } else {
        const response = await scholarshipAPI.create(submitData, adminUID);
        if (response.success) {
          enqueueSnackbar('Scholarship created successfully', { variant: 'success' });
        } else {
          throw new Error(response.error || 'Failed to create scholarship');
        }
      }
      
      fetchScholarships();
      fetchCountries(); // Refresh countries in case a new one was added
      fetchUniversities(); // Refresh universities in case a new one was added
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving scholarship:', error);
      const errorMessage = typeof error === 'string' ? error : error.message || 'Error saving scholarship';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this scholarship?')) {
      return;
    }

    const adminUID = getAdminUID();
    if (!adminUID) {
      enqueueSnackbar('Admin UID not available', { variant: 'error' });
      return;
    }

    try {
      const response = await scholarshipAPI.delete(id, adminUID);
      if (response.success) {
        enqueueSnackbar('Scholarship deleted successfully', { variant: 'success' });
        fetchScholarships();
      } else {
        throw new Error(response.error || 'Failed to delete scholarship');
      }
    } catch (error: any) {
      console.error('Error deleting scholarship:', error);
      const errorMessage = typeof error === 'string' ? error : error.message || 'Error deleting scholarship';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleEdit = (scholarship: Scholarship) => {
    setEditingScholarship(scholarship);
    setFormData({
      title: scholarship.title,
      description: scholarship.description,
      amount: scholarship.amount.toString(),
      eligibility: scholarship.eligibility,
      deadline: scholarship.deadline ? scholarship.deadline.split('T')[0] : '',
      university: scholarship.university,
      country: scholarship.country,
      application_link: scholarship.application_link || '',
      requirements: scholarship.requirements || ''
    });
    setIsViewModalOpen(false); // Close view modal if open
    setIsModalOpen(true);
  };

  const handleView = (scholarship: Scholarship) => {
    setViewingScholarship(scholarship);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingScholarship(null);
    setFormData({
      title: '',
      description: '',
      amount: '',
      eligibility: '',
      deadline: '',
      university: '',
      country: '',
      application_link: '',
      requirements: ''
    });
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingScholarship(null);
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxWords: number) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Helper function to format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const filteredScholarships = Array.isArray(scholarships) ? scholarships.filter(scholarship => {
    const matchesSearch = scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.eligibility.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = !filterCountry || scholarship.country === filterCountry;

    return matchesSearch && matchesCountry;
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
      <MainLayout title="Scholarships Management">
        <div className="flex justify-center items-center h-64">
          <motion.div 
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Scholarships Management">
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Futuristic Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 backdrop-blur-sm"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <motion.h1 
                className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Scholarship Management
              </motion.h1>
              <motion.p 
                className="text-green-100 text-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Empower students with funding opportunities worldwide
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
              <IconWrapper icon={FaAward} />
              Add Scholarship
            </motion.button>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-300/20 rounded-full blur-lg animate-bounce"></div>
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
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                List
              </button>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCountry('');
              }}
              className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300"
            >
              Clear All
            </button>
          </div>
        </motion.div>

        {/* Scholarships Grid/List */}
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
            {filteredScholarships.map((scholarship) => (
              <motion.div
                key={scholarship.id}
                variants={itemVariants}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-gray-200/50 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                whileHover={{ y: -8, scale: 1.02 }}
                layout
              >
                {/* Scholarship Header */}
                <div className={`relative ${viewMode === 'grid' ? 'p-6' : 'p-4 flex-1'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <IconWrapper icon={FaAward} className="text-white text-lg" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors duration-300">
                            {scholarship.title}
                          </h3>
                          <p className="text-sm text-gray-500">{scholarship.university}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.button
                        onClick={() => handleView(scholarship)}
                        className="p-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-600/80 backdrop-blur-md"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <IconWrapper icon={FaEye} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleEdit(scholarship)}
                        className="p-2 bg-green-500/80 text-white rounded-full hover:bg-green-600/80 backdrop-blur-md"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <IconWrapper icon={FaEdit} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(scholarship.id)}
                        className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600/80 backdrop-blur-md"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <IconWrapper icon={FaTrash} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Scholarship Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                        <IconWrapper icon={FaDollarSign} className="text-green-600" />
                        <span className="text-green-800 font-medium">{formatAmount(scholarship.amount)}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                        <IconWrapper icon={FaGlobe} className="text-blue-600" />
                        <span className="text-blue-800 text-sm">{scholarship.country}</span>
                      </div>
                    </div>

                    {scholarship.deadline && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <IconWrapper icon={FaCalendarAlt} />
                        <span className="text-sm">Deadline: {formatDate(scholarship.deadline)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {truncateText(scholarship.description, 10)}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scholarship.requirements && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                        {truncateText(scholarship.requirements, 5)}
                      </span>
                    )}
                  </div>

                  {/* Apply Button */}
                  {scholarship.application_link && (
                    <motion.a
                      href={scholarship.application_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconWrapper icon={FaExternalLinkAlt} />
                      Apply Now
                    </motion.a>
                  )}

                  {/* View Details Button */}
                  <motion.button
                    className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleView(scholarship)}
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
        {filteredScholarships.length === 0 && (
          <motion.div 
            className="text-center py-16"
            variants={itemVariants}
          >
            <motion.div
              className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6"
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
              <IconWrapper icon={FaAward} className="text-white text-3xl" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No scholarships found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCountry ? 'Try adjusting your filters' : 'Get started by creating a new scholarship opportunity'}
            </p>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconWrapper icon={FaPlus} />
              Create Your First Scholarship
            </motion.button>
          </motion.div>
        )}

        {/* Create/Edit Modal */}
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
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {editingScholarship ? 'Edit Scholarship' : 'Create New Scholarship'}
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
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 ${
                            formData.title.length > 0 && (formData.title.length < 5 || formData.title.length > 200)
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-gray-300/50'
                          }`}
                          placeholder="Enter scholarship title (5-200 characters)..."
                        />
                        {formData.title.length > 0 && (formData.title.length < 5 || formData.title.length > 200) && (
                          <p className="text-red-500 text-xs mt-1">Title must be between 5 and 200 characters</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount * <span className="text-xs text-gray-500">(USD)</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 ${
                            formData.amount && (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0)
                              ? 'border-red-300 focus:ring-red-500'
                              : 'border-gray-300/50'
                          }`}
                          placeholder="Enter scholarship amount..."
                        />
                        {formData.amount && (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) && (
                          <p className="text-red-500 text-xs mt-1">Amount must be a positive number</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          University *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.university}
                          onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="Enter university name..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country *
                        </label>
                        <select
                          required
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        >
                          <option value="">Select a country</option>
                          {countries.map((country) => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                          <option value="USA">USA</option>
                          <option value="UK">UK</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Netherlands">Netherlands</option>
                          <option value="Sweden">Sweden</option>
                          <option value="Switzerland">Switzerland</option>
                          <option value="Japan">Japan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Country (if not in list)
                        </label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="Enter custom country..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deadline *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description * <span className="text-xs text-gray-500">({formData.description.length} characters, minimum 50)</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 ${
                          formData.description.length > 0 && formData.description.length < 50
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300/50'
                        }`}
                        placeholder="Describe the scholarship program (minimum 50 characters)..."
                      />
                      {formData.description.length > 0 && formData.description.length < 50 && (
                        <p className="text-red-500 text-xs mt-1">Description must be at least 50 characters (currently {formData.description.length})</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Eligibility Criteria *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.eligibility}
                        onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        placeholder="Who can apply for this scholarship..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requirements
                      </label>
                      <textarea
                        rows={3}
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        placeholder="Enter eligibility requirements..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Link
                      </label>
                      <input
                        type="url"
                        value={formData.application_link}
                        onChange={(e) => setFormData({ ...formData, application_link: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 ${
                          formData.application_link && formData.application_link.trim() !== '' && (() => {
                            try { new URL(formData.application_link); return false; } catch { return true; }
                          })() ? 'border-red-300 focus:ring-red-500' : 'border-gray-300/50'
                        }`}
                        placeholder="https://example.com/apply"
                      />
                      {formData.application_link && formData.application_link.trim() !== '' && (() => {
                        try { new URL(formData.application_link); return false; } catch { return true; }
                      })() && (
                        <p className="text-red-500 text-xs mt-1">Please enter a valid URL</p>
                      )}
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
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconWrapper icon={editingScholarship ? FaEdit : FaRocket} />
                        {editingScholarship ? 'Update Scholarship' : 'Create Scholarship'}
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
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {viewingScholarship?.title}
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
                    {/* Meta Information */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <IconWrapper icon={FaUniversity} className="text-green-500" />
                        <span className="text-sm text-gray-700">{viewingScholarship?.university || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconWrapper icon={FaGlobe} className="text-blue-500" />
                        <span className="text-sm text-gray-700">{viewingScholarship?.country || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconWrapper icon={FaDollarSign} className="text-green-500" />
                        <span className="text-sm text-gray-700">{viewingScholarship?.amount ? formatAmount(viewingScholarship.amount) : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconWrapper icon={FaCalendarAlt} className="text-orange-500" />
                        <span className="text-sm text-gray-700">{viewingScholarship?.deadline ? formatDate(viewingScholarship.deadline) : 'N/A'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-800 mb-3">
                        Description
                      </label>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap p-4 bg-gray-50 rounded-lg">
                        {viewingScholarship?.description || 'No description available'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-800 mb-3">
                        Eligibility Criteria
                      </label>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        {viewingScholarship?.eligibility || 'No eligibility criteria available'}
                      </div>
                    </div>

                    {viewingScholarship?.requirements && (
                      <div>
                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                          Requirements
                        </label>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                          {viewingScholarship.requirements}
                        </div>
                      </div>
                    )}

                    {viewingScholarship?.application_link && (
                      <div>
                        <label className="block text-lg font-semibold text-gray-800 mb-3">
                          Application Link
                        </label>
                        <motion.a
                          href={viewingScholarship.application_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <IconWrapper icon={FaExternalLinkAlt} />
                          Apply Now
                        </motion.a>
                      </div>
                    )}

                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                      <motion.button
                        onClick={() => handleEdit(viewingScholarship!)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconWrapper icon={FaEdit} />
                        Edit Scholarship
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

export default Scholarships; 