import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MdNotifications, 
  MdSearch, 
  MdOutlinePersonOutline,
  MdLogout,
  MdSettings,
  MdHelpOutline
} from 'react-icons/md';
import { IconType } from 'react-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../utils/AuthContext';
import { renderIcon } from '../../utils/IconWrapper';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, profile, signOut } = useAuth();

  // Mock notifications - in a real app these would come from a notifications system
  const notifications = [
    { id: 1, message: 'New user registration', time: '5 minutes ago', read: false },
    { id: 2, message: 'New course content uploaded', time: '1 hour ago', read: false },
    { id: 3, message: 'System update completed', time: '3 hours ago', read: true },
  ];

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: -5,
      transition: { duration: 0.1 }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="flex justify-between items-center px-6 py-3">
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        
        <div className="hidden md:flex items-center relative">
          <div className="relative mx-4">
            {renderIcon(MdSearch, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" })}
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 w-48 lg:w-64"
            />
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 relative"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (showProfile) setShowProfile(false);
              }}
            >
              {renderIcon(MdNotifications, { size: 24, className: "text-gray-600" })}
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                >
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div key={notification.id} className={`p-3 border-b border-gray-200 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                          <div className="flex items-start">
                            <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-200 text-center">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative ml-4">
            <button 
              className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-full"
              onClick={() => {
                setShowProfile(!showProfile);
                if (showNotifications) setShowNotifications(false);
              }}
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">
                {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
            </button>
            
            <AnimatePresence>
              {showProfile && (
                <motion.div 
                  className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                >
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium text-gray-800">{profile?.name || 'Admin User'}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link 
                      to="/settings/profile" 
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfile(false)}
                    >
                      {renderIcon(MdOutlinePersonOutline, { size: 18 })}
                      <span>Your Profile</span>
                    </Link>
                    <Link 
                      to="/settings" 
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfile(false)}
                    >
                      {renderIcon(MdSettings, { size: 18 })}
                      <span>Settings</span>
                    </Link>
                    <Link 
                      to="/help" 
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfile(false)}
                    >
                      {renderIcon(MdHelpOutline, { size: 18 })}
                      <span>Help Center</span>
                    </Link>
                  </div>
                  <div className="py-2 border-t border-gray-200">
                    <button 
                      onClick={signOut}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      {renderIcon(MdLogout, { size: 18 })}
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 