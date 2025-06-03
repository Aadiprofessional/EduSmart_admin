import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cdqrmxmqsoxncnkxiqwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXJteG1xc294bmNua3hpcXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NTM2MzgsImV4cCI6MjA1OTMyOTYzOH0.2-66_0X62mcPTybkc4BmGpV6nbzgMTRM90cPy0lnJRg';
// Using service role key for admin operations
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXJteG1xc294bmNua3hpcXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzc1MzYzOCwiZXhwIjoyMDU5MzI5NjM4fQ.1mhLCVfTJ6BjczuVX0Zs7qqqnMBXDiP46PatouMTGMg';

// Log initialization for debugging
console.log('Initializing Supabase clients with URL:', supabaseUrl);

// Singleton instances to prevent multiple client creations
let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

// Client for public operations (used for authentication)
export const supabase = (() => {
  if (!supabaseInstance) {
    console.log('Creating new Supabase public client');
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'edusmart-admin-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        }
      },
      db: {
        schema: 'public'
      }
    });
    
    // Log successful initialization
    console.log('Supabase public client initialized successfully');
  }
  return supabaseInstance;
})();

// Client with admin privileges (service role) - use carefully!
export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    console.log('Creating new Supabase admin client');
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      },
      db: {
        schema: 'public'
      }
    });
    
    // Log successful initialization
    console.log('Supabase admin client initialized successfully');
  }
  return supabaseAdminInstance;
})();

// Database schema types
export type Profile = {
  id: string;
  updated_at: string | null;
  created_at?: string | null;
  name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
};

export type Application = {
  id: string;
  user_id: string;
  school_name: string;
  program: string;
  status: string;
  deadline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}; 