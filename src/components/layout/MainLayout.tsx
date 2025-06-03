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

  const contentVariants = {
    expanded: { marginLeft: '240px', transition: { duration: 0.2 } },
    collapsed: { marginLeft: '80px', transition: { duration: 0.2 } },
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        toggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />
      
      <motion.main 
        className="flex-1 flex flex-col overflow-hidden md:overflow-visible"
        initial="expanded"
        animate={sidebarCollapsed ? "collapsed" : "expanded"}
        variants={contentVariants}
      >
        <Header title={title} />
        
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
        
        <footer className="bg-white p-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} EduSmart Admin. All rights reserved.</p>
        </footer>
      </motion.main>
    </div>
  );
};

export default MainLayout; 