import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdError, MdHome, MdLogout } from 'react-icons/md';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { renderIcon } from '../utils/IconWrapper';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            {renderIcon(MdError, { className: "text-red-600 text-5xl" })}
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized Access</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access the admin panel. This area is restricted to administrators only.
        </p>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            {renderIcon(MdHome, { size: 20 })}
            <span>Return to Main Website</span>
          </button>
          
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
          >
            {renderIcon(MdLogout, { size: 20 })}
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>
      
      <p className="mt-8 text-center text-sm text-gray-600">
        If you believe you should have access, please contact the site administrator.
      </p>
    </div>
  );
};

export default Unauthorized; 