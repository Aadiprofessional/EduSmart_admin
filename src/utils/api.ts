import { supabaseAdmin } from './supabase';
import { User, Course, Blog, Scholarship, Resource, CaseStudy, DashboardStats, ApplicationFilter } from './types';
import { Application, Profile } from './supabase';

// User Management
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data as User[];
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    throw error;
  }

  return data as User;
};

export const updateUserAdmin = async (userId: string, isAdmin: boolean): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_admin: isAdmin })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user admin status:', error);
    throw error;
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
};

// Course Management
export const getCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }

  return data as Course[];
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) {
    console.error('Error fetching course:', error);
    throw error;
  }

  return data as Course;
};

export const createCourse = async (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert([{ ...course, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select();

  if (error) {
    console.error('Error creating course:', error);
    throw error;
  }

  return data[0] as Course;
};

export const updateCourse = async (courseId: string, course: Partial<Course>): Promise<Course> => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .update({ ...course, updated_at: new Date().toISOString() })
    .eq('id', courseId)
    .select();

  if (error) {
    console.error('Error updating course:', error);
    throw error;
  }

  return data[0] as Course;
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) {
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