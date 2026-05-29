import { useState, useEffect } from "react";
import { Search, Calendar, Filter, CheckCircle, XCircle, ChevronDown, ChevronUp, User } from "lucide-react";
import { Button } from "../../components/ui_components/button";
import { motion } from "framer-motion";

interface Booking {
  id: string;
  bookingId?: string;
  salonId: string;
  salonName: string;
  salonPhone?: string;
  userId: string;
  userName: string;
  userPhone?: string;
  status: string;
  bookingDate: string;
  services: any[];
  totalAmount: number;
  createdAt: string;
  isRescheduled?: boolean;
  previousSlot?: { date: string; time: string };
  rescheduleReason?: string;
  rescheduledAt?: string;
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [salonFilter, setSalonFilter] = useState("");
  const [showRescheduledOnly, setShowRescheduledOnly] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("bookingDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const BOOKINGS_PER_PAGE = 20;
  
  // Reschedule states
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchBookings = async () => {
    console.log("BookingManagement: fetchBookings called");
    setLoading(true);
    try {
      const token = localStorage.getItem("super_admin_access_token");
      console.log("BookingManagement: token =", token);
      let url = `${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/bookings?`;
      console.log("BookingManagement: url =", url);
      
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (salonFilter) url += `salon_id=${salonFilter}&`;
      if (startDate) url += `start_date=${encodeURIComponent(startDate)}&`;
      if (endDate) url += `end_date=${encodeURIComponent(endDate)}&`;
      if (minPrice) url += `min_price=${minPrice}&`;
      if (maxPrice) url += `max_price=${maxPrice}&`;
      url += `page=${currentPage}&limit=${BOOKINGS_PER_PAGE}`;
      url += `&sort_by=${sortBy}&sort_order=${sortOrder}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("BookingManagement: response status =", response.status);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      
      const data = await response.json();
      console.log("BookingManagement: data =", data);
      setBookings(data.bookings || []);
      setTotalBookings(data.total || 0);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("BookingManagement: component mounted");
    fetchBookings();
  }, [search, statusFilter, salonFilter, startDate, endDate, currentPage, minPrice, maxPrice, sortBy, sortOrder, showRescheduledOnly]);

  const handleConfirm = async (bookingId: string) => {
    try {
      const token = localStorage.getItem("super_admin_access_token");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/bookings/${bookingId}/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to confirm booking");
      
      setNotification({ type: 'success', message: 'Booking confirmed successfully' });
      fetchBookings();
    } catch (error) {
      console.error("Error confirming booking:", error);
      setNotification({ type: 'error', message: 'Failed to confirm booking' });
    }
  };

  const handleCancel = async (bookingId: string) => {
    const reason = prompt("Enter cancellation reason (optional):");
    try {
      const token = localStorage.getItem("super_admin_access_token");
      let url = `${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/bookings/${bookingId}/cancel`;
      if (reason) url += `?reason=${encodeURIComponent(reason)}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to cancel booking");
      
      setNotification({ type: 'success', message: 'Booking cancelled successfully' });
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setNotification({ type: 'error', message: 'Failed to cancel booking' });
    }
  };

  const handleReschedule = async (bookingId: string) => {
    setIsRescheduling(true);
    try {
      const token = localStorage.getItem("super_admin_access_token");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/bookings/${bookingId}/modify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_date: rescheduleDate,
          new_time: rescheduleTime,
          reason: rescheduleReason
        }),
      });

      if (!response.ok) throw new Error("Failed to reschedule booking");
      
      setNotification({ type: 'success', message: 'Booking rescheduled successfully' });
      setIsRescheduleMode(false);
      setRescheduleDate("");
      setRescheduleTime("");
      setRescheduleReason("");
      setAvailableSlots([]);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      setNotification({ type: 'error', message: 'Failed to reschedule booking' });
    } finally {
      setIsRescheduling(false);
    }
  };

  const fetchAvailableSlots = async (salonId: string, date: string, serviceId: string) => {
    if (!date || !serviceId) return;
    
    setLoadingSlots(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/salons/${salonId}/slots?date=${date}&service_id=${serviceId}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch available slots");
      
      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleRescheduleClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsRescheduleMode(true);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleReason("");
    setAvailableSlots([]);
  };

  const handleDateChange = (date: string) => {
    setRescheduleDate(date);
    setRescheduleTime("");
    if (selectedBooking && date) {
      const serviceId = selectedBooking.services?.[0]?.id || selectedBooking.services?.[0]?.service_id;
      if (serviceId) {
        fetchAvailableSlots(selectedBooking.salonId, date, serviceId);
      }
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  useEffect(() => {
    handleFilterChange();
  }, [search, statusFilter, salonFilter, startDate, endDate, minPrice, maxPrice, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "CONFIRMED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "CANCELLED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "COMPLETED":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Filter bookings based on rescheduled status
  const filteredBookings = showRescheduledOnly
    ? bookings.filter(booking => booking.isRescheduled)
    : bookings;

  return (
    <div className="space-y-6 min-h-screen bg-[#09090b] text-white">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Nexus: Booking Operations
        </h1>
        <p className="text-gray-400">View and manage all bookings across all salons</p>
      </div>

      {/* Filters */}
      <div className="bg-transparent backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder-gray-400 text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white text-sm"
          >
            <option value="" className="bg-gray-800">All Status</option>
            <option value="PENDING" className="bg-gray-800">Pending</option>
            <option value="CONFIRMED" className="bg-gray-800">Confirmed</option>
            <option value="CANCELLED" className="bg-gray-800">Cancelled</option>
            <option value="COMPLETED" className="bg-gray-800">Completed</option>
          </select>

          {/* Rescheduled Filter */}
          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={showRescheduledOnly}
              onChange={(e) => setShowRescheduledOnly(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500/50"
            />
            <span className="text-sm text-white">Rescheduled Only</span>
          </label>

          {/* Salon Filter */}
          <input
            type="text"
            placeholder="Salon ID"
            value={salonFilter}
            onChange={(e) => setSalonFilter(e.target.value)}
            className="px-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder-gray-400"
          />

          {/* Price Range */}
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-32 px-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder-gray-400"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-32 px-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder-gray-400"
            />
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white"
            />
          </div>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white"
          >
            <option value="bookingDate-desc" className="bg-gray-800">Date (Newest)</option>
            <option value="bookingDate-asc" className="bg-gray-800">Date (Oldest)</option>
            <option value="totalAmount-desc" className="bg-gray-800">Amount (High to Low)</option>
            <option value="totalAmount-asc" className="bg-gray-800">Amount (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="mt-4 text-gray-400">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-transparent backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
            >
              {/* Booking Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{booking.salonName}</h3>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    {booking.isRescheduled && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        RESC
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {booking.userName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.bookingDate).toLocaleDateString()} at {new Date(booking.bookingDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {booking.rescheduleReason && (
                      <span className="flex items-center gap-1 text-purple-400">
                        <span className="text-xs">Reason: {booking.rescheduleReason}</span>
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                  className="text-gray-400 hover:text-white"
                >
                  {expandedBooking === booking.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
              </div>

              {/* Expanded Details */}
              {expandedBooking === booking.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 pb-4 border-t border-white/10 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booking ID</p>
                      <p className="text-sm text-white font-mono">{booking.bookingId || booking.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="text-sm text-white font-bold font-mono">₹{booking.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">User ID</p>
                      <p className="text-sm text-white font-mono">{booking.userId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">User Name</p>
                      <p className="text-sm text-white">{booking.userName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">User Phone</p>
                      <p className="text-sm text-white font-mono">{booking.userPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Salon ID</p>
                      <p className="text-sm text-white font-mono">{booking.salonId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Salon Name</p>
                      <p className="text-sm text-white">{booking.salonName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Salon Phone</p>
                      <p className="text-sm text-white font-mono">{booking.salonPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booking Date</p>
                      <p className="text-sm text-white font-mono">{new Date(booking.bookingDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booked On</p>
                      <p className="text-sm text-white font-mono">{new Date(booking.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Services Details */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Services Booked</p>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      {booking.services && booking.services.length > 0 ? (
                        <ul className="space-y-2">
                          {booking.services.map((service: any, idx: number) => (
                            <li key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-300">{service.serviceName || service.name || 'Unknown Service'}</span>
                              <span className="text-white font-mono">₹{service.price || 0}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400">No service details available</p>
                      )}
                    </div>
                  </div>

                  {/* Reschedule Details */}
                  {booking.isRescheduled && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Reschedule Details</p>
                      <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                        {booking.previousSlot && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-400">Previous Slot</p>
                            <p className="text-sm text-white font-mono">
                              {new Date(booking.previousSlot.date).toLocaleDateString()} at {booking.previousSlot.time}
                            </p>
                          </div>
                        )}
                        {booking.rescheduleReason && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-400">Reschedule Reason</p>
                            <p className="text-sm text-white">{booking.rescheduleReason}</p>
                          </div>
                        )}
                        {booking.rescheduledAt && (
                          <div>
                            <p className="text-xs text-gray-400">Rescheduled At</p>
                            <p className="text-sm text-white font-mono">{new Date(booking.rescheduledAt).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {booking.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleConfirm(booking.id)}
                          className="bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCancel(booking.id)}
                          className="bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRescheduleClick(booking)}
                          className="bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Reschedule
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Reschedule Form */}
                  {isRescheduleMode && (
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                      <h4 className="text-sm font-semibold text-white">Reschedule Booking</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">New Date</label>
                          <input
                            type="date"
                            value={rescheduleDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="w-full px-3 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">New Time</label>
                          {loadingSlots ? (
                            <div className="w-full px-3 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-gray-400 text-sm">
                              Loading slots...
                            </div>
                          ) : availableSlots.length > 0 ? (
                            <select
                              value={rescheduleTime}
                              onChange={(e) => setRescheduleTime(e.target.value)}
                              className="w-full px-3 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-white text-sm"
                            >
                              <option value="">Select a time</option>
                              {availableSlots.map((slot: any) => (
                                <option 
                                  key={slot.time} 
                                  value={slot.time}
                                  disabled={slot.availableCapacity === 0}
                                  className="bg-gray-800"
                                >
                                  {slot.time} {slot.availableCapacity === 0 ? '(Full)' : `(${slot.availableCapacity} available)`}
                                </option>
                              ))}
                            </select>
                          ) : rescheduleDate ? (
                            <div className="w-full px-3 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-gray-400 text-sm">
                              No slots available
                            </div>
                          ) : (
                            <div className="w-full px-3 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-gray-400 text-sm">
                              Select a date first
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Reason (optional)</label>
                        <input
                          type="text"
                          value={rescheduleReason}
                          onChange={(e) => setRescheduleReason(e.target.value)}
                          placeholder="Enter reason for rescheduling"
                          className="w-full px-3 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => selectedBooking && handleReschedule(selectedBooking.id)}
                          disabled={isRescheduling || !rescheduleDate || !rescheduleTime}
                          className="bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30 disabled:opacity-50"
                        >
                          {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsRescheduleMode(false);
                            setAvailableSlots([]);
                            setSelectedBooking(null);
                          }}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="text-sm text-gray-400">
          Showing {((currentPage - 1) * BOOKINGS_PER_PAGE) + 1} to {Math.min(currentPage * BOOKINGS_PER_PAGE, totalBookings)} of {totalBookings} bookings
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-400">
            Page {currentPage} of {Math.ceil(totalBookings / BOOKINGS_PER_PAGE)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(Math.ceil(totalBookings / BOOKINGS_PER_PAGE), currentPage + 1))}
            disabled={currentPage === Math.ceil(totalBookings / BOOKINGS_PER_PAGE)}
            className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
