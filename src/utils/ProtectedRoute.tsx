import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute check:', { 
      pathname: location.pathname,
      hasUser: !!user,
      hasProfile: !!profile,
      userRole: profile?.role,
      isAdmin: profile?.role === 'admin',
      isLoading: loading 
    });
  }, [user, profile, loading, location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No authenticated user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has admin privileges
  if (profile && profile.role !== 'admin') {
    console.log('User is not an admin, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  // If we have a user but no profile yet, wait for profile to load
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Verifying admin privileges...</p>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute check passed, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute; 