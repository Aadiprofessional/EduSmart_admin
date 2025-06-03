import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseAdmin, Profile } from './supabase';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error: string | null;
  }>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
  getAdminUID: () => string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Debug auth state
  useEffect(() => {
    console.log('Auth state changed:', { 
      hasUser: !!user, 
      hasProfile: !!profile, 
      hasSession: !!session,
      loading,
      sessionChecked,
      isAdmin: profile?.role === 'admin'
    });
  }, [user, profile, session, loading, sessionChecked]);
  
  useEffect(() => {
    console.log('Initializing auth state and checking for existing session...');
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        // Check for existing session in storage
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
          setSessionChecked(true);
          setLoading(false);
          return;
        }
        
        console.log('Session check completed:', !!data.session);
        
        if (data?.session) {
          console.log('Found existing session, setting user state');
          setSession(data.session);
          setUser(data.session.user);
          
          if (data.session.user) {
            await fetchProfile(data.session.user.id);
          } else {
            setLoading(false);
          }
        } else {
          console.log('No existing session found');
          setLoading(false);
        }
        
        setSessionChecked(true);
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setSessionChecked(true);
        setLoading(false);
      }
    };
    
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('User authenticated, fetching profile');
        await fetchProfile(session.user.id);
      } else {
        console.log('User signed out or session expired');
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      console.log('Unsubscribing from auth changes');
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message, error.details, error.hint);
        
        // Create a profile for the user if one doesn't exist
        try {
          console.log('No profile found, creating default profile');
          const newProfile = {
            id: userId,
            email: user?.email || '',
            role: 'user', // Default to regular user
            name: null,
            avatar_url: null,
            updated_at: new Date().toISOString(),
          };
            
          const { data: insertedProfile, error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();
              
          if (insertError) {
            console.error('Error creating default profile:', insertError);
            setProfile(null);
          } else {
            console.log('Created default profile for user');
            setProfile(insertedProfile as Profile);
          }
        } catch (createError) {
          console.error('Exception creating profile:', createError);
          setProfile(null);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (data) {
        console.log('Profile data retrieved successfully, role:', data.role);
        setProfile(data as Profile);
      } else {
        console.warn('No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error: any) {
      console.error('Exception in fetchProfile:', error.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        throw error;
      }

      console.log('Sign in successful, checking admin status...');

      if (data.user) {
        // Fetch the user's profile to check admin status
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile during login:', profileError);
          // Sign out the user since we can't verify admin status
          await supabase.auth.signOut();
          return { 
            success: false, 
            error: 'Unable to verify admin privileges. Please contact support.' 
          };
        }

        // Check if user is admin
        if (profileData?.role !== 'admin') {
          console.log('User is not an admin, denying access');
          // Sign out the user
          await supabase.auth.signOut();
          return { 
            success: false, 
            error: 'Access denied. This application is restricted to administrators only.' 
          };
        }

        console.log('Admin verification successful');
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      await supabase.auth.signOut();
      setProfile(null);
      setUser(null);
      setSession(null);
      console.log('Sign out completed');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      console.warn('Cannot check admin status: no user logged in');
      return false;
    }
    
    try {
      console.log('Checking admin status for user:', user.id);
      
      // First check if we already have the profile in state
      if (profile) {
        console.log('Using cached profile for admin check:', profile.role);
        return profile.role === 'admin';
      }
      
      // Otherwise query the database
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      const isAdmin = data?.role === 'admin';
      console.log('Admin status check result:', isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Get the current user's UID for API calls
  const getAdminUID = (): string | null => {
    return user?.id || null;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    checkAdminStatus,
    getAdminUID,
  };

  // Don't render until we've checked for an existing session
  if (!sessionChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 