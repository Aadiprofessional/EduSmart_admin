import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MdDashboard, 
  MdPeople, 
  MdSchool, 
  MdArticle, 
  MdAttachMoney, 
  MdFolder,
  MdCases,
  MdSettings,
  MdLogout,
  MdMenu,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdExpandMore,
  MdExpandLess,
  MdPlayCircleOutline,
  MdLibraryBooks,
  MdQuiz,
  MdAssignment
} from 'react-icons/md';
import { IconType } from 'react-icons';
import { useAuth } from '../../utils/AuthContext';
import { renderIcon, castIconType, IconWrapper } from '../../utils/IconWrapper';

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
  mobileOpen: boolean;
  toggleMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  toggleCollapse, 
  mobileOpen, 
  toggleMobile 
}) => {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['courses']);
  
  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
    { name: 'Users', path: '/users', icon: MdPeople },
    { 
      name: 'Courses', 
      path: '/courses', 
      icon: MdSchool,
      submenu: [
        { name: 'All Courses', path: '/courses', icon: MdLibraryBooks },
        { name: 'Create Course', path: '/courses/new', icon: MdPlayCircleOutline },
      ]
    },
    { name: 'Blog Posts', path: '/blogs', icon: MdArticle },
    { name: 'Scholarships', path: '/scholarships', icon: MdAttachMoney },
    { name: 'Universities', path: '/universities', icon: MdSchool },
    { name: 'Resources', path: '/resources', icon: MdFolder },
    { name: 'Success Stories', path: '/case-studies', icon: MdCases },
    { name: 'Settings', path: '/settings', icon: MdSettings },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isMenuExpanded = (menuName: string) => {
    return expandedMenus.includes(menuName);
  };

  const sidebarVariants = {
    expanded: { width: '240px', transition: { duration: 0.2 } },
    collapsed: { width: '80px', transition: { duration: 0.2 } },
  };

  const mobileMenuVariants = {
    open: { 
      x: 0,
      transition: { 
        type: 'tween',
        duration: 0.3 
      } 
    },
    closed: { 
      x: '-100%',
      transition: { 
        type: 'tween',
        duration: 0.3 
      } 
    },
  };

  const renderNavItem = (item: any, isMobile = false) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = isMenuExpanded(item.name.toLowerCase());
    const itemIsActive = isActive(item.path);

    if (hasSubmenu && !collapsed) {
      return (
        <div key={item.path}>
          <button
            onClick={() => toggleMenu(item.name.toLowerCase())}
            className={`sidebar-link w-full ${itemIsActive ? 'active' : ''} ${collapsed ? 'justify-center' : 'justify-between'}`}
          >
            <div className="flex items-center gap-3">
              <IconWrapper icon={item.icon} size={20} />
              {!collapsed && <span>{item.name}</span>}
            </div>
            {!collapsed && (
              <IconWrapper 
                icon={isExpanded ? MdExpandLess : MdExpandMore} 
                size={20} 
              />
            )}
          </button>
          
          {!collapsed && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-4 mt-1 space-y-1"
            >
              {item.submenu.map((subItem: any) => (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  className={({ isActive }) => 
                    `sidebar-link text-sm ${isActive ? 'active' : ''} pl-8`
                  }
                  onClick={isMobile ? toggleMobile : undefined}
                >
                  <IconWrapper icon={subItem.icon} size={16} />
                  <span>{subItem.name}</span>
                </NavLink>
              ))}
            </motion.div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) => 
          `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
        }
        onClick={isMobile ? toggleMobile : undefined}
      >
        <IconWrapper icon={item.icon} size={20} />
        {!collapsed && <span>{item.name}</span>}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="fixed top-4 left-4 z-20 block md:hidden">
        <button
          onClick={toggleMobile}
          className="p-2 rounded-full bg-white shadow-md text-gray-700"
          aria-label="Toggle mobile menu"
        >
          {renderIcon(MdMenu, { size: 24 })}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.div
        className="fixed top-0 left-0 h-full bg-white shadow-lg z-30 md:hidden overflow-y-auto"
        initial="closed"
        animate={mobileOpen ? "open" : "closed"}
        variants={mobileMenuVariants}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center">
            <span className="text-xl font-bold text-teal-800">Edu<span className="text-orange-500">Smart</span></span>
            <span className="ml-2 text-sm font-medium text-gray-500">Admin</span>
          </div>
          <button
            onClick={toggleMobile}
            className="p-2 text-gray-500 hover:text-gray-700"
            aria-label="Close mobile menu"
          >
            {renderIcon(MdClose, { size: 24 })}
          </button>
        </div>

        <div className="p-2">
          {navItems.map((item) => renderNavItem(item, true))}

          <button
            onClick={signOut}
            className="sidebar-link text-red-600 hover:bg-red-50 hover:text-red-700 mt-4 w-full"
          >
            {renderIcon(MdLogout, { size: 20 })}
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Desktop Sidebar */}
      <motion.div
        className="hidden md:block h-screen bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden"
        initial="expanded"
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            {!collapsed && (
              <div className="flex items-center">
                <span className="text-xl font-bold text-teal-800">Edu<span className="text-orange-500">Smart</span></span>
                <span className="ml-2 text-sm font-medium text-gray-500">Admin</span>
              </div>
            )}
            <button
              onClick={toggleCollapse}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? 
                renderIcon(MdChevronRight, { size: 20 }) : 
                renderIcon(MdChevronLeft, { size: 20 })
              }
            </button>
          </div>

          <div className="space-y-1 flex-1">
            {navItems.map((item) => renderNavItem(item))}
          </div>
          
          <div className="mt-auto pt-6 border-t border-gray-200">
            {!collapsed && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700">
                  {profile?.name || 'Admin User'}
                </div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
            )}
            <button
              onClick={signOut}
              className={`sidebar-link text-red-600 hover:bg-red-50 hover:text-red-700 ${collapsed ? 'justify-center' : ''}`}
            >
              <IconWrapper icon={MdLogout} size={20} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar; 