import { supabaseAdmin } from './supabase';
import { User, Course, Blog, Scholarship, Resource, CaseStudy, DashboardStats, ApplicationFilter } from './types';
import { Application, Profile } from './supabase';
import { courseAPI } from './apiService';

const API_BASE_URL = 'https://edusmart-server.vercel.app/api';

// User Management - Updated to use the correct API endpoints
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && Array.isArray(data.data)) {
      return data.data as User[];
    } else {
      console.error('Unexpected API response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching users from API:', error);
    
    // Fallback to Supabase direct access
    try {
      const { data, error: supabaseError } = await supabaseAdmin
        .from('profiles')
        .select('*');

      if (supabaseError) {
        console.error('Error fetching users from Supabase:', supabaseError);
        throw supabaseError;
      }

      return data as User[];
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user from API:', error);
    
    // Fallback to Supabase direct access
    try {
      const { data, error: supabaseError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (supabaseError) {
        console.error('Error fetching user from Supabase:', supabaseError);
        throw supabaseError;
      }

      return data as User;
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

export const getUserStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/stats/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    } else {
      throw new Error('Failed to fetch user statistics');
    }
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

export const updateUserAdmin = async (userId: string, isAdmin: boolean): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_admin: isAdmin }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to update user admin status');
    }
  } catch (error) {
    console.error('Error updating user admin status via API:', error);
    
    // Fallback to Supabase direct access
    try {
      const { error: supabaseError } = await supabaseAdmin
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId);

      if (supabaseError) {
        console.error('Error updating user admin status via Supabase:', supabaseError);
        throw supabaseError;
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

// Add alias functions for specific user admin operations
export const makeUserAdmin = async (userId: string): Promise<void> => {
  return updateUserAdmin(userId, true);
};

export const removeAdminStatus = async (userId: string): Promise<void> => {
  return updateUserAdmin(userId, false);
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user via API:', error);
    
    // Fallback to Supabase direct access
    try {
      // First delete the profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        throw profileError;
      }

      // Then delete the auth user
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('Error deleting auth user:', authError);
        throw authError;
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

export const getUserApplications = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching user applications:', error);
    throw error;
  }
};

// Course Management
export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await courseAPI.getAll();
    if (response.success) {
      // Handle the API response structure
      let coursesData = response.data;
      
      // The API returns { courses: [...], pagination: {...} }
      if (coursesData && coursesData.courses) {
        coursesData = coursesData.courses;
      }
      
      return Array.isArray(coursesData) ? coursesData : [];
    } else {
      throw new Error(response.error || 'Failed to fetch courses');
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const response = await courseAPI.getById(courseId);
    if (response.success) {
      return response.data.course || null;
    } else {
      throw new Error(response.error || 'Failed to fetch course');
    }
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

export const createCourse = async (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> => {
  try {
    const adminUid = 'bca2f806-29c5-4be9-bc2d-a484671546cd'; // Admin UID
    const response = await courseAPI.create(course, adminUid);
    
    if (response.success) {
      return response.data.course;
    } else {
      throw new Error(response.error || 'Failed to create course');
    }
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const updateCourse = async (courseId: string, course: Partial<Course>): Promise<Course> => {
  try {
    const adminUid = 'bca2f806-29c5-4be9-bc2d-a484671546cd'; // Admin UID
    const response = await courseAPI.update(courseId, course, adminUid);
    
    if (response.success) {
      return response.data.course;
    } else {
      throw new Error(response.error || 'Failed to update course');
    }
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  try {
    const adminUid = 'bca2f806-29c5-4be9-bc2d-a484671546cd'; // Admin UID
    const response = await courseAPI.delete(courseId, adminUid);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete course');
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Blog Management
export const getBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabaseAdmin
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }

  return data as Blog[];
};

export const getBlogById = async (blogId: string): Promise<Blog | null> => {
  const { data, error } = await supabaseAdmin
    .from('blogs')
    .select('*')
    .eq('id', blogId)
    .single();

  if (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }

  return data as Blog;
};

export const createBlog = async (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>): Promise<Blog> => {
  const { data, error } = await supabaseAdmin
    .from('blogs')
    .insert([{ ...blog, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select();

  if (error) {
    console.error('Error creating blog:', error);
    throw error;
  }

  return data[0] as Blog;
};

export const updateBlog = async (blogId: string, blog: Partial<Blog>): Promise<Blog> => {
  const { data, error } = await supabaseAdmin
    .from('blogs')
    .update({ ...blog, updated_at: new Date().toISOString() })
    .eq('id', blogId)
    .select();

  if (error) {
    console.error('Error updating blog:', error);
    throw error;
  }

  return data[0] as Blog;
};

export const deleteBlog = async (blogId: string): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('blogs')
    .delete()
    .eq('id', blogId);

  if (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

// Scholarship Management
export const getScholarships = async (): Promise<Scholarship[]> => {
  const { data, error } = await supabaseAdmin
    .from('scholarships')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching scholarships:', error);
    throw error;
  }

  return data as Scholarship[];
};

export const getScholarshipById = async (scholarshipId: string): Promise<Scholarship | null> => {
  const { data, error } = await supabaseAdmin
    .from('scholarships')
    .select('*')
    .eq('id', scholarshipId)
    .single();

  if (error) {
    console.error('Error fetching scholarship:', error);
    throw error;
  }

  return data as Scholarship;
};

export const createScholarship = async (scholarship: Omit<Scholarship, 'id' | 'created_at' | 'updated_at'>): Promise<Scholarship> => {
  const { data, error } = await supabaseAdmin
    .from('scholarships')
    .insert([{ ...scholarship, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select();

  if (error) {
    console.error('Error creating scholarship:', error);
    throw error;
  }

  return data[0] as Scholarship;
};

export const updateScholarship = async (scholarshipId: string, scholarship: Partial<Scholarship>): Promise<Scholarship> => {
  const { data, error } = await supabaseAdmin
    .from('scholarships')
    .update({ ...scholarship, updated_at: new Date().toISOString() })
    .eq('id', scholarshipId)
    .select();

  if (error) {
    console.error('Error updating scholarship:', error);
    throw error;
  }

  return data[0] as Scholarship;
};

export const deleteScholarship = async (scholarshipId: string): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('scholarships')
    .delete()
    .eq('id', scholarshipId);

  if (error) {
    console.error('Error deleting scholarship:', error);
    throw error;
  }
};

// Application Management
export const getApplications = async (filter?: ApplicationFilter): Promise<Application[]> => {
  let query = supabaseAdmin
    .from('applications')
    .select('*');

  if (filter) {
    if (filter.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    }

    if (filter.search) {
      query = query.or(`school_name.ilike.%${filter.search}%,program.ilike.%${filter.search}%`);
    }

    if (filter.sortBy) {
      query = query.order(filter.sortBy, { ascending: filter.sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }

  return data as Application[];
};

// Resource Management
export const getResources = async (): Promise<Resource[]> => {
  const { data, error } = await supabaseAdmin
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }

  return data as Resource[];
};

export const createResource = async (resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>): Promise<Resource> => {
  const { data, error } = await supabaseAdmin
    .from('resources')
    .insert([{ ...resource, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select();

  if (error) {
    console.error('Error creating resource:', error);
    throw error;
  }

  return data[0] as Resource;
};

export const updateResource = async (resourceId: string, resource: Partial<Resource>): Promise<Resource> => {
  const { data, error } = await supabaseAdmin
    .from('resources')
    .update({ ...resource, updated_at: new Date().toISOString() })
    .eq('id', resourceId)
    .select();

  if (error) {
    console.error('Error updating resource:', error);
    throw error;
  }

  return data[0] as Resource;
};

export const deleteResource = async (resourceId: string): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('resources')
    .delete()
    .eq('id', resourceId);

  if (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
};

// Case Studies Management
export const getCaseStudies = async (): Promise<CaseStudy[]> => {
  const { data, error } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching case studies:', error);
    throw error;
  }

  return data as CaseStudy[];
};

export const createCaseStudy = async (caseStudy: Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>): Promise<CaseStudy> => {
  const { data, error } = await supabaseAdmin
    .from('case_studies')
    .insert([{ ...caseStudy, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select();

  if (error) {
    console.error('Error creating case study:', error);
    throw error;
  }

  return data[0] as CaseStudy;
};

export const updateCaseStudy = async (caseStudyId: string, caseStudy: Partial<CaseStudy>): Promise<CaseStudy> => {
  const { data, error } = await supabaseAdmin
    .from('case_studies')
    .update({ ...caseStudy, updated_at: new Date().toISOString() })
    .eq('id', caseStudyId)
    .select();

  if (error) {
    console.error('Error updating case study:', error);
    throw error;
  }

  return data[0] as CaseStudy;
};

export const deleteCaseStudy = async (caseStudyId: string): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('case_studies')
    .delete()
    .eq('id', caseStudyId);

  if (error) {
    console.error('Error deleting case study:', error);
    throw error;
  }
};

// Dashboard Statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('Fetching dashboard statistics...');
    
    // Default stats in case of errors
    const defaultStats: DashboardStats = {
      totalUsers: 0,
      newUsersThisMonth: 0,
      totalCourses: 0,
      totalApplications: 0,
      totalResources: 0,
      totalBlogs: 0,
      totalScholarships: 0,
      totalCaseStudies: 0,
      totalResponses: 0,
      applicationsByStatus: {
        pending: 0,
        submitted: 0,
        accepted: 0,
        rejected: 0,
        waitlisted: 0,
      }
    };
    
    // Get current date and one month ago date
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Format dates for Supabase queries
    const nowISO = now.toISOString();
    const oneMonthAgoISO = oneMonthAgo.toISOString();

    // Safely fetch counts with error handling for each query
    let totalUsers = 0;
    let newUsersThisMonth = 0;
    let totalCourses = 0;
    let totalApplications = 0;
    let totalResources = 0;
    let totalBlogs = 0;
    let totalScholarships = 0;
    let totalCaseStudies = 0;
    let totalResponses = 0;
    
    // Get total users - with error handling
    try {
      const usersResponse = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      totalUsers = usersResponse.count || 0;
    } catch (error) {
      console.error('Error fetching users count:', error);
    }
    
    // Get new users this month - with error handling
    try {
      const { data: profilesData } = await supabaseAdmin
        .from('profiles')
        .select('created_at');
        
      if (profilesData) {
        const oneMonthAgoDate = new Date(oneMonthAgoISO);
        const nowDate = new Date(nowISO);
        
        newUsersThisMonth = profilesData.filter(profile => {
          if (!profile.created_at) return false;
          const createdDate = new Date(profile.created_at);
          return createdDate >= oneMonthAgoDate && createdDate <= nowDate;
        }).length;
        
        console.log(`Found ${newUsersThisMonth} new users in the last month`);
      }
    } catch (error) {
      console.error('Error fetching new users count:', error);
    }
    
    // Get total courses - with error handling
    try {
      const coursesResponse = await supabaseAdmin
        .from('courses')
        .select('*', { count: 'exact', head: true });
        
      totalCourses = coursesResponse.count || 0;
    } catch (error) {
      console.error('Error fetching courses count:', error);
    }
    
    // Get total applications - with error handling
    try {
      const applicationsResponse = await supabaseAdmin
        .from('applications')
        .select('*', { count: 'exact', head: true });
        
      totalApplications = applicationsResponse.count || 0;
    } catch (error) {
      console.error('Error fetching applications count:', error);
    }
    
    // Get total resources - with error handling
    try {
      const resourcesResponse = await supabaseAdmin
        .from('resources')
        .select('*', { count: 'exact', head: true });
        
      totalResources = resourcesResponse.count || 0;
    } catch (error) {
      console.error('Error fetching resources count:', error);
    }
    
    // Get total blogs - with error handling
    try {
      const blogsResponse = await supabaseAdmin
        .from('blogs')
        .select('*', { count: 'exact', head: true });
        
      totalBlogs = blogsResponse.count || 0;
    } catch (error) {
      console.error('Error fetching blogs count:', error);
    }
    
    // Get total scholarships - with error handling
    try {
      const scholarshipsResponse = await supabaseAdmin
        .from('scholarships')
        .select('*', { count: 'exact', head: true });
        
      totalScholarships = scholarshipsResponse.count || 0;
    } catch (error) {
      console.error('Error fetching scholarships count:', error);
    }
    
    // Get total case studies - with error handling
    try {
      const caseStudiesResponse = await supabaseAdmin
        .from('case_studies')
        .select('*', { count: 'exact', head: true });
        
      totalCaseStudies = caseStudiesResponse.count || 0;
    } catch (error) {
      console.error('Error fetching case studies count:', error);
    }
    
    // Get total responses - with error handling
    try {
      const responsesResponse = await supabaseAdmin
        .from('responses')
        .select('*', { count: 'exact', head: true });
        
      totalResponses = responsesResponse.count || 0;
    } catch (error) {
      console.error('Error fetching responses count:', error);
    }
    
    // Aggregate statistics by application status - with error handling
    const applicationsByStatus = {
      pending: 0,
      submitted: 0,
      accepted: 0,
      rejected: 0,
      waitlisted: 0,
    };
    
    try {
      const { data: appStatusData } = await supabaseAdmin
        .from('applications')
        .select('status');
        
      if (appStatusData) {
        appStatusData.forEach(app => {
          const status = app.status?.toLowerCase() || 'pending';
          if (applicationsByStatus.hasOwnProperty(status)) {
            // @ts-ignore - We know these properties exist
            applicationsByStatus[status]++;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching applications by status:', error);
    }
    
    const stats = {
      totalUsers,
      newUsersThisMonth,
      totalCourses,
      totalApplications,
      totalResources,
      totalBlogs,
      totalScholarships,
      totalCaseStudies,
      totalResponses,
      applicationsByStatus
    };
    
    console.log('Dashboard stats retrieved successfully:', stats);
    return stats;
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error.message, error.details || '');
    // Return empty stats object rather than crashing
    return {
      totalUsers: 0,
      newUsersThisMonth: 0,
      totalCourses: 0,
      totalApplications: 0,
      totalResources: 0,
      totalBlogs: 0,
      totalScholarships: 0,
      totalCaseStudies: 0,
      totalResponses: 0,
      applicationsByStatus: {
        pending: 0,
        submitted: 0,
        accepted: 0,
        rejected: 0,
        waitlisted: 0,
      }
    };
  }
}; 