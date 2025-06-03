import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaUniversity, 
  FaGlobe, 
  FaUsers, 
  FaGraduationCap,
  FaRocket,
  FaStar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaChartLine
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';

interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  state: string;
  website_url: string;
  logo_url: string;
  description: string;
  rankings: number;
  acceptance_rate: number;
  tuition_fees: string;
  programs: string[];
  established_year: number;
  student_population: number;
  international_students_percentage: number;
  campus_size: string;
  notable_alumni: string[];
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://edusmart-server.vercel.app/api';

const Universities: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    state: '',
    website_url: '',
    logo_url: '',
    description: '',
    rankings: '',
    acceptance_rate: '',
    tuition_fees: '',
    programs: '',
    established_year: '',
    student_population: '',
    international_students_percentage: '',
    campus_size: '',
    notable_alumni: ''
  });

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/universities`);
      const data = await response.json();
      
      if (data.success) {
        setUniversities(data.data);
      } else {
        enqueueSnackbar('Failed to fetch universities', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
      enqueueSnackbar('Error fetching universities', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        rankings: formData.rankings ? parseInt(formData.rankings) : null,
        acceptance_rate: formData.acceptance_rate ? parseFloat(formData.acceptance_rate) : null,
        established_year: formData.established_year ? parseInt(formData.established_year) : null,
        student_population: formData.student_population ? parseInt(formData.student_population) : null,
        international_students_percentage: formData.international_students_percentage ? parseFloat(formData.international_students_percentage) : null,
        programs: formData.programs ? formData.programs.split(',').map(p => p.trim()) : [],
        notable_alumni: formData.notable_alumni ? formData.notable_alumni.split(',').map(a => a.trim()) : []
      };

      const url = editingUniversity 
        ? `${API_BASE_URL}/universities/${editingUniversity.id}`
        : `${API_BASE_URL}/universities`;
      
      const method = editingUniversity ? 'PUT' : 'POST';
      
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
          editingUniversity ? 'University updated successfully' : 'University created successfully',
          { variant: 'success' }
        );
        fetchUniversities();
        handleCloseModal();
      } else {
        enqueueSnackbar(data.message || 'Operation failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving university:', error);
      enqueueSnackbar('Error saving university', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this university?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/universities/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        enqueueSnackbar('University deleted successfully', { variant: 'success' });
        fetchUniversities();
      } else {
        enqueueSnackbar(data.message || 'Failed to delete university', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting university:', error);
      enqueueSnackbar('Error deleting university', { variant: 'error' });
    }
  };

  const handleEdit = (university: University) => {
    setEditingUniversity(university);
    setFormData({
      name: university.name,
      country: university.country,
      city: university.city,
      state: university.state || '',
      website_url: university.website_url || '',
      logo_url: university.logo_url || '',
      description: university.description || '',
      rankings: university.rankings ? university.rankings.toString() : '',
      acceptance_rate: university.acceptance_rate ? university.acceptance_rate.toString() : '',
      tuition_fees: university.tuition_fees || '',
      programs: university.programs ? university.programs.join(', ') : '',
      established_year: university.established_year ? university.established_year.toString() : '',
      student_population: university.student_population ? university.student_population.toString() : '',
      international_students_percentage: university.international_students_percentage ? university.international_students_percentage.toString() : '',
      campus_size: university.campus_size || '',
      notable_alumni: university.notable_alumni ? university.notable_alumni.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUniversity(null);
    setFormData({
      name: '',
      country: '',
      city: '',
      state: '',
      website_url: '',
      logo_url: '',
      description: '',
      rankings: '',
      acceptance_rate: '',
      tuition_fees: '',
      programs: '',
      established_year: '',
      student_population: '',
      international_students_percentage: '',
      campus_size: '',
      notable_alumni: ''
    });
  };

  const filteredUniversities = universities.filter(university => {
    const matchesSearch = university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         university.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         university.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = !filterCountry || university.country === filterCountry;

    return matchesSearch && matchesCountry;
  });

  const uniqueCountries = Array.from(new Set(universities.map(u => u.country).filter(Boolean)));

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
      <MainLayout title="Universities Management">
        <div className="flex justify-center items-center h-64">
          <motion.div 
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Universities Management">
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Futuristic Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 backdrop-blur-sm"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <motion.h1 
                className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                University Management
              </motion.h1>
              <motion.p 
                className="text-purple-100 text-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Discover and manage world-class educational institutions
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
              <IconWrapper icon={FaUniversity} />
              Add University
            </motion.button>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-300/20 rounded-full blur-lg animate-bounce"></div>
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
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-purple-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-purple-500 text-white shadow-lg' 
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

        {/* Universities Grid */}
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
            {filteredUniversities.map((university) => (
              <motion.div
                key={university.id}
                variants={itemVariants}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-gray-200/50 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                whileHover={{ y: -8, scale: 1.02 }}
                layout
              >
                {/* University Logo/Header */}
                <div className={`relative ${viewMode === 'grid' ? 'h-48' : 'w-48 h-32'}`}>
                  {university.logo_url ? (
                    <img 
                      src={university.logo_url} 
                      alt={university.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                      <IconWrapper icon={FaUniversity} className="text-white text-4xl" />
                    </div>
                  )}
                  
                  {/* Ranking Badge */}
                  {university.rankings && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-yellow-500/90 text-white text-xs font-bold rounded-full backdrop-blur-md">
                        #{university.rankings}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                      onClick={() => handleEdit(university)}
                      className="p-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconWrapper icon={FaEdit} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(university.id)}
                      className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600/80 backdrop-blur-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconWrapper icon={FaTrash} />
                    </motion.button>
                  </div>
                </div>

                {/* University Content */}
                <div className={`p-6 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                      {university.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <IconWrapper icon={FaMapMarkerAlt} className="text-purple-500" />
                      <span className="text-gray-600 text-sm">
                        {university.city}, {university.country}
                      </span>
                    </div>

                    {university.description && (
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {university.description}
                      </p>
                    )}

                    {/* University Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {university.established_year && (
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                          <IconWrapper icon={FaCalendarAlt} className="text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-600 font-medium">Founded</p>
                            <p className="text-sm font-bold text-blue-800">{university.established_year}</p>
                          </div>
                        </div>
                      )}
                      
                      {university.student_population && (
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                          <IconWrapper icon={FaUsers} className="text-green-600" />
                          <div>
                            <p className="text-xs text-green-600 font-medium">Students</p>
                            <p className="text-sm font-bold text-green-800">{university.student_population.toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      
                      {university.acceptance_rate && (
                        <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                          <IconWrapper icon={FaChartLine} className="text-orange-600" />
                          <div>
                            <p className="text-xs text-orange-600 font-medium">Acceptance</p>
                            <p className="text-sm font-bold text-orange-800">{university.acceptance_rate}%</p>
                          </div>
                        </div>
                      )}
                      
                      {university.international_students_percentage && (
                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                          <IconWrapper icon={FaGlobe} className="text-purple-600" />
                          <div>
                            <p className="text-xs text-purple-600 font-medium">International</p>
                            <p className="text-sm font-bold text-purple-800">{university.international_students_percentage}%</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Programs */}
                    {university.programs && university.programs.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Popular Programs:</p>
                        <div className="flex flex-wrap gap-2">
                          {university.programs.slice(0, 3).map((program, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium"
                            >
                              {program}
                            </span>
                          ))}
                          {university.programs.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{university.programs.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visit Website Button */}
                  {university.website_url && (
                    <motion.a
                      href={university.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconWrapper icon={FaGlobe} />
                      Visit Website
                    </motion.a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredUniversities.length === 0 && (
          <motion.div 
            className="text-center py-16"
            variants={itemVariants}
          >
            <motion.div
              className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mb-6"
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
              <IconWrapper icon={FaUniversity} className="text-white text-3xl" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No universities found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCountry ? 'Try adjusting your filters' : 'Get started by adding a new university'}
            </p>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconWrapper icon={FaPlus} />
              Add First University
            </motion.button>
          </motion.div>
        )}

        {/* Enhanced Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {editingUniversity ? 'Edit University' : 'Add New University'}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          University Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="Enter university name..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="Country..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="City..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="State or province..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website URL
                        </label>
                        <input
                          type="url"
                          value={formData.website_url}
                          onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="https://university.edu"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo URL
                        </label>
                        <input
                          type="url"
                          value={formData.logo_url}
                          onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          World Ranking
                        </label>
                        <input
                          type="number"
                          value={formData.rankings}
                          onChange={(e) => setFormData({ ...formData, rankings: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Acceptance Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.acceptance_rate}
                          onChange={(e) => setFormData({ ...formData, acceptance_rate: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 15.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Established Year
                        </label>
                        <input
                          type="number"
                          value={formData.established_year}
                          onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 1885"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student Population
                        </label>
                        <input
                          type="number"
                          value={formData.student_population}
                          onChange={(e) => setFormData({ ...formData, student_population: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 45000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          International Students (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.international_students_percentage}
                          onChange={(e) => setFormData({ ...formData, international_students_percentage: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 25.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Campus Size
                        </label>
                        <input
                          type="text"
                          value={formData.campus_size}
                          onChange={(e) => setFormData({ ...formData, campus_size: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 1,200 acres"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tuition Fees
                      </label>
                      <input
                        type="text"
                        value={formData.tuition_fees}
                        onChange={(e) => setFormData({ ...formData, tuition_fees: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        placeholder="e.g., $50,000 per year"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        placeholder="Brief description of the university..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Programs (comma-separated)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.programs}
                        onChange={(e) => setFormData({ ...formData, programs: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        placeholder="Computer Science, Engineering, Medicine, Business..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notable Alumni (comma-separated)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.notable_alumni}
                        onChange={(e) => setFormData({ ...formData, notable_alumni: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        placeholder="Famous graduates and their achievements..."
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
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconWrapper icon={editingUniversity ? FaEdit : FaUniversity} />
                        {editingUniversity ? 'Update University' : 'Add University'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </MainLayout>
  );
};

export default Universities; 