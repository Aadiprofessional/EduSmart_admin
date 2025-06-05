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
import { universityAPI, useAdminUID, uploadAPI } from '../utils/apiService';
import FileUpload from '../components/ui/FileUpload';

interface University {
  id: string;
  name: string;
  description: string;
  country: string;
  city: string;
  state: string;
  address: string;
  website: string;
  contact_email: string;
  contact_phone: string;
  established_year: number;
  type: string;
  ranking: number;
  tuition_fee: number;
  application_fee: number;
  acceptance_rate: number;
  student_population: number;
  faculty_count: number;
  programs_offered: string[];
  facilities: string[];
  image: string;
  logo: string;
  gallery: string[];
  campus_size: string;
  campus_type: string;
  accreditation: string;
  notable_alumni: string[];
  region: string;
  ranking_type: string;
  ranking_year: number;
  slug: string;
  keywords: string[];
  status: string;
  featured: boolean;
  verified: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const Universities: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [viewingUniversity, setViewingUniversity] = useState<University | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    city: '',
    state: '',
    address: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    established_year: '',
    type: '',
    ranking: '',
    tuition_fee: '',
    application_fee: '',
    acceptance_rate: '',
    student_population: '',
    faculty_count: '',
    programs_offered: '',
    facilities: '',
    image: '',
    logo: '',
    campus_size: '',
    campus_type: '',
    accreditation: '',
    notable_alumni: '',
    region: '',
    ranking_type: '',
    ranking_year: '',
    featured: false,
    verified: false
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { enqueueSnackbar } = useSnackbar();
  const adminUid = useAdminUID();

  useEffect(() => {
    fetchUniversities();
    fetchCountries();
  }, [currentPage]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const response = await universityAPI.getAll(currentPage, 10);
      
      if (response.success && response.data) {
        const { universities: universitiesData, pagination } = response.data;
        setUniversities(universitiesData || []);
        setTotalPages(pagination?.totalPages || 1);
      } else {
        enqueueSnackbar('Failed to fetch universities', { variant: 'error' });
        setUniversities([]);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
      enqueueSnackbar('Error fetching universities', { variant: 'error' });
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await universityAPI.getCountries();
      if (response.success && response.data) {
        setCountries(response.data.countries || []);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim() || formData.name.length < 2) {
      errors.push('University name must be at least 2 characters long');
    }
    
    if (formData.description.trim() && formData.description.length < 10) {
      errors.push('Description must be at least 10 characters long');
    }
    
    if (!formData.country.trim()) {
      errors.push('Country is required');
    }
    
    if (!formData.city.trim()) {
      errors.push('City is required');
    }
    
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      errors.push('Website must be a valid URL starting with http:// or https://');
    }
    
    if (formData.contact_email && !formData.contact_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push('Contact email must be a valid email address');
    }
    
    if (formData.established_year && (parseInt(formData.established_year) < 800 || parseInt(formData.established_year) > new Date().getFullYear())) {
      errors.push('Established year must be between 800 and current year');
    }
    
    if (formData.ranking && parseInt(formData.ranking) < 1) {
      errors.push('Ranking must be a positive number');
    }
    
    if (formData.tuition_fee && parseFloat(formData.tuition_fee) < 0) {
      errors.push('Tuition fee cannot be negative');
    }
    
    if (formData.acceptance_rate && (parseFloat(formData.acceptance_rate) < 0 || parseFloat(formData.acceptance_rate) > 100)) {
      errors.push('Acceptance rate must be between 0 and 100');
    }
    
    if (formData.student_population && parseInt(formData.student_population) < 1) {
      errors.push('Student population must be a positive number');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminUid) {
      enqueueSnackbar('Admin authentication required', { variant: 'error' });
      return;
    }
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        enqueueSnackbar(error, { variant: 'error' });
      });
      return;
    }
    
    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        country: formData.country.trim(),
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        address: formData.address.trim() || undefined,
        website: formData.website.trim() || undefined,
        contact_email: formData.contact_email.trim() || undefined,
        contact_phone: formData.contact_phone.trim() || undefined,
        established_year: formData.established_year ? parseInt(formData.established_year) : undefined,
        type: formData.type.trim() || undefined,
        ranking: formData.ranking ? parseInt(formData.ranking) : undefined,
        tuition_fee: formData.tuition_fee ? parseFloat(formData.tuition_fee) : undefined,
        application_fee: formData.application_fee ? parseFloat(formData.application_fee) : undefined,
        acceptance_rate: formData.acceptance_rate ? parseFloat(formData.acceptance_rate) : undefined,
        student_population: formData.student_population ? parseInt(formData.student_population) : undefined,
        faculty_count: formData.faculty_count ? parseInt(formData.faculty_count) : undefined,
        programs_offered: formData.programs_offered ? formData.programs_offered.split(',').map(p => p.trim()).filter(p => p) : [],
        facilities: formData.facilities ? formData.facilities.split(',').map(f => f.trim()).filter(f => f) : [],
        image: formData.image.trim() || undefined,
        logo: formData.logo.trim() || undefined,
        campus_size: formData.campus_size.trim() || undefined,
        campus_type: formData.campus_type.trim() || undefined,
        accreditation: formData.accreditation.trim() || undefined,
        notable_alumni: formData.notable_alumni ? formData.notable_alumni.split(',').map(a => a.trim()).filter(a => a) : [],
        region: formData.region.trim() || undefined,
        ranking_type: formData.ranking_type.trim() || undefined,
        ranking_year: formData.ranking_year ? parseInt(formData.ranking_year) : undefined,
        featured: formData.featured,
        verified: formData.verified
      };

      let response;
      if (editingUniversity) {
        response = await universityAPI.update(editingUniversity.id, submitData, adminUid);
      } else {
        response = await universityAPI.create(submitData, adminUid);
      }

      if (response.success) {
        enqueueSnackbar(
          editingUniversity ? 'University updated successfully' : 'University created successfully',
          { variant: 'success' }
        );
        fetchUniversities();
        handleCloseModal();
      } else {
        enqueueSnackbar(response.error || 'Operation failed', { variant: 'error' });
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

    if (!adminUid) {
      enqueueSnackbar('Admin authentication required', { variant: 'error' });
      return;
    }

    try {
      const response = await universityAPI.delete(id, adminUid);

      if (response.success) {
        enqueueSnackbar('University deleted successfully', { variant: 'success' });
        fetchUniversities();
      } else {
        enqueueSnackbar(response.error || 'Failed to delete university', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting university:', error);
      enqueueSnackbar('Error deleting university', { variant: 'error' });
    }
  };

  const handleEdit = (university: University) => {
    setEditingUniversity(university);
    setFormData({
      name: university.name || '',
      description: university.description || '',
      country: university.country || '',
      city: university.city || '',
      state: university.state || '',
      address: university.address || '',
      website: university.website || '',
      contact_email: university.contact_email || '',
      contact_phone: university.contact_phone || '',
      established_year: university.established_year ? university.established_year.toString() : '',
      type: university.type || '',
      ranking: university.ranking ? university.ranking.toString() : '',
      tuition_fee: university.tuition_fee ? university.tuition_fee.toString() : '',
      application_fee: university.application_fee ? university.application_fee.toString() : '',
      acceptance_rate: university.acceptance_rate ? university.acceptance_rate.toString() : '',
      student_population: university.student_population ? university.student_population.toString() : '',
      faculty_count: university.faculty_count ? university.faculty_count.toString() : '',
      programs_offered: university.programs_offered ? university.programs_offered.join(', ') : '',
      facilities: university.facilities ? university.facilities.join(', ') : '',
      image: university.image || '',
      logo: university.logo || '',
      campus_size: university.campus_size || '',
      campus_type: university.campus_type || '',
      accreditation: university.accreditation || '',
      notable_alumni: university.notable_alumni ? university.notable_alumni.join(', ') : '',
      region: university.region || '',
      ranking_type: university.ranking_type || '',
      ranking_year: university.ranking_year ? university.ranking_year.toString() : '',
      featured: university.featured || false,
      verified: university.verified || false
    });
    setIsModalOpen(true);
  };

  const handleView = (university: University) => {
    setViewingUniversity(university);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingUniversity(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUniversity(null);
    setFormData({
      name: '',
      description: '',
      country: '',
      city: '',
      state: '',
      address: '',
      website: '',
      contact_email: '',
      contact_phone: '',
      established_year: '',
      type: '',
      ranking: '',
      tuition_fee: '',
      application_fee: '',
      acceptance_rate: '',
      student_population: '',
      faculty_count: '',
      programs_offered: '',
      facilities: '',
      image: '',
      logo: '',
      campus_size: '',
      campus_type: '',
      accreditation: '',
      notable_alumni: '',
      region: '',
      ranking_type: '',
      ranking_year: '',
      featured: false,
      verified: false
    });
  };

  const filteredUniversities = Array.isArray(universities) ? universities.filter(university => {
    const matchesSearch = university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         university.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         university.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = !filterCountry || university.country === filterCountry;

    return matchesSearch && matchesCountry;
  }) : [];

  const uniqueCountries = Array.from(new Set(Array.isArray(universities) ? universities.map(u => u.country).filter(Boolean) : []));

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
                  {university.image || university.logo ? (
                    <img 
                      src={university.image || university.logo} 
                      alt={university.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback to logo if image fails, then to default
                        const target = e.target as HTMLImageElement;
                        if (target.src === university.image && university.logo) {
                          target.src = university.logo;
                        } else {
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback gradient background */}
                  <div className={`w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center ${university.image || university.logo ? 'hidden' : ''}`}>
                    <IconWrapper icon={FaUniversity} className="text-white text-4xl" />
                  </div>
                  
                  {/* Ranking Badge */}
                  {university.ranking && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-yellow-500/90 text-white text-xs font-bold rounded-full backdrop-blur-md">
                        #{university.ranking}
                      </span>
                    </div>
                  )}

                  {/* Edit/Delete Action Buttons */}
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
                    </div>

                    {/* Programs */}
                    {university.programs_offered && university.programs_offered.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Popular Programs:</p>
                        <div className="flex flex-wrap gap-2">
                          {university.programs_offered.slice(0, 3).map((program, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium"
                            >
                              {program}
                            </span>
                          ))}
                          {university.programs_offered.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{university.programs_offered.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 mt-4">
                    {/* Visit Website Button */}
                    {university.website && (
                      <motion.a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconWrapper icon={FaGlobe} />
                        Visit Website
                      </motion.a>
                    )}
                    
                    {/* View Details Button */}
                    <motion.button
                      onClick={() => handleView(university)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconWrapper icon={FaEye} />
                      View Details
                    </motion.button>
                  </div>
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
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="https://university.edu"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="admissions@university.edu"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.contact_phone}
                          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="+1-555-123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo Upload
                        </label>
                        <FileUpload
                          onFileSelect={async (file) => {
                            setLogoFile(file);
                            if (file) {
                              try {
                                // Upload file to server
                                const uploadResult = await uploadAPI.uploadImage(file);
                                if (uploadResult.success) {
                                  // Use the server URL
                                  const serverUrl = `${process.env.NODE_ENV === 'production' 
                                    ? 'https://edusmart-server.vercel.app' 
                                    : 'http://localhost:8000'}${uploadResult.data.url}`;
                                  setFormData({ ...formData, logo: serverUrl });
                                  enqueueSnackbar('Logo uploaded successfully!', { variant: 'success' });
                                } else {
                                  enqueueSnackbar(`Upload failed: ${uploadResult.error}`, { variant: 'error' });
                                  // Fallback to temporary URL for preview
                                  const tempUrl = URL.createObjectURL(file);
                                  setFormData({ ...formData, logo: tempUrl });
                                }
                              } catch (error) {
                                console.error('Upload error:', error);
                                enqueueSnackbar('Upload failed. Using temporary preview.', { variant: 'warning' });
                                // Fallback to temporary URL for preview
                                const tempUrl = URL.createObjectURL(file);
                                setFormData({ ...formData, logo: tempUrl });
                              }
                            } else {
                              setFormData({ ...formData, logo: '' });
                            }
                          }}
                          currentImageUrl={formData.logo}
                          label="University Logo"
                          placeholder="Upload university logo"
                          maxSize={2}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="https://example.com/university-image.jpg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          World Ranking
                        </label>
                        <input
                          type="number"
                          value={formData.ranking}
                          onChange={(e) => setFormData({ ...formData, ranking: e.target.value })}
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
                          Faculty Count
                        </label>
                        <input
                          type="number"
                          value={formData.faculty_count}
                          onChange={(e) => setFormData({ ...formData, faculty_count: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 2,500"
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          University Type
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        >
                          <option value="">Select Type</option>
                          <option value="Public">Public</option>
                          <option value="Private">Private</option>
                          <option value="Private Non-Profit">Private Non-Profit</option>
                          <option value="For-Profit">For-Profit</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Campus Type
                        </label>
                        <select
                          value={formData.campus_type}
                          onChange={(e) => setFormData({ ...formData, campus_type: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        >
                          <option value="">Select Campus Type</option>
                          <option value="Urban">Urban</option>
                          <option value="Suburban">Suburban</option>
                          <option value="Rural">Rural</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tuition Fee (USD)
                        </label>
                        <input
                          type="number"
                          value={formData.tuition_fee}
                          onChange={(e) => setFormData({ ...formData, tuition_fee: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 45000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Application Fee (USD)
                        </label>
                        <input
                          type="number"
                          value={formData.application_fee}
                          onChange={(e) => setFormData({ ...formData, application_fee: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 75"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Region
                        </label>
                        <input
                          type="text"
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., West Coast, Northeast"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ranking Type
                        </label>
                        <select
                          value={formData.ranking_type}
                          onChange={(e) => setFormData({ ...formData, ranking_type: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        >
                          <option value="">Select Ranking Type</option>
                          <option value="QS">QS World University Rankings</option>
                          <option value="TIMES">Times Higher Education</option>
                          <option value="ARWU">Academic Ranking of World Universities</option>
                          <option value="US News">US News & World Report</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ranking Year
                        </label>
                        <input
                          type="number"
                          value={formData.ranking_year}
                          onChange={(e) => setFormData({ ...formData, ranking_year: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 2024"
                          min="2000"
                          max={new Date().getFullYear()}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Accreditation
                        </label>
                        <input
                          type="text"
                          value={formData.accreditation}
                          onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., WASC, MSCHE"
                        />
                      </div>
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
                        value={formData.programs_offered}
                        onChange={(e) => setFormData({ ...formData, programs_offered: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        placeholder="Computer Science, Engineering, Medicine, Business..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facilities (comma-separated)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.facilities}
                        onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        placeholder="Library, Sports Complex, Research Labs..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notable Alumni (comma-separated)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notable_alumni}
                        onChange={(e) => setFormData({ ...formData, notable_alumni: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        placeholder="John Doe, Jane Smith, Famous Person..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured
                      </label>
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verified
                      </label>
                      <input
                        type="checkbox"
                        checked={formData.verified}
                        onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
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

        {/* View University Modal */}
        <AnimatePresence>
          {isViewModalOpen && viewingUniversity && (
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
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      University Details
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
                    {/* University Header */}
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3">
                        {viewingUniversity.image || viewingUniversity.logo ? (
                          <img 
                            src={viewingUniversity.image || viewingUniversity.logo} 
                            alt={viewingUniversity.name}
                            className="w-full h-48 object-cover rounded-xl"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src === viewingUniversity.image && viewingUniversity.logo) {
                                target.src = viewingUniversity.logo;
                              } else {
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-48 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center ${viewingUniversity.image || viewingUniversity.logo ? 'hidden' : ''}`}>
                          <IconWrapper icon={FaUniversity} className="text-white text-4xl" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{viewingUniversity.name}</h3>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <IconWrapper icon={FaMapMarkerAlt} className="text-purple-500" />
                          <span className="text-gray-600">
                            {viewingUniversity.city}, {viewingUniversity.country}
                            {viewingUniversity.state && `, ${viewingUniversity.state}`}
                          </span>
                        </div>

                        {viewingUniversity.ranking && (
                          <div className="mb-4">
                            <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-bold rounded-full">
                              World Ranking: #{viewingUniversity.ranking}
                            </span>
                          </div>
                        )}

                        {viewingUniversity.description && (
                          <p className="text-gray-700 mb-4">{viewingUniversity.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          {viewingUniversity.featured && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Featured</span>
                          )}
                          {viewingUniversity.verified && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Verified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* University Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {viewingUniversity.established_year && (
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <IconWrapper icon={FaCalendarAlt} className="text-blue-600" />
                            <h4 className="font-semibold text-blue-800">Established</h4>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">{viewingUniversity.established_year}</p>
                        </div>
                      )}
                      
                      {viewingUniversity.student_population && (
                        <div className="bg-green-50 p-4 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <IconWrapper icon={FaUsers} className="text-green-600" />
                            <h4 className="font-semibold text-green-800">Students</h4>
                          </div>
                          <p className="text-2xl font-bold text-green-900">{viewingUniversity.student_population.toLocaleString()}</p>
                        </div>
                      )}
                      
                      {viewingUniversity.acceptance_rate && (
                        <div className="bg-orange-50 p-4 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <IconWrapper icon={FaChartLine} className="text-orange-600" />
                            <h4 className="font-semibold text-orange-800">Acceptance Rate</h4>
                          </div>
                          <p className="text-2xl font-bold text-orange-900">{viewingUniversity.acceptance_rate}%</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contact Information */}
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                        <div className="space-y-3">
                          {viewingUniversity.website && (
                            <div className="flex items-center gap-3">
                              <IconWrapper icon={FaGlobe} className="text-purple-500" />
                              <a 
                                href={viewingUniversity.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-800 underline"
                              >
                                Visit Website
                              </a>
                            </div>
                          )}
                          {viewingUniversity.contact_email && (
                            <div className="flex items-center gap-3">
                              <IconWrapper icon={FaGlobe} className="text-blue-500" />
                              <span className="text-gray-700">{viewingUniversity.contact_email}</span>
                            </div>
                          )}
                          {viewingUniversity.contact_phone && (
                            <div className="flex items-center gap-3">
                              <IconWrapper icon={FaGlobe} className="text-green-500" />
                              <span className="text-gray-700">{viewingUniversity.contact_phone}</span>
                            </div>
                          )}
                          {viewingUniversity.address && (
                            <div className="flex items-start gap-3">
                              <IconWrapper icon={FaMapMarkerAlt} className="text-red-500 mt-1" />
                              <span className="text-gray-700">{viewingUniversity.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Academic Information */}
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h4>
                        <div className="space-y-3">
                          {viewingUniversity.type && (
                            <div>
                              <span className="font-medium text-gray-700">Type: </span>
                              <span className="text-gray-600">{viewingUniversity.type}</span>
                            </div>
                          )}
                          {viewingUniversity.faculty_count && (
                            <div>
                              <span className="font-medium text-gray-700">Faculty: </span>
                              <span className="text-gray-600">{viewingUniversity.faculty_count.toLocaleString()}</span>
                            </div>
                          )}
                          {viewingUniversity.campus_size && (
                            <div>
                              <span className="font-medium text-gray-700">Campus Size: </span>
                              <span className="text-gray-600">{viewingUniversity.campus_size}</span>
                            </div>
                          )}
                          {viewingUniversity.campus_type && (
                            <div>
                              <span className="font-medium text-gray-700">Campus Type: </span>
                              <span className="text-gray-600">{viewingUniversity.campus_type}</span>
                            </div>
                          )}
                          {viewingUniversity.accreditation && (
                            <div>
                              <span className="font-medium text-gray-700">Accreditation: </span>
                              <span className="text-gray-600">{viewingUniversity.accreditation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Programs Offered */}
                    {viewingUniversity.programs_offered && viewingUniversity.programs_offered.length > 0 && (
                      <div className="bg-indigo-50 p-6 rounded-xl">
                        <h4 className="text-lg font-semibold text-indigo-900 mb-4">Programs Offered</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingUniversity.programs_offered.map((program, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-indigo-200 text-indigo-800 text-sm rounded-full font-medium"
                            >
                              {program}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Facilities */}
                    {viewingUniversity.facilities && viewingUniversity.facilities.length > 0 && (
                      <div className="bg-green-50 p-6 rounded-xl">
                        <h4 className="text-lg font-semibold text-green-900 mb-4">Facilities</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingUniversity.facilities.map((facility, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-green-200 text-green-800 text-sm rounded-full font-medium"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notable Alumni */}
                    {viewingUniversity.notable_alumni && viewingUniversity.notable_alumni.length > 0 && (
                      <div className="bg-yellow-50 p-6 rounded-xl">
                        <h4 className="text-lg font-semibold text-yellow-900 mb-4">Notable Alumni</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingUniversity.notable_alumni.map((alumni, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-yellow-200 text-yellow-800 text-sm rounded-full font-medium"
                            >
                              {alumni}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Financial Information */}
                    {(viewingUniversity.tuition_fee || viewingUniversity.application_fee) && (
                      <div className="bg-purple-50 p-6 rounded-xl">
                        <h4 className="text-lg font-semibold text-purple-900 mb-4">Financial Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {viewingUniversity.tuition_fee && (
                            <div>
                              <span className="font-medium text-purple-700">Tuition Fee: </span>
                              <span className="text-purple-600">${viewingUniversity.tuition_fee.toLocaleString()}</span>
                            </div>
                          )}
                          {viewingUniversity.application_fee && (
                            <div>
                              <span className="font-medium text-purple-700">Application Fee: </span>
                              <span className="text-purple-600">${viewingUniversity.application_fee.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                      <motion.button
                        onClick={() => handleEdit(viewingUniversity)}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconWrapper icon={FaEdit} />
                        Edit University
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

export default Universities; 