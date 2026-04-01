import React, { useEffect, useState } from 'react';

import {
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  X,
  CreditCard,
  CheckCircle2,
  SlidersHorizontal, Trash2
} from 'lucide-react';
import { useApi } from '../../../../API/SalonsAPIs/ALLSalonAPI';
import { Loader } from '../../../../components/ui_components/Loader';
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';
import { logoutUser } from '../../../../API/APIs';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// --- Types ---
interface BookingSlot {
  date: string;
  time: string;
  duration: number;
}

interface BookingResponse {
  userId: string;
  salonId: string;
  staffId: string;
  service_id: string;
  slot: BookingSlot;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  validTill: string;
  metadata: any;
  id: string;
}

const BookingsPage: React.FC = () => {
  const { apiRequest } = useApi();
  const { apiSalonPatch, apiSalonRequest } = useSalonApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Notification State for Success/Error feedback
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    service: 'ALL',
    date: '',
    maxPrice: 5000 // Default max
  });


  // Extract unique services from bookings for the filter dropdown
  const uniqueServices = Array.from(new Set(bookings.map(b => b.serviceData?.serviceName))).filter(Boolean);

  // --- FILTER LOGIC ---
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = booking.userData?.username?.toLowerCase().includes(filters.search.toLowerCase()) ||
      booking.id.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'ALL' || booking.status === filters.status;
    const matchesService = filters.service === 'ALL' || booking.serviceData?.serviceName === filters.service;
    const matchesDate = !filters.date || booking.slot.date === filters.date;
    const matchesPrice = booking.price <= filters.maxPrice;

    return matchesSearch && matchesStatus && matchesService && matchesDate && matchesPrice;
  });

  const resetFilters = () => {
    setFilters({ search: '', status: 'ALL', service: 'ALL', date: '', maxPrice: 5000 });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
      if (!salonId) {
        dispatch(logoutUser());
        // Then redirect
        navigate("/login");
        console.log("salonid not found");
        return;

      }

      const res = await apiSalonRequest<BookingResponse[]>(`/bookings/salon/${salonId}`);
      if (res.data) {
        setBookings(res.data);
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setLoading(true);
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      // Get the logged-in User ID (Salon Owner) for the header
      const salonOwnerId = parsedAuth?.user?.user?.id;

      const res = await apiSalonPatch(
        `/bookings/${bookingId}/status?status=${newStatus}&note=Customer`,
        {}, // Body is empty as per your requirement
        {
          headers: {
            "X-User-Id": salonOwnerId, // Salon Owner ID in header
          }
        }
      );

      if (res.error) throw new Error(res.error);

      setNotification({ type: 'success', message: `Booking ${newStatus.toLowerCase()} successfully!` });
      setIsModalOpen(false);
      fetchBookings();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || "Failed to update status" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-50 text-green-600 border-green-100';
      case 'COMPLETED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      case 'PENDING': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500 relative">
      <Loader isVisible={loading} />

      {/* --- Notification Toast --- */}
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-white border-green-500 text-green-600' : 'bg-white border-red-500 text-red-600'
          } border-l-4`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Booking Management</h1>
      </div>

      {/* --- ADVANCED FILTERS BAR --- */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Search Customer/Ref</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Service</label>
            <select
              value={filters.service}
              onChange={(e) => setFilters({ ...filters, service: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none cursor-pointer"
            >
              <option value="ALL">All Services</option>
              {uniqueServices.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          {/* Date Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Appointment Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Price Range */}
          <div className="w-full md:w-1/2 space-y-2">
            <div className="flex justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max Price: ₹{filters.maxPrice}</label>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1E4D8C]"
            />
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
          >
            <Trash2 size={14} /> Reset Filters
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr className="text-[11px] uppercase text-gray-400 font-bold tracking-widest">
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Service Details</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBookings.length > 0 ?

                (filteredBookings.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      console.log("row =", row);

                      setSelectedBooking(row);
                      setIsModalOpen(true);
                    }}
                    className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-800">{row.slot.date}</p>
                      <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {row.slot.time} ({row.slot.duration}m)
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-mono text-gray-500 truncate w-32">{row?.userData?.username}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-700">{row.serviceData?.serviceName}</p>
                      <p className="text-[10px] text-[#1E4D8C] font-bold">₹{row.price}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                )))
                :
                (<tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-gray-400">
                    <p className="text-sm">No bookings found matching your filters.</p>
                  </td>
                </tr>)
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">

            {/* Header with Service Image Background */}
            <div className="relative h-32 bg-gray-200">
              {selectedBooking.serviceData?.imageUrl && (
                <img
                  src={selectedBooking.serviceData.imageUrl}
                  alt="service"
                  className="w-full h-full object-cover opacity-60"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md hover:bg-white rounded-full transition-colors text-gray-600 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pb-8 -mt-12 relative z-10">
              {/* Title Section */}
              <div className="mb-6">
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                  {selectedBooking.serviceData?.serviceName}
                </h3>
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.2em]">
                  REF: {selectedBooking.id}
                </p>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#1E4D8C]" /> Appointment
                  </p>
                  <p className="text-sm font-bold text-gray-800">{selectedBooking.slot.date}</p>
                  <p className="text-xs text-gray-500 font-medium">{selectedBooking.slot.time}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                    <CreditCard size={12} className="text-[#1E4D8C]" /> Payment
                  </p>
                  <p className="text-sm font-black text-[#1E4D8C]">₹{selectedBooking.price}</p>
                  <p className={`text-[9px] font-bold uppercase ${getStatusColor(selectedBooking.status).split(' ')[1]}`}>
                    {selectedBooking.status}
                  </p>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Customer</span>
                  <span className="text-xs font-bold text-gray-700">{selectedBooking.userData?.username}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Duration</span>
                  <span className="text-xs font-bold text-gray-700">{selectedBooking.serviceData?.durationMinutes} mins</span>
                </div>

                {selectedBooking.note && (
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">Customer Note</span>
                    <p className="text-xs text-blue-700 italic">"{selectedBooking.note}"</p>
                  </div>
                )}

                <div className="p-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Description</span>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {selectedBooking.serviceData?.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8">
                {selectedBooking.status === 'PENDING' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'CANCELLED')}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 rounded-2xl text-xs font-bold transition-all hover:bg-red-100"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'CONFIRMED')}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#1E4D8C] text-white rounded-2xl text-xs font-bold transition-all hover:bg-[#153a6b] shadow-lg shadow-blue-900/20"
                    >
                      <CheckCircle size={16} /> Confirm
                    </button>
                  </div>
                )}

                {selectedBooking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, 'COMPLETED')}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-2xl text-xs font-bold transition-all hover:bg-green-700 shadow-lg shadow-green-900/20"
                  >
                    <CheckCircle size={16} /> Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;