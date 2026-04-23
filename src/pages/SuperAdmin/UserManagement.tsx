import { useState, useEffect } from "react";
import { Search, Users, Ban, CheckCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../components/ui_components/button";
import { motion } from "framer-motion";

interface User {
  id: string;
  username: string;
  role: string;
  isBlocked: boolean;
  isDeleted: boolean;
  createdAt: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [blockedFilter, setBlockedFilter] = useState<boolean | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("super_admin_access_token");
      let url = `${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/users?`;
      
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (roleFilter) url += `role=${roleFilter}&`;
      if (blockedFilter !== null) url += `is_blocked=${blockedFilter}&`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, blockedFilter]);

  const handleBlock = async (userId: string) => {
    if (!confirm("Are you sure you want to block this user?")) return;
    
    try {
      const token = localStorage.getItem("super_admin_access_token");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/users/${userId}/block`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to block user");
      
      fetchUsers();
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user");
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      const token = localStorage.getItem("super_admin_access_token");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/users/${userId}/unblock`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to unblock user");
      
      fetchUsers();
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Failed to unblock user");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem("super_admin_access_token");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete user");
      
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-700";
      case "ADMIN":
        return "bg-blue-100 text-blue-700";
      case "OWNER":
        return "bg-green-100 text-green-700";
      case "USER":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage all registered users - block, unblock, or delete accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="OWNER">Salon Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>

          {/* Block Filter */}
          <select
            value={blockedFilter === null ? "" : blockedFilter.toString()}
            onChange={(e) => setBlockedFilter(e.target.value === "" ? null : e.target.value === "true")}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
          >
            <option value="">All Status</option>
            <option value="true">Blocked</option>
            <option value="false">Active</option>
          </select>
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* User Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-gray-900">{user.username}</h3>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    {user.isBlocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        <Ban className="w-3 h-3" />
                        Blocked
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                >
                  {expandedUser === user.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
              </div>

              {/* Expanded Details */}
              {expandedUser === user.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 pb-4 border-t border-gray-100 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">User ID</p>
                      <p className="text-sm text-gray-900">{user.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                      <p className="text-sm text-gray-900">
                        {user.isDeleted ? "Deleted" : user.isBlocked ? "Blocked" : "Active"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {user.isBlocked ? (
                      <Button
                        size="sm"
                        onClick={() => handleUnblock(user.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Unblock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleBlock(user.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Block
                      </Button>
                    )}

                    {!user.isDeleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(user.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
