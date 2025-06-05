import React, { useState, useEffect } from 'react';
import { MdPeople, MdSchool, MdArticle, MdAttachMoney, MdFolder, MdCases, MdTrendingUp, MdInsights } from 'react-icons/md';
import { IconType } from 'react-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';
import { getDashboardStats } from '../utils/api';
import { DashboardStats } from '../utils/types';
import { renderIcon, castIconType, IconWrapper } from '../utils/IconWrapper';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Enhanced chart data with futuristic styling
  const applicationsByStatusData = {
    labels: ['Pending', 'Submitted', 'Accepted', 'Rejected', 'Waitlisted'],
    datasets: [
      {
        label: 'Applications',
        data: stats ? [
          stats.applicationsByStatus.pending,
          stats.applicationsByStatus.submitted,
          stats.applicationsByStatus.accepted,
          stats.applicationsByStatus.rejected,
          stats.applicationsByStatus.waitlisted,
        ] : [10, 25, 15, 8, 5],
        backgroundColor: [
          'rgba(255, 206, 86, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: [12, 19, 15, 17, 28, stats?.newUsersThisMonth || 25],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
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

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <motion.div 
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Dashboard">
        <motion.div 
          className="bg-gradient-to-r from-red-500/10 to-pink-500/10 backdrop-blur-sm border border-red-200/50 text-red-700 p-6 rounded-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">!</span>
            </div>
            <span className="font-medium">{error}</span>
          </div>
        </motion.div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Futuristic Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <motion.h1 
              className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome to EduSmart Admin
            </motion.h1>
            <motion.p 
              className="text-blue-100 text-lg"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Monitor your platform's performance and manage content efficiently
            </motion.p>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-300/20 rounded-full blur-lg animate-bounce"></div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={MdPeople}
            gradient="from-blue-500 to-blue-600"
            change="+12%"
            period="vs last month"
          />
          <StatsCard
            title="Total Courses"
            value={stats?.totalCourses || 0}
            icon={MdSchool}
            gradient="from-green-500 to-emerald-600"
            change="+5%"
            period="vs last month"
          />
          <StatsCard
            title="Total Applications"
            value={stats?.totalApplications || 0}
            icon={MdFolder}
            gradient="from-amber-500 to-orange-600"
            change="+8%"
            period="vs last month"
          />
          <StatsCard
            title="Blog Posts"
            value={stats?.totalBlogs || 0}
            icon={MdArticle}
            gradient="from-purple-500 to-violet-600"
            change="+15%"
            period="vs last month"
          />
          <StatsCard
            title="Scholarships"
            value={stats?.totalScholarships || 0}
            icon={MdAttachMoney}
            gradient="from-red-500 to-pink-600"
            change="+3%"
            period="vs last month"
          />
          <StatsCard
            title="Success Stories"
            value={stats?.totalCaseStudies || 0}
            icon={MdCases}
            gradient="from-indigo-500 to-purple-600"
            change="+7%"
            period="vs last month"
          />
          <StatsCard
            title="Resources"
            value={stats?.totalResponses || 0}
            icon={MdFolder}
            gradient="from-teal-500 to-cyan-600"
            change="+12%"
            period="vs last month"
          />
        </motion.div>

        {/* Enhanced Charts */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
        >
          <motion.div 
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-200/50"
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <IconWrapper icon={MdTrendingUp} className="text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                User Growth Trend
              </h3>
            </div>
            <div className="h-64">
              <Line
                data={userGrowthData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: '#6B7280',
                      },
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(107, 114, 128, 0.1)',
                      },
                      ticks: {
                        color: '#6B7280',
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-200/50"
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <IconWrapper icon={MdInsights} className="text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Application Status Distribution
              </h3>
            </div>
            <div className="h-64 flex justify-center">
              <Doughnut
                data={applicationsByStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        color: '#374151',
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Recent Activity */}
        <motion.div 
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-200/50"
          variants={itemVariants}
        >
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            Recent Activity
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Activity
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {[
                  { activity: 'New user registered', user: 'john.doe@example.com', time: '5 minutes ago', color: 'bg-green-100 text-green-800' },
                  { activity: 'New course added', user: 'admin@edusmart.com', time: '1 hour ago', color: 'bg-blue-100 text-blue-800' },
                  { activity: 'Blog post published', user: 'admin@edusmart.com', time: '3 hours ago', color: 'bg-purple-100 text-purple-800' },
                ].map((item, index) => (
                  <motion.tr 
                    key={index}
                    className="hover:bg-gray-50/50 transition-colors duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.color}`}>
                        {item.activity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {item.user}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.time}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  icon: IconType;
  gradient: string;
  change: string;
  period: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, gradient, change, period }) => {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 100
          }
        }
      }}
      className="group relative overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50 hover:shadow-2xl transition-all duration-500"
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            {value.toLocaleString()}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
              change.startsWith('+') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {change}
            </span>
            <span className="text-xs text-gray-500">{period}</span>
          </div>
        </div>
        <motion.div 
          className={`bg-gradient-to-r ${gradient} rounded-2xl p-4 text-white shadow-lg`}
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <IconWrapper icon={icon} size={28} />
        </motion.div>
      </div>
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
    </motion.div>
  );
};

export default Dashboard; 