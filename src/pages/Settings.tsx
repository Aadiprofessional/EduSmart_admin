import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSave, 
  FaUser, 
  FaBell, 
  FaShieldAlt, 
  FaPalette, 
  FaDatabase, 
  FaEnvelope,
  FaRocket,
  FaCog,
  FaToggleOn,
  FaToggleOff,
  FaKey,
  FaGlobe,
  FaChartLine,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import MainLayout from '../components/layout/MainLayout';
import { IconWrapper } from '../utils/IconWrapper';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

interface SettingsState {
  profile: {
    name: string;
    email: string;
    avatar: string;
    timezone: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
    securityAlerts: boolean;
    newUserRegistrations: boolean;
    systemUpdates: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginAttempts: number;
  };
  appearance: {
    theme: string;
    sidebarCollapsed: boolean;
    animations: boolean;
    compactMode: boolean;
  };
  system: {
    maintenanceMode: boolean;
    debugMode: boolean;
    cacheEnabled: boolean;
    backupFrequency: string;
  };
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    profile: {
      name: 'Admin User',
      email: 'admin@edusmart.com',
      avatar: '',
      timezone: 'UTC',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyReports: true,
      securityAlerts: true,
      newUserRegistrations: true,
      systemUpdates: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5
    },
    appearance: {
      theme: 'light',
      sidebarCollapsed: false,
      animations: true,
      compactMode: false
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      cacheEnabled: true,
      backupFrequency: 'daily'
    }
  });

  const { enqueueSnackbar } = useSnackbar();

  const sections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Manage your personal information and preferences',
      icon: FaUser,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure notification preferences and alerts',
      icon: FaBell,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Manage security settings and authentication',
      icon: FaShieldAlt,
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel of the admin panel',
      icon: FaPalette,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'system',
      title: 'System',
      description: 'Configure system-wide settings and maintenance',
      icon: FaDatabase,
      color: 'from-orange-500 to-yellow-500'
    }
  ];

  const handleSave = () => {
    // Simulate saving settings
    enqueueSnackbar('Settings saved successfully!', { variant: 'success' });
  };

  const handleToggle = (section: keyof SettingsState, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: !(prev[section] as any)[setting]
      }
    }));
  };

  const handleInputChange = (section: keyof SettingsState, setting: string, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: value
      }
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={settings.profile.name}
            onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={settings.profile.email}
            onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.profile.timezone}
            onChange={(e) => handleInputChange('profile', 'timezone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
          >
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time</option>
            <option value="PST">Pacific Time</option>
            <option value="GMT">Greenwich Mean Time</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={settings.profile.language}
            onChange={(e) => handleInputChange('profile', 'language', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <h4 className="font-medium text-gray-900 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <p className="text-sm text-gray-600">
              {key === 'emailNotifications' && 'Receive notifications via email'}
              {key === 'pushNotifications' && 'Receive push notifications in browser'}
              {key === 'weeklyReports' && 'Get weekly summary reports'}
              {key === 'securityAlerts' && 'Receive security-related alerts'}
              {key === 'newUserRegistrations' && 'Notify when new users register'}
              {key === 'systemUpdates' && 'Receive system update notifications'}
            </p>
          </div>
          <button
            onClick={() => handleToggle('notifications', key)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
        </div>
        <button
          onClick={() => handleToggle('security', 'twoFactorAuth')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.security.twoFactorAuth ? 'bg-green-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
          <input
            type="number"
            value={settings.security.passwordExpiry}
            onChange={(e) => handleInputChange('security', 'passwordExpiry', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
        <div className="grid grid-cols-2 gap-4">
          {['light', 'dark'].map((theme) => (
            <button
              key={theme}
              onClick={() => handleInputChange('appearance', 'theme', theme)}
              className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                settings.appearance.theme === theme
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className={`w-12 h-8 mx-auto mb-2 rounded ${
                  theme === 'light' ? 'bg-white border' : 'bg-gray-800'
                }`}></div>
                <span className="capitalize font-medium">{theme}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {Object.entries(settings.appearance).filter(([key]) => key !== 'theme').map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <h4 className="font-medium text-gray-900 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <p className="text-sm text-gray-600">
              {key === 'sidebarCollapsed' && 'Keep sidebar collapsed by default'}
              {key === 'animations' && 'Enable smooth animations and transitions'}
              {key === 'compactMode' && 'Use compact layout for better space utilization'}
            </p>
          </div>
          <button
            onClick={() => handleToggle('appearance', key)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      {Object.entries(settings.system).filter(([key]) => key !== 'backupFrequency').map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <h4 className="font-medium text-gray-900 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <p className="text-sm text-gray-600">
              {key === 'maintenanceMode' && 'Put the system in maintenance mode'}
              {key === 'debugMode' && 'Enable debug mode for troubleshooting'}
              {key === 'cacheEnabled' && 'Enable caching for better performance'}
            </p>
          </div>
          <button
            onClick={() => handleToggle('system', key)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-orange-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
        <select
          value={settings.system.backupFrequency}
          onChange={(e) => handleInputChange('system', 'backupFrequency', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'appearance': return renderAppearanceSettings();
      case 'system': return renderSystemSettings();
      default: return renderProfileSettings();
    }
  };

  return (
    <MainLayout title="Settings">
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Futuristic Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-8 text-white"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-400/20 to-gray-400/20 backdrop-blur-sm"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <motion.h1 
                className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Settings
              </motion.h1>
              <motion.p 
                className="text-slate-100 text-lg"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Configure your admin panel preferences and system settings
              </motion.p>
            </div>
            <motion.div
              className="flex items-center gap-6"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={handleSave}
                className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:bg-white/30 flex items-center gap-3 transition-all duration-300 border border-white/30"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconWrapper icon={FaSave} />
                Save Changes
              </motion.button>
            </motion.div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-300/20 rounded-full blur-lg animate-bounce"></div>
        </motion.div>

        {/* Settings Navigation */}
        <motion.div 
          className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200/50"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`p-4 rounded-xl transition-all duration-300 text-left ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r ' + section.color + ' text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <IconWrapper icon={section.icon} className="text-lg" />
                  <span className="font-medium">{section.title}</span>
                </div>
                <p className={`text-xs ${
                  activeSection === section.id ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {section.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Settings Content */}
        <motion.div 
          className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-200/50"
          variants={itemVariants}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {sections.find(s => s.id === activeSection)?.title}
            </h2>
            <p className="text-gray-600">
              {sections.find(s => s.id === activeSection)?.description}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Save Button */}
        <motion.div 
          className="flex justify-end"
          variants={itemVariants}
        >
          <motion.button
            onClick={handleSave}
            className="px-8 py-4 bg-gradient-to-r from-slate-500 to-gray-500 text-white rounded-xl hover:from-slate-600 hover:to-gray-600 transition-all duration-300 flex items-center gap-3 font-medium shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconWrapper icon={FaSave} />
            Save All Changes
          </motion.button>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default Settings; 