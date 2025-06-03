import React, { useState, useEffect } from 'react';
import { MdPeople, MdSchool, MdArticle, MdAttachMoney, MdFolder, MdCases } from 'react-icons/md';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';
import { getDashboardStats } from '../utils/api';
import { DashboardStats } from '../utils/types';
import { renderIcon, castIconType } from '../utils/IconWrapper';
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

  // Mock data for charts until real data is available
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
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock user growth data
  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: [12, 19, 15, 17, 28, stats?.newUsersThisMonth || 25],
        fill: false,
        backgroundColor: 'rgba(0, 128, 128, 0.6)',
        borderColor: 'rgba(0, 128, 128, 1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <MainLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={MdPeople}
              color="bg-blue-500"
              change="+12%"
              period="vs last month"
            />
            <StatsCard
              title="Total Courses"
              value={stats?.totalCourses || 0}
              icon={MdSchool}
              color="bg-green-500"
              change="+5%"
              period="vs last month"
            />
            <StatsCard
              title="Total Applications"
              value={stats?.totalApplications || 0}
              icon={MdFolder}
              color="bg-amber-500"
              change="+8%"
              period="vs last month"
            />
            <StatsCard
              title="Blog Posts"
              value={stats?.totalBlogs || 0}
              icon={MdArticle}
              color="bg-purple-500"
              change="+15%"
              period="vs last month"
            />
            <StatsCard
              title="Scholarships"
              value={stats?.totalScholarships || 0}
              icon={MdAttachMoney}
              color="bg-red-500"
              change="+3%"
              period="vs last month"
            />
            <StatsCard
              title="Case Studies"
              value={0}
              icon={MdCases}
              color="bg-indigo-500"
              change="0%"
              period="vs last month"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">User Growth</h3>
              <div className="h-64">
                <Line
                  data={userGrowthData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Applications by Status</h3>
              <div className="h-64 flex justify-center">
                <Doughnut
                  data={applicationsByStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      New user registered
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      john.doe@example.com
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      5 minutes ago
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      New course added
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      admin@edusmart.com
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      1 hour ago
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      Blog post published
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      admin@edusmart.com
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      3 hours ago
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  icon: IconType;
  color: string;
  change: string;
  period: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, change, period }) => {
  const IconComponent = castIconType(icon);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value.toLocaleString()}</h3>
          <div className="flex items-center mt-2">
            <span className="text-xs font-medium text-green-600">{change}</span>
            <span className="text-xs text-gray-500 ml-1">{period}</span>
          </div>
        </div>
        <div className={`${color} rounded-lg p-3 text-white`}>
          <IconComponent size={24} />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard; 