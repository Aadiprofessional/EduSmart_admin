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
  min_gpa_required?: number;
  sat_score_required?: string;
  act_score_required?: string;
  ielts_score_required?: string;
  toefl_score_required?: string;
  gre_score_required?: string;
  gmat_score_required?: string;
  application_deadline_fall?: string;
  application_deadline_spring?: string;
  application_deadline_summer?: string;
  tuition_fee_graduate?: number;
  scholarship_available?: boolean;
  financial_aid_available?: boolean;
  application_requirements?: string[];
  admission_essay_required?: boolean;
  letters_of_recommendation_required?: number;
  interview_required?: boolean;
  work_experience_required?: boolean;
  portfolio_required?: boolean;
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
    verified: false,
    min_gpa_required: '',
    sat_score_required: '',
    act_score_required: '',
    ielts_score_required: '',
    toefl_score_required: '',
    gre_score_required: '',
    gmat_score_required: '',
    application_deadline_fall: '',
    application_deadline_spring: '',
    application_deadline_summer: '',
    tuition_fee_graduate: '',
    scholarship_available: false,
    financial_aid_available: false,
    application_requirements: '',
    admission_essay_required: false,
    letters_of_recommendation_required: '',
    interview_required: false,
    work_experience_required: false,
    portfolio_required: false
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
        verified: formData.verified,
        min_gpa_required: formData.min_gpa_required ? parseFloat(formData.min_gpa_required) : undefined,
        sat_score_required: formData.sat_score_required.trim() || undefined,
        act_score_required: formData.act_score_required.trim() || undefined,
        ielts_score_required: formData.ielts_score_required.trim() || undefined,
        toefl_score_required: formData.toefl_score_required.trim() || undefined,
        gre_score_required: formData.gre_score_required.trim() || undefined,
        gmat_score_required: formData.gmat_score_required.trim() || undefined,
        application_deadline_fall: formData.application_deadline_fall.trim() || undefined,
        application_deadline_spring: formData.application_deadline_spring.trim() || undefined,
        application_deadline_summer: formData.application_deadline_summer.trim() || undefined,
        tuition_fee_graduate: formData.tuition_fee_graduate ? parseInt(formData.tuition_fee_graduate) : undefined,
        scholarship_available: formData.scholarship_available,
        financial_aid_available: formData.financial_aid_available,
        application_requirements: formData.application_requirements ? formData.application_requirements.split(',').map(r => r.trim()).filter(r => r) : [],
        admission_essay_required: formData.admission_essay_required,
        letters_of_recommendation_required: formData.letters_of_recommendation_required ? parseInt(formData.letters_of_recommendation_required) : undefined,
        interview_required: formData.interview_required,
        work_experience_required: formData.work_experience_required,
        portfolio_required: formData.portfolio_required
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
      verified: university.verified || false,
      min_gpa_required: university.min_gpa_required ? university.min_gpa_required.toString() : '',
      sat_score_required: university.sat_score_required || '',
      act_score_required: university.act_score_required || '',
      ielts_score_required: university.ielts_score_required || '',
      toefl_score_required: university.toefl_score_required || '',
      gre_score_required: university.gre_score_required || '',
      gmat_score_required: university.gmat_score_required || '',
      application_deadline_fall: university.application_deadline_fall || '',
      application_deadline_spring: university.application_deadline_spring || '',
      application_deadline_summer: university.application_deadline_summer || '',
      tuition_fee_graduate: university.tuition_fee_graduate ? university.tuition_fee_graduate.toString() : '',
      scholarship_available: university.scholarship_available || false,
      financial_aid_available: university.financial_aid_available || false,
      application_requirements: university.application_requirements ? university.application_requirements.join(', ') : '',
      admission_essay_required: university.admission_essay_required || false,
      letters_of_recommendation_required: university.letters_of_recommendation_required ? university.letters_of_recommendation_required.toString() : '',
      interview_required: university.interview_required || false,
      work_experience_required: university.work_experience_required || false,
      portfolio_required: university.portfolio_required || false
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
      verified: false,
      min_gpa_required: '',
      sat_score_required: '',
      act_score_required: '',
      ielts_score_required: '',
      toefl_score_required: '',
      gre_score_required: '',
      gmat_score_required: '',
      application_deadline_fall: '',
      application_deadline_spring: '',
      application_deadline_summer: '',
      tuition_fee_graduate: '',
      scholarship_available: false,
      financial_aid_available: false,
      application_requirements: '',
      admission_essay_required: false,
      letters_of_recommendation_required: '',
      interview_required: false,
      work_experience_required: false,
      portfolio_required: false
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
                                // Upload file to Supabase storage via server
                                const uploadResult = await uploadAPI.uploadImage(file);
                                if (uploadResult.success) {
                                  // Use the Supabase public URL directly
                                  const supabaseUrl = uploadResult.data.url;
                                  setFormData({ ...formData, logo: supabaseUrl });
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

                    {/* Admission Requirements Section */}
                    <div className="col-span-full">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Admission Requirements
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum GPA Required
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="4.0"
                          value={formData.min_gpa_required}
                          onChange={(e) => setFormData({ ...formData, min_gpa_required: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 3.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SAT Score Required
                        </label>
                        <input
                          type="text"
                          value={formData.sat_score_required}
                          onChange={(e) => setFormData({ ...formData, sat_score_required: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 1200+ or 1200-1400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ACT Score Required
                        </label>
                        <input
                          type="text"
                          value={formData.act_score_required}
                          onChange={(e) => setFormData({ ...formData, act_score_required: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 26+ or 26-30"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IELTS Score Required
                        </label>
                        <input
                          type="text"
                          value={formData.ielts_score_required}
                          onChange={(e) => setFormData({ ...formData, ielts_score_required: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 6.5 or 6.5+"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          TOEFL Score Required
                        </label>
                        <input
                          type="text"
                          value={formData.toefl_score_required}
                          onChange={(e) => setFormData({ ...formData, toefl_score_required: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 80 or 80+"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GRE Score Required
                        </label>
                        <input
                          type="text"
                          value={formData.gre_score_required}
                          onChange={(e) => setFormData({ ...formData, gre_score_required: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 310+ or 310-320"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GMAT Score Required
                        </label>
                        <input
                          type="text"
                          value={formData.gmat_score_required}
                          onChange={(e) => setFormData({ ...formData, gmat_score_required: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 650+ or 650-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Letters of Recommendation Required
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={formData.letters_of_recommendation_required}
                          onChange={(e) => setFormData({ ...formData, letters_of_recommendation_required: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 2"
                        />
                      </div>
                    </div>

                    {/* Application Deadlines Section */}
                    <div className="col-span-full">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Application Deadlines
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fall Semester Deadline
                        </label>
                        <input
                          type="text"
                          value={formData.application_deadline_fall}
                          onChange={(e) => setFormData({ ...formData, application_deadline_fall: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., September 1, 2024"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Spring Semester Deadline
                        </label>
                        <input
                          type="text"
                          value={formData.application_deadline_spring}
                          onChange={(e) => setFormData({ ...formData, application_deadline_spring: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., January 15, 2024"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Summer Semester Deadline
                        </label>
                        <input
                          type="text"
                          value={formData.application_deadline_summer}
                          onChange={(e) => setFormData({ ...formData, application_deadline_summer: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., May 1, 2024"
                        />
                      </div>
                    </div>

                    {/* Financial Information Section */}
                    <div className="col-span-full">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Financial Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Graduate Tuition Fee (USD)
                        </label>
                        <input
                          type="number"
                          value={formData.tuition_fee_graduate}
                          onChange={(e) => setFormData({ ...formData, tuition_fee_graduate: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                          placeholder="e.g., 55000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Scholarship Available
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.scholarship_available}
                            onChange={(e) => setFormData({ ...formData, scholarship_available: e.target.checked })}
                            className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          />
                          <span className="ml-2 text-sm text-gray-700">Yes, scholarships are available</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Financial Aid Available
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.financial_aid_available}
                            onChange={(e) => setFormData({ ...formData, financial_aid_available: e.target.checked })}
                            className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          />
                          <span className="ml-2 text-sm text-gray-700">Yes, financial aid is available</span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Requirements Section */}
                    <div className="col-span-full">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Additional Requirements
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Requirements (comma-separated)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.application_requirements}
                        onChange={(e) => setFormData({ ...formData, application_requirements: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300"
                        placeholder="Transcripts, Personal Statement, Resume, Portfolio..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admission Essay Required
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.admission_essay_required}
                            onChange={(e) => setFormData({ ...formData, admission_essay_required: e.target.checked })}
                            className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          />
                          <span className="ml-2 text-sm text-gray-700">Required</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Interview Required
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.interview_required}
                            onChange={(e) => setFormData({ ...formData, interview_required: e.target.checked })}
                            className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          />
                          <span className="ml-2 text-sm text-gray-700">Required</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Work Experience Required
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.work_experience_required}
                            onChange={(e) => setFormData({ ...formData, work_experience_required: e.target.checked })}
                            className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          />
                          <span className="ml-2 text-sm text-gray-700">Required</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Portfolio Required
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.portfolio_required}
                            onChange={(e) => setFormData({ ...formData, portfolio_required: e.target.checked })}
                            className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          />
                          <span className="ml-2 text-sm text-gray-700">Required</span>
                        </div>
                      </div>
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
                className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200/50"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 p-6 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                        {viewingUniversity.logo ? (
                          <img 
                            src={viewingUniversity.logo} 
                            alt={viewingUniversity.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <IconWrapper icon={FaUniversity} className={`text-white text-2xl ${viewingUniversity.logo ? 'hidden' : ''}`} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          {viewingUniversity.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <IconWrapper icon={FaMapMarkerAlt} className="text-purple-500 text-sm" />
                          <span className="text-gray-600">
                            {viewingUniversity.city}, {viewingUniversity.country}
                          </span>
                          {viewingUniversity.ranking && (
                            <span className="ml-4 px-3 py-1 bg-yellow-500 text-white text-sm font-bold rounded-full">
                              #{viewingUniversity.ranking}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleCloseViewModal}
                      className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-8 space-y-8">
                  {/* Hero Section with Image */}
                  {viewingUniversity.image && (
                    <motion.div 
                      className="relative h-64 rounded-2xl overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <img 
                        src={viewingUniversity.image} 
                        alt={viewingUniversity.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 text-white">
                        <div className="flex flex-wrap gap-2">
                          {viewingUniversity.featured && (
                            <span className="px-3 py-1 bg-purple-500/80 backdrop-blur-md text-white text-sm rounded-full font-medium">
                              <IconWrapper icon={FaStar} className="inline mr-1" />
                              Featured
                            </span>
                          )}
                          {viewingUniversity.verified && (
                            <span className="px-3 py-1 bg-green-500/80 backdrop-blur-md text-white text-sm rounded-full font-medium">
                              ✓ Verified
                            </span>
                          )}
                          {viewingUniversity.type && (
                            <span className="px-3 py-1 bg-blue-500/80 backdrop-blur-md text-white text-sm rounded-full font-medium">
                              {viewingUniversity.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Description */}
                  {viewingUniversity.description && (
                    <motion.div 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className="text-xl font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <IconWrapper icon={FaUniversity} className="text-blue-600" />
                        About the University
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{viewingUniversity.description}</p>
                    </motion.div>
                  )}

                  {/* Key Statistics */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {viewingUniversity.established_year && (
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
                        <div className="flex items-center gap-3 mb-2">
                          <IconWrapper icon={FaCalendarAlt} className="text-blue-100 text-xl" />
                          <h4 className="font-semibold text-blue-100">Founded</h4>
                        </div>
                        <p className="text-3xl font-bold">{viewingUniversity.established_year}</p>
                      </div>
                    )}
                    
                    {viewingUniversity.student_population && (
                      <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
                        <div className="flex items-center gap-3 mb-2">
                          <IconWrapper icon={FaUsers} className="text-green-100 text-xl" />
                          <h4 className="font-semibold text-green-100">Students</h4>
                        </div>
                        <p className="text-3xl font-bold">{viewingUniversity.student_population.toLocaleString()}</p>
                      </div>
                    )}
                    
                    {viewingUniversity.acceptance_rate && (
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white">
                        <div className="flex items-center gap-3 mb-2">
                          <IconWrapper icon={FaChartLine} className="text-orange-100 text-xl" />
                          <h4 className="font-semibold text-orange-100">Acceptance Rate</h4>
                        </div>
                        <p className="text-3xl font-bold">{viewingUniversity.acceptance_rate}%</p>
                      </div>
                    )}

                    {viewingUniversity.faculty_count && (
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
                        <div className="flex items-center gap-3 mb-2">
                          <IconWrapper icon={FaGraduationCap} className="text-purple-100 text-xl" />
                          <h4 className="font-semibold text-purple-100">Faculty</h4>
                        </div>
                        <p className="text-3xl font-bold">{viewingUniversity.faculty_count.toLocaleString()}</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Contact & Location Information */}
                  <motion.div 
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <IconWrapper icon={FaGlobe} className="text-blue-600" />
                        Contact Information
                      </h3>
                      <div className="space-y-4">
                        {viewingUniversity.website && (
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <IconWrapper icon={FaGlobe} className="text-blue-600" />
                            <div>
                              <p className="text-sm text-blue-600 font-medium">Website</p>
                              <a 
                                href={viewingUniversity.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:text-blue-900 underline font-medium"
                              >
                                Visit Official Website
                              </a>
                            </div>
                          </div>
                        )}
                        {viewingUniversity.contact_email && (
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                            </svg>
                            <div>
                              <p className="text-sm text-green-600 font-medium">Email</p>
                              <a 
                                href={`mailto:${viewingUniversity.contact_email}`}
                                className="text-green-700 hover:text-green-900 underline font-medium"
                              >
                                {viewingUniversity.contact_email}
                              </a>
                            </div>
                          </div>
                        )}
                        {viewingUniversity.contact_phone && (
                          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                            </svg>
                            <div>
                              <p className="text-sm text-purple-600 font-medium">Phone</p>
                              <a 
                                href={`tel:${viewingUniversity.contact_phone}`}
                                className="text-purple-700 hover:text-purple-900 underline font-medium"
                              >
                                {viewingUniversity.contact_phone}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <IconWrapper icon={FaMapMarkerAlt} className="text-red-600" />
                        Location & Campus
                      </h3>
                      <div className="space-y-4">
                        <div className="p-3 bg-red-50 rounded-xl">
                          <p className="text-sm text-red-600 font-medium mb-1">Address</p>
                          <p className="text-gray-700">
                            {viewingUniversity.address || `${viewingUniversity.city}, ${viewingUniversity.state ? viewingUniversity.state + ', ' : ''}${viewingUniversity.country}`}
                          </p>
                        </div>
                        {viewingUniversity.campus_size && (
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <p className="text-sm text-blue-600 font-medium mb-1">Campus Size</p>
                            <p className="text-gray-700">{viewingUniversity.campus_size}</p>
                          </div>
                        )}
                        {viewingUniversity.campus_type && (
                          <div className="p-3 bg-green-50 rounded-xl">
                            <p className="text-sm text-green-600 font-medium mb-1">Campus Type</p>
                            <p className="text-gray-700">{viewingUniversity.campus_type}</p>
                          </div>
                        )}
                        {viewingUniversity.region && (
                          <div className="p-3 bg-purple-50 rounded-xl">
                            <p className="text-sm text-purple-600 font-medium mb-1">Region</p>
                            <p className="text-gray-700">{viewingUniversity.region}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Academic Information */}
                  <motion.div 
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-xl font-semibold text-indigo-900 mb-6 flex items-center gap-2">
                      <IconWrapper icon={FaGraduationCap} className="text-indigo-600" />
                      Academic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {viewingUniversity.accreditation && (
                        <div className="bg-white p-4 rounded-xl border border-indigo-200">
                          <p className="text-sm text-indigo-600 font-medium mb-1">Accreditation</p>
                          <p className="text-gray-700 font-semibold">{viewingUniversity.accreditation}</p>
                        </div>
                      )}
                      {viewingUniversity.ranking_type && (
                        <div className="bg-white p-4 rounded-xl border border-indigo-200">
                          <p className="text-sm text-indigo-600 font-medium mb-1">Ranking System</p>
                          <p className="text-gray-700 font-semibold">{viewingUniversity.ranking_type}</p>
                        </div>
                      )}
                      {viewingUniversity.ranking_year && (
                        <div className="bg-white p-4 rounded-xl border border-indigo-200">
                          <p className="text-sm text-indigo-600 font-medium mb-1">Ranking Year</p>
                          <p className="text-gray-700 font-semibold">{viewingUniversity.ranking_year}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Programs Offered */}
                  {viewingUniversity.programs_offered && viewingUniversity.programs_offered.length > 0 && (
                    <motion.div 
                      className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center gap-2">
                        <IconWrapper icon={FaRocket} className="text-green-600" />
                        Programs Offered ({viewingUniversity.programs_offered.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {viewingUniversity.programs_offered.map((program, index) => (
                          <div 
                            key={index}
                            className="bg-white p-3 rounded-xl border border-green-200 hover:shadow-md transition-shadow duration-300"
                          >
                            <span className="text-green-800 font-medium">{program}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Facilities */}
                  {viewingUniversity.facilities && viewingUniversity.facilities.length > 0 && (
                    <motion.div 
                      className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                        </svg>
                        Campus Facilities ({viewingUniversity.facilities.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {viewingUniversity.facilities.map((facility, index) => (
                          <div 
                            key={index}
                            className="bg-white p-3 rounded-xl border border-blue-200 hover:shadow-md transition-shadow duration-300"
                          >
                            <span className="text-blue-800 font-medium">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Financial Information */}
                  <motion.div 
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h3 className="text-xl font-semibold text-yellow-900 mb-6 flex items-center gap-2">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                      </svg>
                      Financial Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {viewingUniversity.tuition_fee && (
                        <div className="bg-white p-4 rounded-xl border border-yellow-200">
                          <p className="text-sm text-yellow-600 font-medium mb-1">Undergraduate Tuition</p>
                          <p className="text-2xl font-bold text-yellow-800">${viewingUniversity.tuition_fee.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">per year</p>
                        </div>
                      )}
                      {viewingUniversity.tuition_fee_graduate && (
                        <div className="bg-white p-4 rounded-xl border border-yellow-200">
                          <p className="text-sm text-yellow-600 font-medium mb-1">Graduate Tuition</p>
                          <p className="text-2xl font-bold text-yellow-800">${viewingUniversity.tuition_fee_graduate.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">per year</p>
                        </div>
                      )}
                      {viewingUniversity.application_fee && (
                        <div className="bg-white p-4 rounded-xl border border-yellow-200">
                          <p className="text-sm text-yellow-600 font-medium mb-1">Application Fee</p>
                          <p className="text-2xl font-bold text-yellow-800">${viewingUniversity.application_fee.toLocaleString()}</p>
                        </div>
                      )}
                      <div className="bg-white p-4 rounded-xl border border-yellow-200">
                        <p className="text-sm text-yellow-600 font-medium mb-2">Financial Aid</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${viewingUniversity.scholarship_available ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm text-gray-700">Scholarships</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${viewingUniversity.financial_aid_available ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm text-gray-700">Financial Aid</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Admission Requirements */}
                  <motion.div 
                    className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <h3 className="text-xl font-semibold text-red-900 mb-6 flex items-center gap-2">
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
                      </svg>
                      Admission Requirements
                    </h3>
                    
                    {/* Test Score Requirements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {viewingUniversity.min_gpa_required && (
                        <div className="bg-white p-4 rounded-xl border border-red-200">
                          <p className="text-sm text-red-600 font-medium mb-1">Minimum GPA</p>
                          <p className="text-2xl font-bold text-red-800">{viewingUniversity.min_gpa_required}</p>
                          <p className="text-xs text-gray-500">out of 4.0</p>
                        </div>
                      )}
                      {viewingUniversity.sat_score_required && (
                        <div className="bg-white p-4 rounded-xl border border-red-200">
                          <p className="text-sm text-red-600 font-medium mb-1">SAT Score</p>
                          <p className="text-lg font-bold text-red-800">{viewingUniversity.sat_score_required}</p>
                        </div>
                      )}
                      {viewingUniversity.act_score_required && (
                        <div className="bg-white p-4 rounded-xl border border-red-200">
                          <p className="text-sm text-red-600 font-medium mb-1">ACT Score</p>
                          <p className="text-lg font-bold text-red-800">{viewingUniversity.act_score_required}</p>
                        </div>
                      )}
                      {viewingUniversity.ielts_score_required && (
                        <div className="bg-white p-4 rounded-xl border border-red-200">
                          <p className="text-sm text-red-600 font-medium mb-1">IELTS Score</p>
                          <p className="text-lg font-bold text-red-800">{viewingUniversity.ielts_score_required}</p>
                        </div>
                      )}
                      {viewingUniversity.toefl_score_required && (
                        <div className="bg-white p-4 rounded-xl border border-red-200">
                          <p className="text-sm text-red-600 font-medium mb-1">TOEFL Score</p>
                          <p className="text-lg font-bold text-red-800">{viewingUniversity.toefl_score_required}</p>
                        </div>
                      )}
                      {viewingUniversity.gre_score_required && (
                        <div className="bg-white p-4 rounded-xl border border-red-200">
                          <p className="text-sm text-red-600 font-medium mb-1">GRE Score</p>
                          <p className="text-lg font-bold text-red-800">{viewingUniversity.gre_score_required}</p>
                        </div>
                      )}
                      {viewingUniversity.gmat_score_required && (
                        <div className="bg-white p-4 rounded-xl border border-red-200">
                          <p className="text-sm text-red-600 font-medium mb-1">GMAT Score</p>
                          <p className="text-lg font-bold text-red-800">{viewingUniversity.gmat_score_required}</p>
                        </div>
                      )}
                      {viewingUniversity.letters_of_recommendation_required && (
                        <div className="bg-white p-4 rounded-xl border border-red-200">
                          <p className="text-sm text-red-600 font-medium mb-1">Letters of Recommendation</p>
                          <p className="text-2xl font-bold text-red-800">{viewingUniversity.letters_of_recommendation_required}</p>
                          <p className="text-xs text-gray-500">required</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Requirements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-xl border border-red-200">
                        <p className="text-sm text-red-600 font-medium mb-2">Admission Essay</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${viewingUniversity.admission_essay_required ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm text-gray-700">{viewingUniversity.admission_essay_required ? 'Required' : 'Not Required'}</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-red-200">
                        <p className="text-sm text-red-600 font-medium mb-2">Interview</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${viewingUniversity.interview_required ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm text-gray-700">{viewingUniversity.interview_required ? 'Required' : 'Not Required'}</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-red-200">
                        <p className="text-sm text-red-600 font-medium mb-2">Work Experience</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${viewingUniversity.work_experience_required ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm text-gray-700">{viewingUniversity.work_experience_required ? 'Required' : 'Not Required'}</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-red-200">
                        <p className="text-sm text-red-600 font-medium mb-2">Portfolio</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${viewingUniversity.portfolio_required ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm text-gray-700">{viewingUniversity.portfolio_required ? 'Required' : 'Not Required'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Application Requirements */}
                    {viewingUniversity.application_requirements && viewingUniversity.application_requirements.length > 0 && (
                      <div className="bg-white p-4 rounded-xl border border-red-200">
                        <p className="text-sm text-red-600 font-medium mb-3">Application Requirements</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {viewingUniversity.application_requirements.map((requirement, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">{requirement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Application Deadlines */}
                  {(viewingUniversity.application_deadline_fall || viewingUniversity.application_deadline_spring || viewingUniversity.application_deadline_summer) && (
                    <motion.div 
                      className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                    >
                      <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <IconWrapper icon={FaCalendarAlt} className="text-purple-600" />
                        Application Deadlines
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {viewingUniversity.application_deadline_fall && (
                          <div className="bg-white p-4 rounded-xl border border-purple-200">
                            <p className="text-sm text-purple-600 font-medium mb-1">Fall Semester</p>
                            <p className="text-lg font-bold text-purple-800">{viewingUniversity.application_deadline_fall}</p>
                          </div>
                        )}
                        {viewingUniversity.application_deadline_spring && (
                          <div className="bg-white p-4 rounded-xl border border-purple-200">
                            <p className="text-sm text-purple-600 font-medium mb-1">Spring Semester</p>
                            <p className="text-lg font-bold text-purple-800">{viewingUniversity.application_deadline_spring}</p>
                          </div>
                        )}
                        {viewingUniversity.application_deadline_summer && (
                          <div className="bg-white p-4 rounded-xl border border-purple-200">
                            <p className="text-sm text-purple-600 font-medium mb-1">Summer Semester</p>
                            <p className="text-lg font-bold text-purple-800">{viewingUniversity.application_deadline_summer}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Notable Alumni */}
                  {viewingUniversity.notable_alumni && viewingUniversity.notable_alumni.length > 0 && (
                    <motion.div 
                      className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-2xl border border-amber-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 }}
                    >
                      <h3 className="text-xl font-semibold text-amber-900 mb-4 flex items-center gap-2">
                        <IconWrapper icon={FaStar} className="text-amber-600" />
                        Notable Alumni ({viewingUniversity.notable_alumni.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {viewingUniversity.notable_alumni.map((alumni, index) => (
                          <div 
                            key={index}
                            className="bg-white p-3 rounded-xl border border-amber-200 hover:shadow-md transition-shadow duration-300"
                          >
                            <span className="text-amber-800 font-medium">{alumni}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div 
                    className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="flex flex-wrap gap-3">
                      {viewingUniversity.website && (
                        <motion.a
                          href={viewingUniversity.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <IconWrapper icon={FaGlobe} />
                          Visit Website
                        </motion.a>
                      )}
                      <motion.button
                        onClick={() => {
                          handleCloseViewModal();
                          handleEdit(viewingUniversity);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconWrapper icon={FaEdit} />
                        Edit University
                      </motion.button>
                    </div>
                    <motion.button
                      onClick={handleCloseViewModal}
                      className="px-8 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Close
                    </motion.button>
                  </motion.div>
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