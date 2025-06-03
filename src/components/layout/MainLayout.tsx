import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Detect screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        toggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </div>
        
        <footer className="bg-white/80 backdrop-blur-md p-4 border-t border-gray-200/50 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} EduSmart Admin. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout; 