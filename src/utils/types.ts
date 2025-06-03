// Common admin panel types

export type Course = {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  price: number;
  image_url: string;
  is_featured: boolean;
  category: string;
  instructor_name: string;
  created_at: string;
  updated_at: string;
};

export type Blog = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  author_name: string;
  image_url: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  slug: string;
  tags: string[];
};

export type Scholarship = {
  id: string;
  title: string;
  description: string;
  provider: string;
  amount: string;
  deadline: string;
  eligibility: string;
  application_url: string;
  created_at: string;
  updated_at: string;
};

export type Resource = {
  id: string;
  title: string;
  description: string;
  type: string; // 'document', 'video', 'website', etc.
  url: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export type CaseStudy = {
  id: string;
  title: string;
  content: string;
  student_name: string;
  university: string;
  program: string;
  year: number;
  image_url: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  is_admin: boolean;
  last_sign_in: string | null;
};

export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  university: string | null;
  major: string | null;
  graduation_year: number | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  email_confirmed: boolean;
  bio: string | null;
};

export type UserFilter = {
  search: string;
  role: 'all' | 'admin' | 'user';
  sortBy: 'name' | 'created_at' | 'last_sign_in';
  sortOrder: 'asc' | 'desc';
};

export type ApplicationFilter = {
  search: string;
  status: 'all' | 'pending' | 'submitted' | 'accepted' | 'rejected' | 'waitlisted';
  sortBy: 'school_name' | 'program' | 'deadline' | 'created_at';
  sortOrder: 'asc' | 'desc';
};

export type DashboardStats = {
  totalUsers: number;
  totalCourses: number;
  totalApplications: number;
  totalResources: number;
  totalBlogs: number;
  totalScholarships: number;
  newUsersThisMonth: number;
  applicationsByStatus: {
    pending: number;
    submitted: number;
    accepted: number;
    rejected: number;
    waitlisted: number;
  };
}; 