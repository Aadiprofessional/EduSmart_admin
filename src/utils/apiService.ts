import axios from 'axios';
import { useAuth } from './AuthContext';

// Environment-aware base URL configuration
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://edusmart-server.vercel.app'
  : process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function to make API calls
const apiCall = async (method: string, endpoint: string, data: any = null, adminUid?: string) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      },
      ...(data && { data })
    };

    console.log(`Making ${method} request to ${BASE_URL}${endpoint}`);
    console.log('Request config:', { method, url: config.url, hasData: !!data, dataKeys: data ? Object.keys(data) : [] });
    console.log('Full request data:', data);
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('API Call Error:', {
      method,
      endpoint,
      url: `${BASE_URL}${endpoint}`,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Handle specific error types
    if (error.code === 'ERR_NETWORK') {
      return {
        success: false,
        error: 'Network error - please check your connection and server status',
        status: 0
      };
    }
    
    if (error.message.includes('CORS')) {
      return {
        success: false,
        error: 'CORS error - server configuration issue',
        status: error.response?.status || 0
      };
    }
    
    // Extract meaningful error message from API response
    let errorMessage = error.message;
    if (error.response?.data) {
      const responseData = error.response.data;
      
      // Handle validation errors array
      if (responseData.errors && Array.isArray(responseData.errors)) {
        errorMessage = responseData.errors.join(', ');
      }
      // Handle single error message
      else if (responseData.error) {
        errorMessage = responseData.error;
      }
      // Handle message field
      else if (responseData.message) {
        errorMessage = responseData.message;
      }
      // Handle string response
      else if (typeof responseData === 'string') {
        errorMessage = responseData;
      }
    }
    
    return { 
      success: false, 
      error: errorMessage,
      status: error.response?.status,
      details: error.response?.data
    };
  }
};

// Blog API functions
export const blogAPI = {
  // Get all blogs (public)
  getAll: async (page = 1, limit = 10, category?: string) => {
    let endpoint = `/api/blogs?page=${page}&limit=${limit}`;
    if (category) endpoint += `&category=${category}`;
    return apiCall('GET', endpoint);
  },

  // Get blog by ID (public)
  getById: async (id: string) => {
    return apiCall('GET', `/api/blogs/${id}`);
  },

  // Create blog (admin only)
  create: async (blogData: any, adminUid: string) => {
    // Backend expects 'uid' field for admin verification
    const dataToSend = { ...blogData, uid: adminUid };
    return apiCall('POST', '/api/blogs', dataToSend);
  },

  // Update blog (admin only)
  update: async (id: string, blogData: any, adminUid: string) => {
    // Backend expects 'uid' field for admin verification
    const dataToSend = { ...blogData, uid: adminUid };
    return apiCall('PUT', `/api/blogs/${id}`, dataToSend);
  },

  // Delete blog (admin only)
  delete: async (id: string, adminUid: string) => {
    return apiCall('DELETE', `/api/blogs/${id}`, { uid: adminUid });
  },

  // Get blog categories (public)
  getCategories: async () => {
    return apiCall('GET', '/api/blog-categories');
  }
};

// Scholarship API functions
export const scholarshipAPI = {
  // Get all scholarships (public)
  getAll: async (page = 1, limit = 10, country?: string) => {
    let endpoint = `/api/scholarships?page=${page}&limit=${limit}`;
    if (country) endpoint += `&country=${country}`;
    return apiCall('GET', endpoint);
  },

  // Get scholarship by ID (public)
  getById: async (id: string) => {
    return apiCall('GET', `/api/scholarships/${id}`);
  },

  // Create scholarship (admin only)
  create: async (scholarshipData: any, adminUid: string) => {
    return apiCall('POST', '/api/scholarships', { ...scholarshipData, uid: adminUid });
  },

  // Update scholarship (admin only)
  update: async (id: string, scholarshipData: any, adminUid: string) => {
    return apiCall('PUT', `/api/scholarships/${id}`, { ...scholarshipData, uid: adminUid });
  },

  // Delete scholarship (admin only)
  delete: async (id: string, adminUid: string) => {
    return apiCall('DELETE', `/api/scholarships/${id}`, { uid: adminUid });
  },

  // Get scholarship countries (public)
  getCountries: async () => {
    return apiCall('GET', '/api/scholarship-countries');
  },

  // Get scholarship universities (public)
  getUniversities: async () => {
    return apiCall('GET', '/api/scholarship-universities');
  }
};

// Course API functions
export const courseAPI = {
  // Get all courses (public)
  getAll: async (page = 1, limit = 10, category?: string) => {
    let endpoint = `/api/courses?page=${page}&limit=${limit}`;
    if (category) endpoint += `&category=${category}`;
    return apiCall('GET', endpoint);
  },

  // Get course by ID (public)
  getById: async (id: string) => {
    return apiCall('GET', `/api/courses/${id}`);
  },

  // Create course (admin only)
  create: async (courseData: any, adminUid: string) => {
    return apiCall('POST', '/api/courses', { ...courseData, uid: adminUid });
  },

  // Update course (admin only)
  update: async (id: string, courseData: any, adminUid: string) => {
    return apiCall('PUT', `/api/courses/${id}`, { ...courseData, uid: adminUid });
  },

  // Delete course (admin only)
  delete: async (id: string, adminUid: string) => {
    return apiCall('DELETE', `/api/courses/${id}`, { uid: adminUid });
  }
};

// University API functions
export const universityAPI = {
  // Get all universities (public)
  getAll: async (page = 1, limit = 10, country?: string) => {
    let endpoint = `/api/universities?page=${page}&limit=${limit}`;
    if (country) endpoint += `&country=${country}`;
    return apiCall('GET', endpoint);
  },

  // Get university by ID (public)
  getById: async (id: string) => {
    return apiCall('GET', `/api/universities/${id}`);
  },

  // Create university (admin only)
  create: async (universityData: any, adminUid: string) => {
    return apiCall('POST', '/api/universities', { ...universityData, uid: adminUid });
  },

  // Update university (admin only)
  update: async (id: string, universityData: any, adminUid: string) => {
    return apiCall('PUT', `/api/universities/${id}`, { ...universityData, uid: adminUid });
  },

  // Delete university (admin only)
  delete: async (id: string, adminUid: string) => {
    return apiCall('DELETE', `/api/universities/${id}`, { uid: adminUid });
  },

  // Get university countries (public)
  getCountries: async () => {
    return apiCall('GET', '/api/universities/countries');
  }
};

// Resource API functions
export const resourceAPI = {
  // Get all resources (public)
  getAll: async (page = 1, limit = 10, type?: string) => {
    let endpoint = `/api/resources?page=${page}&limit=${limit}`;
    if (type) endpoint += `&type=${type}`;
    return apiCall('GET', endpoint);
  },

  // Get resource by ID (public)
  getById: async (id: string) => {
    return apiCall('GET', `/api/resources/${id}`);
  },

  // Create resource (admin only)
  create: async (resourceData: any, adminUid: string) => {
    return apiCall('POST', '/api/resources', { ...resourceData, uid: adminUid });
  },

  // Update resource (admin only)
  update: async (id: string, resourceData: any, adminUid: string) => {
    return apiCall('PUT', `/api/resources/${id}`, { ...resourceData, uid: adminUid });
  },

  // Delete resource (admin only)
  delete: async (id: string, adminUid: string) => {
    return apiCall('DELETE', `/api/resources/${id}`, { uid: adminUid });
  }
};

// Response API functions (for Resources page)
export const responseAPI = {
  // Get all responses (public)
  getAll: async (page = 1, limit = 10, type?: string, category?: string) => {
    let endpoint = `/api/responses?page=${page}&limit=${limit}`;
    if (type) endpoint += `&type=${type}`;
    if (category) endpoint += `&category=${category}`;
    return apiCall('GET', endpoint);
  },

  // Get response by ID (public)
  getById: async (id: string) => {
    return apiCall('GET', `/api/responses/${id}`);
  },

  // Create response (admin only)
  create: async (responseData: any, adminUid: string) => {
    return apiCall('POST', '/api/responses', { ...responseData, uid: adminUid });
  },

  // Update response (admin only)
  update: async (id: string, responseData: any, adminUid: string) => {
    return apiCall('PUT', `/api/responses/${id}`, { ...responseData, uid: adminUid });
  },

  // Delete response (admin only)
  delete: async (id: string, adminUid: string) => {
    return apiCall('DELETE', `/api/responses/${id}`, { uid: adminUid });
  },

  // Get response categories (public)
  getCategories: async () => {
    return apiCall('GET', '/api/response-categories');
  },

  // Get response types (public)
  getTypes: async () => {
    return apiCall('GET', '/api/response-types');
  }
};

// Case Study API functions
export const caseStudyAPI = {
  // Get all case studies (public)
  getAll: async (page = 1, limit = 10, category?: string) => {
    let endpoint = `/api/case-studies?page=${page}&limit=${limit}`;
    if (category) endpoint += `&category=${category}`;
    return apiCall('GET', endpoint);
  },

  // Get case study by ID (public)
  getById: async (id: string) => {
    return apiCall('GET', `/api/case-studies/${id}`);
  },

  // Create case study (admin only)
  create: async (caseStudyData: any, adminUid: string) => {
    return apiCall('POST', '/api/case-studies', { ...caseStudyData, uid: adminUid });
  },

  // Update case study (admin only)
  update: async (id: string, caseStudyData: any, adminUid: string) => {
    return apiCall('PUT', `/api/case-studies/${id}`, { ...caseStudyData, uid: adminUid });
  },

  // Delete case study (admin only)
  delete: async (id: string, adminUid: string) => {
    return apiCall('DELETE', `/api/case-studies/${id}`, { uid: adminUid });
  }
};

// Hook to get admin UID from current user
export const useAdminUID = () => {
  const { user } = useAuth();
  return user?.id || null;
};

// Test function to verify API connectivity
export const testAPIConnection = async (adminUid: string) => {
  console.log('🚀 Testing API Connection...');
  
  // Test public endpoints
  const blogsResult = await blogAPI.getAll();
  const scholarshipsResult = await scholarshipAPI.getAll();
  
  console.log('Blogs API:', blogsResult.success ? '✅' : '❌');
  console.log('Scholarships API:', scholarshipsResult.success ? '✅' : '❌');
  
  // Test admin endpoints with a simple blog creation and deletion
  const testBlog = {
    title: 'API Connection Test',
    content: 'Testing API connectivity with proper UID handling for admin verification',
    excerpt: 'Test blog for API connectivity',
    category: 'Test',
    tags: ['test']
  };
  
  const createResult = await blogAPI.create(testBlog, adminUid);
  if (createResult.success) {
    console.log('Blog creation test: ✅');
    // Clean up test blog
    const blogId = createResult.data.blog?.id;
    if (blogId) {
      const deleteResult = await blogAPI.delete(blogId, adminUid);
      console.log('Blog deletion test:', deleteResult.success ? '✅' : '❌');
    }
  } else {
    console.log('Blog creation test: ❌', createResult.error);
  }
  
  return {
    publicEndpoints: blogsResult.success && scholarshipsResult.success,
    adminEndpoints: createResult.success
  };
};

// File upload API function
export const uploadAPI = {
  uploadImage: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${BASE_URL}/api/uploads/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }
}; 