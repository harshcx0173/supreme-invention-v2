import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CustomSwitch from '../components/CustomSwitch';
import { Users, Shield, UserCheck, UserX, Calendar, TrendingUp, Crown } from 'lucide-react';
import { getProxiedImageUrl } from '../utils/imageProxy';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    superAdminUsers: 0,
    regularUsers: 0
  });
  const [updatingUsers, setUpdatingUsers] = useState(new Set());

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/super-admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/super-admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAdminToggle = async (userId, currentAdminStatus) => {
    const newAdminStatus = !currentAdminStatus;
    
    // Add user to updating set to show loading state
    setUpdatingUsers(prev => new Set(prev).add(userId));
    
    try {
      const response = await axios.patch(`/api/super-admin/users/${userId}/admin-status`, {
        isAdmin: newAdminStatus
      });
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isAdmin: newAdminStatus }
            : user
        )
      );
      
      // Refresh stats
      fetchStats();
      
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error updating admin status:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update admin status';
      toast.error(errorMessage);
    } finally {
      // Remove user from updating set
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleSuperAdminToggle = async (userId, currentSuperAdminStatus) => {
    const newSuperAdminStatus = !currentSuperAdminStatus;
    
    // Add user to updating set to show loading state
    setUpdatingUsers(prev => new Set(prev).add(userId));
    
    try {
      const response = await axios.patch(`/api/super-admin/users/${userId}/super-admin-status`, {
        isSuperAdmin: newSuperAdminStatus
      });
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isSuperAdmin: newSuperAdminStatus }
            : user
        )
      );
      
      // Refresh stats
      fetchStats();
      
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error updating super admin status:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update super admin status';
      toast.error(errorMessage);
    } finally {
      // Remove user from updating set
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">
          Manage user accounts and admin permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.superAdminUsers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admin Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.adminUsers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Regular Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.regularUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">All Users</h2>
        
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500">
              There are no users in the system yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Admin Status
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Super Admin Status
                   </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.picture ? (
                            <>
                              <img
                                className="h-10 w-10 rounded-full"
                                src={getProxiedImageUrl(user.picture)}
                                alt={user.name}
                                onError={(e) => {
                                  console.error('Failed to load image for user:', user.name, 'URL:', user.picture);
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center" style={{ display: 'none' }}>
                                <Users className="h-5 w-5 text-gray-600" />
                              </div>
                            </>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                                                     <div className="flex items-center text-sm text-gray-500">
                             {user.isSuperAdmin ? (
                               <>
                                 <Crown className="h-4 w-4 mr-1 text-purple-600" />
                                 <span className="text-purple-600">Super Admin</span>
                               </>
                             ) : user.isAdmin ? (
                               <>
                                 <Shield className="h-4 w-4 mr-1 text-green-600" />
                                 <span className="text-green-600">Admin</span>
                               </>
                             ) : (
                               <>
                                 <Users className="h-4 w-4 mr-1 text-gray-400" />
                                 <span>Regular User</span>
                               </>
                             )}
                           </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatLastLogin(user.lastLogin)}
                      </div>
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center">
                         <CustomSwitch
                           checked={user.isAdmin}
                           onChange={() => handleAdminToggle(user._id, user.isAdmin)}
                           disabled={updatingUsers.has(user._id)}
                         />
                         {updatingUsers.has(user._id) && (
                           <div className="ml-2">
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                           </div>
                         )}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center">
                         <CustomSwitch
                           checked={user.isSuperAdmin}
                           onChange={() => handleSuperAdminToggle(user._id, user.isSuperAdmin)}
                           disabled={updatingUsers.has(user._id)}
                         />
                         {updatingUsers.has(user._id) && (
                           <div className="ml-2">
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                           </div>
                         )}
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {users.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {users.length} total users
        </div>
      )}
    </div>
  );
};

export default UserManagement;
