import React, { useState, useEffect } from 'react';
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
  FaGlobe 
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';

interface Scholarship {
  id: string;
  title: string;
  description: string;
  provider: string;
  amount: string;
  deadline: string;
  eligibility: string;
  application_url: string;
  country: string;
  field: string;
  level: string;
  type: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://edusmart-server.vercel.app/api';

const Scholarships: React.FC = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    provider: '',
    amount: '',
    deadline: '',
    eligibility: '',
    application_url: '',
    country: '',
    field: '',
    level: '',
    type: ''
  });

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/scholarships`);
      const data = await response.json();
      
      if (data.success) {
        setScholarships(data.data);
      } else {
        enqueueSnackbar('Failed to fetch scholarships', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      enqueueSnackbar('Error fetching scholarships', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingScholarship 
        ? `${API_BASE_URL}/scholarships/${editingScholarship.id}`
        : `${API_BASE_URL}/scholarships`;
      
      const method = editingScholarship ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        enqueueSnackbar(
          editingScholarship ? 'Scholarship updated successfully' : 'Scholarship created successfully',
          { variant: 'success' }
        );
        fetchScholarships();
        handleCloseModal();
      } else {
        enqueueSnackbar(data.message || 'Operation failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving scholarship:', error);
      enqueueSnackbar('Error saving scholarship', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this scholarship?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/scholarships/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        enqueueSnackbar('Scholarship deleted successfully', { variant: 'success' });
        fetchScholarships();
      } else {
        enqueueSnackbar(data.message || 'Failed to delete scholarship', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      enqueueSnackbar('Error deleting scholarship', { variant: 'error' });
    }
  };

  const handleEdit = (scholarship: Scholarship) => {
    setEditingScholarship(scholarship);
    setFormData({
      title: scholarship.title,
      description: scholarship.description,
      provider: scholarship.provider,
      amount: scholarship.amount,
      deadline: scholarship.deadline ? scholarship.deadline.split('T')[0] : '',
      eligibility: scholarship.eligibility,
      application_url: scholarship.application_url,
      country: scholarship.country,
      field: scholarship.field,
      level: scholarship.level,
      type: scholarship.type
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingScholarship(null);
    setFormData({
      title: '',
      description: '',
      provider: '',
      amount: '',
      deadline: '',
      eligibility: '',
      application_url: '',
      country: '',
      field: '',
      level: '',
      type: ''
    });
  };

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || scholarship.type === filterType;
    const matchesCountry = !filterCountry || scholarship.country === filterCountry;

    return matchesSearch && matchesType && matchesCountry;
  });

  const uniqueTypes = Array.from(new Set(scholarships.map(s => s.type).filter(Boolean)));
  const uniqueCountries = Array.from(new Set(scholarships.map(s => s.country).filter(Boolean)));

  if (loading) {
    return (
      <MainLayout title="Scholarships Management">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Scholarships Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scholarships Management</h1>
            <p className="text-gray-600">Manage scholarship opportunities for students</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <IconWrapper icon={FaPlus} /> Add Scholarship
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <IconWrapper icon={FaSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

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
                setFilterType('');
                setFilterCountry('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Scholarships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship) => (
            <div key={scholarship.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {scholarship.title}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(scholarship)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <IconWrapper icon={FaEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(scholarship.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <IconWrapper icon={FaTrash} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <IconWrapper icon={FaGraduationCap} className="text-blue-500" />
                    <span>{scholarship.provider}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconWrapper icon={FaDollarSign} className="text-green-500" />
                    <span>{scholarship.amount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconWrapper icon={FaGlobe} className="text-purple-500" />
                    <span>{scholarship.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconWrapper icon={FaCalendarAlt} className="text-orange-500" />
                    <span>{scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'No deadline'}</span>
                  </div>
                </div>

                <p className="text-gray-700 mt-3 line-clamp-3">
                  {scholarship.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {scholarship.type}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {scholarship.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredScholarships.length === 0 && (
          <div className="text-center py-12">
            <IconWrapper icon={FaGraduationCap} className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No scholarships found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType || filterCountry ? 'Try adjusting your filters' : 'Get started by creating a new scholarship'}
            </p>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provider *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.provider}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline
                      </label>
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field
                      </label>
                      <input
                        type="text"
                        value={formData.field}
                        onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Level
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Level</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Graduate">Graduate</option>
                        <option value="PhD">PhD</option>
                        <option value="All">All</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Type</option>
                        <option value="Merit-based">Merit-based</option>
                        <option value="Need-based">Need-based</option>
                        <option value="Field-specific">Field-specific</option>
                        <option value="Country-specific">Country-specific</option>
                        <option value="University-specific">University-specific</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application URL
                    </label>
                    <input
                      type="url"
                      value={formData.application_url}
                      onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eligibility
                    </label>
                    <textarea
                      rows={3}
                      value={formData.eligibility}
                      onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
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
                      {editingScholarship ? 'Update' : 'Create'} Scholarship
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

export default Scholarships; 