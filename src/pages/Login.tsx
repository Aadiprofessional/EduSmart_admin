import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { IconType } from 'react-icons';
import { useAuth } from '../utils/AuthContext';
import { renderIcon } from '../utils/IconWrapper';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user, signIn } = useAuth();

  // Log when component mounts or when auth state changes
  useEffect(() => {
    console.log('Login component mounted/updated - Auth state:', { hasUser: !!user });
  }, [user]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Submitting login form...');
      const { success, error } = await signIn(email, password);
      
      if (success) {
        console.log('Login successful, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        console.error('Login failed:', error);
        setError(error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If already logged in, return null and let the useEffect handle redirect
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            <span className="text-teal-800">Edu</span>
            <span className="text-orange-500">Smart</span>
            <span className="text-gray-600 ml-2">Admin</span>
          </h1>
          <p className="text-gray-600">Log in to access the admin panel</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-700 p-4 rounded-md mb-6"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {renderIcon(MdEmail, { size: 20 })}
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input pl-10"
                placeholder="admin@example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {renderIcon(MdLock, { size: 20 })}
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input pl-10 pr-10"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 
                  renderIcon(MdVisibilityOff, { size: 20 }) : 
                  renderIcon(MdVisibility, { size: 20 })
                }
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Admin access only. For assistance, please contact the site administrator.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 