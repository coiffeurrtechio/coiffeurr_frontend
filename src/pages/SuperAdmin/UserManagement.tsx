import { useState, useEffect } from "react";
import { Search, Users, Ban, CheckCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../components/ui_components/button";
import { motion } from "framer-motion";

interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  isBlocked: boolean;
  isDeleted: boolean;
  createdAt: string;
  lastLogin?: string;
  bookingCount?: number;
  cancelledCount?: number;
  rescheduledCount?: number;
  lastBookingDate?: string;
  blockedAt?: string;
  verified?: boolean;
  verifiedAt?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [blockedFilter, setBlockedFilter] = useState<boolean | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  
  // User bookings modal state
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsStatusFilter, setBookingsStatusFilter] = useState("");
  const [bookingsSortBy, setBookingsSortBy] = useState("bookingDate");
  const [bookingsSortOrder, setBookingsSortOrder] = useState("desc");

  const fetchUsers = async () => {
    console.log("UserManagement: fetchUsers called");
    setLoading(true);
    try {
      const token = localStorage.getItem("super_admin_access_token");
      console.log("UserManagement: token =", token);
      let url = `${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/users?`;
      console.log("UserManagement: url =", url);
      
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (roleFilter) url += `role=${roleFilter}&`;
      if (blockedFilter !== null) url += `is_blocked=${blockedFilter}&`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("UserManagement: response status =", response.status);
      if (!response.ok) throw new Error("Failed to fetch users");
      
      const data = await response.json();
      console.log("UserManagement: data =", data);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("UserManagement: component mounted");
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

  const fetchUserBookings = async (userId: string) => {
    setBookingsLoading(true);
    try {
      const token = localStorage.getItem("super_admin_access_token");
      let url = `${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/bookings?user_id=${userId}&page=${bookingsPage}&limit=20&sort_by=${bookingsSortBy}&sort_order=${bookingsSortOrder}`;
      if (bookingsStatusFilter) url += `&status=${bookingsStatusFilter}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user bookings");
      
      const data = await response.json();
      setUserBookings(data.bookings || []);
      setBookingsTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      setUserBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleViewBookings = (user: User) => {
    setSelectedUser(user);
    setBookingsPage(1);
    setBookingsStatusFilter("");
    setBookingsSortBy("bookingDate");
    setBookingsSortOrder("desc");
    setBookingsModalOpen(true);
    fetchUserBookings(user.id);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "ADMIN":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "OWNER":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "USER":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6 min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Nexus: User Operations
        </h1>
        <p className="text-gray-400">Manage all registered users - block, unblock, or delete accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-transparent backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder-gray-400"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white"
          >
            <option value="" className="bg-gray-800">All Roles</option>
            <option value="CUSTOMER" className="bg-gray-800">Customer</option>
            <option value="OWNER" className="bg-gray-800">Owner</option>
          </select>

          {/* Block Filter */}
          <select
            value={blockedFilter === null ? "" : blockedFilter.toString()}
            onChange={(e) => setBlockedFilter(e.target.value === "" ? null : e.target.value === "true")}
            className="px-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white"
          >
            <option value="" className="bg-gray-800">All Status</option>
            <option value="true" className="bg-gray-800">Blocked</option>
            <option value="false" className="bg-gray-800">Active</option>
          </select>
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="mt-4 text-gray-400">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-transparent backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
            >
              {/* User Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-white">{user.username}</h3>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    {user.isBlocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-full">
                        <Ban className="w-3 h-3" />
                        Blocked
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                  className="text-gray-400 hover:text-white"
                >
                  {expandedUser === user.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
              </div>

              {/* Expanded Details */}
              {expandedUser === user.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 pb-4 border-t border-white/10 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">User ID</p>
                      <p className="text-sm text-white font-mono">{user.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                      <p className="text-sm text-white">
                        {user.isDeleted ? "Deleted" : user.isBlocked ? "Blocked" : "Active"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Role</p>
                      <p className="text-sm text-white">{user.role}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-sm text-white font-mono">{user.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm text-white font-mono">{user.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Bookings</p>
                      <p className="text-sm text-white font-mono">{user.bookingCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cancelled</p>
                      <p className="text-sm text-red-400 font-mono">{user.cancelledCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rescheduled</p>
                      <p className="text-sm text-purple-400 font-mono">{user.rescheduledCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Booking</p>
                      <p className="text-sm text-white font-mono">{user.lastBookingDate ? new Date(user.lastBookingDate).toLocaleString() : 'Never'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Joined Date</p>
                      <p className="text-sm text-white font-mono">{new Date(user.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Login</p>
                      <p className="text-sm text-white font-mono">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Verified</p>
                      <p className="text-sm text-white">{user.verified ? 'Yes' : 'No'}</p>
                    </div>
                    {user.verifiedAt && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Verified At</p>
                        <p className="text-sm text-white font-mono">{new Date(user.verifiedAt).toLocaleString()}</p>
                      </div>
                    )}
                    {user.blockedAt && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Blocked At</p>
                        <p className="text-sm text-white font-mono">{new Date(user.blockedAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewBookings(user)}
                      className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      See all bookings
                    </Button>
                    {user.isBlocked ? (
                      <Button
                        size="sm"
                        onClick={() => handleUnblock(user.id)}
                        className="bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Unblock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleBlock(user.id)}
                        className="bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
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
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
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

      {/* User Bookings Modal */}
      {bookingsModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#111827] rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedUser.username}'s Bookings</h2>
                <p className="text-sm text-gray-400">Total: {bookingsTotal} bookings</p>
              </div>
              <button
                onClick={() => setBookingsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronUp className="w-6 h-6 rotate-180" />
              </button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-white/10 flex gap-4 flex-wrap">
              <select
                value={bookingsStatusFilter}
                onChange={(e) => {
                  setBookingsStatusFilter(e.target.value);
                  setBookingsPage(1);
                  fetchUserBookings(selectedUser.id);
                }}
                className="px-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-white"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <select
                value={bookingsSortBy}
                onChange={(e) => {
                  setBookingsSortBy(e.target.value);
                  fetchUserBookings(selectedUser.id);
                }}
                className="px-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-white"
              >
                <option value="bookingDate">Date</option>
                <option value="totalAmount">Amount</option>
                <option value="createdAt">Created</option>
              </select>
              <button
                onClick={() => {
                  setBookingsSortOrder(bookingsSortOrder === "desc" ? "asc" : "desc");
                  fetchUserBookings(selectedUser.id);
                }}
                className="px-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-white hover:bg-white/5"
              >
                {bookingsSortOrder === "desc" ? "↓ Desc" : "↑ Asc"}
              </button>
            </div>

            {/* Bookings List */}
            <div className="p-4 overflow-y-auto max-h-[500px]">
              {bookingsLoading ? (
                <div className="text-center py-8 text-gray-400">Loading bookings...</div>
              ) : userBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No bookings found</div>
              ) : (
                <div className="space-y-3">
                  {userBookings.map((booking) => (
                    <div key={booking.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{booking.salonName}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(booking.bookingDate).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-400">
                            Services: {booking.services?.map((s: any) => s.serviceName).join(", ") || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded ${
                            booking.status === "CONFIRMED" ? "bg-green-500/20 text-green-400" :
                            booking.status === "CANCELLED" ? "bg-red-500/20 text-red-400" :
                            booking.status === "COMPLETED" ? "bg-blue-500/20 text-blue-400" :
                            "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {booking.status}
                          </span>
                          <p className="text-sm text-white font-mono mt-1">₹{booking.totalAmount || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  setBookingsPage(Math.max(1, bookingsPage - 1));
                  fetchUserBookings(selectedUser.id);
                }}
                disabled={bookingsPage === 1}
                className="px-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {bookingsPage} of {Math.ceil(bookingsTotal / 20)}
              </span>
              <button
                onClick={() => {
                  setBookingsPage(bookingsPage + 1);
                  fetchUserBookings(selectedUser.id);
                }}
                disabled={bookingsPage >= Math.ceil(bookingsTotal / 20)}
                className="px-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
