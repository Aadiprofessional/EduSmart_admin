import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './utils/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Courses from './pages/Courses';
import Scholarships from './pages/Scholarships';
import Universities from './pages/Universities';
import Blogs from './pages/Blogs';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import CaseStudies from './pages/CaseStudies';

// Debug route component to check if redirects are happening
const DebugRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();
  
  useEffect(() => {
    console.log('Debug Route:', {
      pathname: window.location.pathname,
      user: user?.id,
      hasProfile: !!profile,
      isAdmin: profile?.role === 'admin'
    });
  }, [user, profile]);
  
  return <>{children}</>;
};

function App() {
  // Log app initialization
  useEffect(() => {
    console.log('App component initialized');
  }, []);

  return (
    <AuthProvider>
      <SnackbarProvider 
        maxSnack={3} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={5000}
      >
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DebugRoute>
                  <Dashboard />
                </DebugRoute>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <DebugRoute>
                  <Users />
                </DebugRoute>
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute>
                <DebugRoute>
                  <Courses />
                </DebugRoute>
              </ProtectedRoute>
            } />
            <Route path="/courses/new" element={
              <ProtectedRoute>
                <DebugRoute>
                  <Courses />
                </DebugRoute>
              </ProtectedRoute>
            } />
            <Route path="/courses/edit/:id" element={
              <ProtectedRoute>
                <DebugRoute>
                  <Courses />
                </DebugRoute>
              </ProtectedRoute>
            } />
            <Route path="/courses/view/:id" element={
              <ProtectedRoute>
                <DebugRoute>
                  <Courses />
                </DebugRoute>
              </ProtectedRoute>
            } />
            <Route path="/blogs" element={
              <ProtectedRoute>
                <DebugRoute>
                  <Blogs />
                </DebugRoute>
              </ProtectedRoute>
            } />
            <Route path="/scholarships" element={
              <ProtectedRoute>
                <DebugRoute>
                  <Scholarships />
                </DebugRoute>
              </ProtectedRoute>
            } />
            <Route path="/universities" element={
              <ProtectedRoute>
                <DebugRoute>
                  <Universities />
                </DebugRoute>
              </ProtectedRoute>
            } />
            <Route path="/resources" element={
              <ProtectedRoute>
                <DebugRoute>
                  <Resources />
                </DebugRoute>
              </ProtectedRoute>
            } />
            <Route path="/case-studies" element={
              <ProtectedRoute>
                <DebugRoute>
                  <CaseStudies />
                </DebugRoute>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <DebugRoute>
                  <Settings />
                </DebugRoute>
              </ProtectedRoute>
            } />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Redirect unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
