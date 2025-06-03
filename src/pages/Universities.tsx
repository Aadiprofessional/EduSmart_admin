import React, { useState, useEffect } from 'react';
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
  FaGraduationCap 
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
  ranking_world: number;
  ranking_national: number;
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
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    state: '',
    website_url: '',
    logo_url: '',
    description: '',
    ranking_world: '',
    ranking_national: '',
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
        ranking_world: formData.ranking_world ? parseInt(formData.ranking_world) : null,
        ranking_national: formData.ranking_national ? parseInt(formData.ranking_national) : null,
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
      city: university.city || '',
      state: university.state || '',
      website_url: university.website_url || '',
      logo_url: university.logo_url || '',
      description: university.description || '',
      ranking_world: university.ranking_world?.toString() || '',
      ranking_national: university.ranking_national?.toString() || '',
      acceptance_rate: university.acceptance_rate?.toString() || '',
      tuition_fees: university.tuition_fees || '',
      programs: university.programs?.join(', ') || '',
      established_year: university.established_year?.toString() || '',
      student_population: university.student_population?.toString() || '',
      international_students_percentage: university.international_students_percentage?.toString() || '',
      campus_size: university.campus_size || '',
      notable_alumni: university.notable_alumni?.join(', ') || ''
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
      ranking_world: '',
      ranking_national: '',
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
                         university.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         university.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = !filterCountry || university.country === filterCountry;

    return matchesSearch && matchesCountry;
  });

  const uniqueCountries = Array.from(new Set(universities.map(u => u.country).filter(Boolean)));

  if (loading) {
    return (
      <MainLayout title="Universities Management">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Universities Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Universities Management</h1>
            <p className="text-gray-600">Manage university information and data</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <IconWrapper icon={FaPlus} /> Add University
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <IconWrapper icon={FaSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCountry('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((university) => (
            <div key={university.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {university.logo_url && (
                      <img 
                        src={university.logo_url} 
                        alt={`${university.name} logo`}
                        className="w-12 h-12 object-contain rounded"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {university.name}
                      </h3>
                      <p className="text-sm text-gray-600">{university.city}, {university.country}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(university)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <IconWrapper icon={FaEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(university.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <IconWrapper icon={FaTrash} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {university.ranking_world && (
                    <div className="flex items-center gap-2">
                      <IconWrapper icon={FaGraduationCap} className="text-blue-500" />
                      <span>World Rank: #{university.ranking_world}</span>
                    </div>
                  )}
                  {university.student_population && (
                    <div className="flex items-center gap-2">
                      <IconWrapper icon={FaUsers} className="text-green-500" />
                      <span>{university.student_population.toLocaleString()} students</span>
                    </div>
                  )}
                  {university.acceptance_rate && (
                    <div className="flex items-center gap-2">
                      <IconWrapper icon={FaUniversity} className="text-purple-500" />
                      <span>{university.acceptance_rate}% acceptance rate</span>
                    </div>
                  )}
                  {university.established_year && (
                    <div className="flex items-center gap-2">
                      <IconWrapper icon={FaGlobe} className="text-orange-500" />
                      <span>Est. {university.established_year}</span>
                    </div>
                  )}
                </div>

                {university.description && (
                  <p className="text-gray-700 mt-3 line-clamp-3">
                    {university.description}
                  </p>
                )}

                {university.programs && university.programs.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {university.programs.slice(0, 3).map((program, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {program}
                      </span>
                    ))}
                    {university.programs.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{university.programs.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {university.website_url && (
                  <div className="mt-4">
                    <a
                      href={university.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Visit Website →
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredUniversities.length === 0 && (
          <div className="text-center py-12">
            <IconWrapper icon={FaUniversity} className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No universities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterCountry ? 'Try adjusting your filters' : 'Get started by adding a new university'}
            </p>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingUniversity ? 'Edit University' : 'Add New University'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        University Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={formData.website_url}
                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        World Ranking
                      </label>
                      <input
                        type="number"
                        value={formData.ranking_world}
                        onChange={(e) => setFormData({ ...formData, ranking_world: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        National Ranking
                      </label>
                      <input
                        type="number"
                        value={formData.ranking_national}
                        onChange={(e) => setFormData({ ...formData, ranking_national: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Acceptance Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.acceptance_rate}
                        onChange={(e) => setFormData({ ...formData, acceptance_rate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tuition Fees
                      </label>
                      <input
                        type="text"
                        value={formData.tuition_fees}
                        onChange={(e) => setFormData({ ...formData, tuition_fees: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Established Year
                      </label>
                      <input
                        type="number"
                        value={formData.established_year}
                        onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student Population
                      </label>
                      <input
                        type="number"
                        value={formData.student_population}
                        onChange={(e) => setFormData({ ...formData, student_population: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        International Students (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.international_students_percentage}
                        onChange={(e) => setFormData({ ...formData, international_students_percentage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Campus Size
                      </label>
                      <input
                        type="text"
                        value={formData.campus_size}
                        onChange={(e) => setFormData({ ...formData, campus_size: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Programs (comma-separated)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.programs}
                      onChange={(e) => setFormData({ ...formData, programs: e.target.value })}
                      placeholder="Computer Science, Engineering, Business Administration, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notable Alumni (comma-separated)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notable_alumni}
                      onChange={(e) => setFormData({ ...formData, notable_alumni: e.target.value })}
                      placeholder="John Doe, Jane Smith, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingUniversity ? 'Update' : 'Create'} University
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Universities; 