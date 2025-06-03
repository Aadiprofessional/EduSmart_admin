import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { motion } from 'framer-motion';
import { 
  MdSearch, 
  MdEdit, 
  MdDelete, 
  MdAdd, 
  MdRefresh,
  MdCheck,
  MdClose,
  MdVerified,
  MdWarning
} from 'react-icons/md';
import { IconType } from 'react-icons';
import { User } from '../utils/types';
import { getUsers, makeUserAdmin, removeAdminStatus, deleteUser } from '../utils/api';
import { useSnackbar } from 'notistack';
import { renderIcon } from '../utils/IconWrapper';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmAdmin, setShowConfirmAdmin] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (user: User) => {
    try {
      if (user.is_admin) {
        await removeAdminStatus(user.id);
        enqueueSnackbar(`Removed admin status from ${user.name}`, { variant: 'success' });
      } else {
        await makeUserAdmin(user.id);
        enqueueSnackbar(`${user.name} is now an admin`, { variant: 'success' });
      }
      fetchUsers(); // Refresh user list
      setShowConfirmAdmin(false);
    } catch (err) {
      enqueueSnackbar('Failed to update admin status', { variant: 'error' });
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      fetchUsers(); // Refresh user list
      setShowConfirmDelete(false);
    } catch (err) {
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
      console.error(err);
    }
  };

  return (
    <MainLayout title="User Management">
      <div className="p-4">
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold mb-4 md:mb-0">Users</h1>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {renderIcon(MdSearch, { className: "absolute left-3 top-3 text-gray-400", size: 20 })}
            </div>
            <button
              onClick={fetchUsers}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              title="Refresh"
            >
              {renderIcon(MdRefresh, { size: 24 })}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex items-center">
            {renderIcon(MdWarning, { className: "mr-2", size: 24 })}
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12"
          >
            <div className="loader rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600 w-12 h-12 animate-spin"></div>
          </motion.div>
        ) : (
          <>
            {/* User Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full mr-3"
                                src={user.avatar_url}
                                alt={user.name || 'User'}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <span className="text-gray-500 font-bold">
                                  {user.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.last_sign_in ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {renderIcon(MdVerified, { className: "mr-1", size: 16 })} Active
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.is_admin ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowConfirmAdmin(true);
                              }}
                              className={`p-1.5 rounded ${user.is_admin ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                              title={user.is_admin ? "Remove Admin" : "Make Admin"}
                            >
                              {user.is_admin ? 
                                renderIcon(MdClose, { size: 18 }) : 
                                renderIcon(MdCheck, { size: 18 })
                              }
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this user?')) {
                                  handleDeleteUser(user.id)
                                }
                              }}
                              className="p-1 rounded-full hover:bg-gray-100 text-red-600"
                              title="Delete User"
                            >
                              {renderIcon(MdDelete, { size: 18 })}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {showConfirmDelete && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete the user <span className="font-semibold">{selectedUser.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirm Admin Status Modal */}
      {showConfirmAdmin && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h2 className="text-xl font-semibold mb-4">
              {selectedUser.is_admin ? 'Remove Admin Status' : 'Make User Admin'}
            </h2>
            <p className="mb-6">
              {selectedUser.is_admin
                ? `Are you sure you want to remove admin privileges from ${selectedUser.name}?`
                : `Are you sure you want to give admin privileges to ${selectedUser.name}? Admins have full access to the admin panel.`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmAdmin(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMakeAdmin(selectedUser)}
                className={`px-4 py-2 ${
                  selectedUser.is_admin ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                } text-white rounded-md`}
              >
                {selectedUser.is_admin ? 'Remove Admin' : 'Make Admin'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </MainLayout>
  );
};

export default Users; 