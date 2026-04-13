import React, { useEffect, useState, useCallback } from 'react';
import {
  Search, Calendar, Clock, CheckCircle, XCircle, X,
  CreditCard, CheckCircle2, User, MessageSquare, Filter, ChevronDown, RefreshCcw
} from 'lucide-react';
import { Loader } from '../../../../components/ui_components/Loader';
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';
import { logoutUser } from '../../../../API/APIs';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DashboardLoader } from '../../../../components/ui_components/DashboardLoader';

// --- Types ---
interface BookingResponse {
  id: string;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  note: string | null;
  slot: { date: string; time: string };
  userData: { username: string; role: string };
  serviceData: { serviceName: string; imageUrl: string; durationMinutes: number };
}

interface FilterOptions {
  services: { id: string, name: string, price: number }[];
  staff: { id: string, name: string }[];
  statuses: string[];
  date_range: { min_date: string, max_date: string };
  price_range: { min_price: number, max_price: number };
}

const BookingsPage: React.FC = () => {
  const { apiSalonPatch, apiSalonRequest } = useSalonApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Data States
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [filterMeta, setFilterMeta] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusNote, setStatusNote] = useState<string>("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // --- FILTER STATES ---
  const initialFilters = {
    search: '',
    status: 'ALL',
    date: '',
    from_date: '',
    to_date: '',
    date_preset: '',
    min_price: '',
    max_price: '',
    global_search: ''
  };

  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  // --- AUTH HELPERS ---
  const getAuthData = () => {
    const authData = localStorage.getItem("authState");
    return authData ? JSON.parse(authData) : null;
  };

  const getSalonId = () => {
    const parsedAuth = getAuthData();
    return parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
  };

  const getUserId = () => {
    const parsedAuth = getAuthData();
    // Adjust based on your auth state structure
    return parsedAuth?.user?.user?.id || parsedAuth?.user?.id || parsedAuth?.user?._id;
  };

  // 1. Fetch Filter Meta Data
  const fetchFilterOptions = async () => {
    const salonId = getSalonId();
    const userId = getUserId();
    if (!salonId) return;
    try {
      const res = await apiSalonRequest<FilterOptions>(
        `/bookings/salon/${salonId}/filters`,
        { headers: { "X-User-Id": userId } }
      );
      if (res.data) setFilterMeta(res.data);
    } catch (err) { console.error("Filter fetch error", err); }
  };

  // 2. Fetch Bookings (Server-side Filtering)
  const fetchBookings = useCallback(async (filtersToUse = appliedFilters) => {
    const salonId = getSalonId();
    const userId = getUserId();

    if (!salonId) {
      dispatch(logoutUser());
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtersToUse.status !== 'ALL') params.append('status', filtersToUse.status);
      if (filtersToUse.search) params.append('search', filtersToUse.search);
      if (filtersToUse.date) params.append('date', filtersToUse.date);
      if (filtersToUse.from_date) params.append('from_date', filtersToUse.from_date);
      if (filtersToUse.to_date) params.append('to_date', filtersToUse.to_date);
      if (filtersToUse.date_preset) params.append('date_preset', filtersToUse.date_preset);
      if (filtersToUse.min_price) params.append('min_price', filtersToUse.min_price);
      if (filtersToUse.max_price) params.append('max_price', filtersToUse.max_price);
      if (filtersToUse.global_search) params.append('global_search', filtersToUse.global_search);

      const res = await apiSalonRequest<BookingResponse[]>(
        `/bookings/salon/${salonId}?${params.toString()}`,
        { headers: { "X-User-Id": userId } }
      );
      if (res.data) setBookings(res.data);
    } catch (error) {
      console.error("Fetch bookings error:", error);
    } finally {
      setLoading(false);
    }
  }, [apiSalonRequest, dispatch, navigate, appliedFilters]);

  useEffect(() => {
    fetchFilterOptions();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- BUTTON HANDLERS ---
  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    fetchBookings(draftFilters);
  };

  const handleResetFilters = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
    fetchBookings(initialFilters);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const userId = getUserId();
    setLoading(true);
    try {
      const encodedNote = encodeURIComponent(statusNote.trim() || `Updated to ${newStatus}`);
      // Assuming apiSalonPatch signature: (url, body, options)
      const res = await apiSalonPatch(
        `/bookings/${bookingId}/status?status=${newStatus}&note=${encodedNote}`, 
        {}, 
        { headers: { "X-User-Id": userId } }
      );
      
      if (res.error) throw new Error(res.error);
      setNotification({ type: 'success', message: `Booking marked as ${newStatus}` });
      setIsModalOpen(false);
      setStatusNote("");
      fetchBookings();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'COMPLETED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      <DashboardLoader isVisible={loading} />

      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 bg-white border-l-4 border-[#1E4D8C] animate-in slide-in-from-top-4">
          <CheckCircle2 className="text-[#1E4D8C]" size={20} />
          <span className="text-sm font-bold text-gray-800">{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Appointment Deck</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manage your salon schedule</p>
        </div>
        <button onClick={handleResetFilters} className="p-2 text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-[10px] font-black uppercase">
          <RefreshCcw size={14} /> Reset
        </button>
      </div>

      {/* --- SERVER SIDE FILTERS PANEL --- */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Search Everywhere</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                value={draftFilters.global_search} 
                onChange={(e) => setDraftFilters({ ...draftFilters, global_search: e.target.value })} 
                placeholder="Service, ID, note..." 
                className="w-full pl-11 h-12 bg-gray-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-blue-50 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Status</label>
            <select 
              value={draftFilters.status} 
              onChange={(e) => setDraftFilters({ ...draftFilters, status: e.target.value })} 
              className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none cursor-pointer focus:ring-4 focus:ring-blue-50 appearance-none"
            >
              <option value="ALL">All Status</option>
              {filterMeta?.statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Date Range (From)</label>
            <input 
              type="date" 
              min={filterMeta?.date_range.min_date}
              max={filterMeta?.date_range.max_date}
              value={draftFilters.from_date} 
              onChange={(e) => setDraftFilters({ ...draftFilters, from_date: e.target.value, date: '', date_preset: '' })} 
              className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-blue-50" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Date Range (To)</label>
            <input 
              type="date" 
              min={filterMeta?.date_range.min_date}
              max={filterMeta?.date_range.max_date}
              value={draftFilters.to_date} 
              onChange={(e) => setDraftFilters({ ...draftFilters, to_date: e.target.value, date: '', date_preset: '' })} 
              className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-blue-50" 
            />
          </div>

          <div className="flex items-end">
            <button 
              onClick={handleApplyFilters}
              className="h-12 w-full bg-[#1E4D8C] hover:bg-[#153a6b] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              <Filter size={14} /> Apply Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-50">
           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Quick Date Preset</label>
             <select 
               value={draftFilters.date_preset} 
               onChange={(e) => setDraftFilters({ ...draftFilters, date_preset: e.target.value, from_date: '', to_date: '', date: '' })} 
               className="w-full h-12 px-4 bg-blue-50/50 text-[#1E4D8C] border-none rounded-2xl text-sm font-bold outline-none"
             >
               <option value="">No Preset</option>
               <option value="today">Today</option>
               <option value="yesterday">Yesterday</option>
               <option value="this_week">This Week</option>
               <option value="last_month">Last Month</option>
             </select>
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Min Price (₹)</label>
             <input type="number" value={draftFilters.min_price} onChange={(e) => setDraftFilters({ ...draftFilters, min_price: e.target.value })} className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-sm" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Max Price (₹)</label>
             <input type="number" value={draftFilters.max_price} onChange={(e) => setDraftFilters({ ...draftFilters, max_price: e.target.value })} className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-sm" />
           </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr className="text-[10px] uppercase text-gray-400 font-black tracking-[0.2em]">
                <th className="px-8 py-5">Schedule</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Service Rendered</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.length > 0 ? (
                bookings.map((row) => (
                  <tr key={row.id} onClick={() => { setSelectedBooking(row); setStatusNote(""); setIsModalOpen(true); }} className="group cursor-pointer hover:bg-blue-50/30 transition-all">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-gray-800">{row.slot.date}</p>
                      <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5 mt-1">
                        <Clock size={12} className="text-[#1E4D8C]" /> {row.slot.time}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#1E4D8C] font-black text-[10px] uppercase">
                          {row.userData?.username?.charAt(0)}
                        </div>
                        <p className="text-sm font-bold text-gray-700">{row.userData?.username}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-800">{row.serviceData?.serviceName}</p>
                      <p className="text-[11px] text-[#1E4D8C] font-black mt-1 uppercase tracking-tighter">₹{row.price}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center text-gray-400 italic">No bookings found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="relative h-40 bg-[#1E4D8C]">
              {selectedBooking.serviceData?.imageUrl && (
                <img src={selectedBooking.serviceData.imageUrl} alt="service" className="w-full h-full object-cover opacity-40" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-all"><X size={20} /></button>
            </div>

            <div className="px-8 pb-10 -mt-10 relative z-10 space-y-6">
              <div>
                <span className="bg-[#1E4D8C] text-white text-[9px] px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block font-black">Booking Detail</span>
                <h3 className="text-3xl font-black text-gray-800 tracking-tight">{selectedBooking.serviceData?.serviceName}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">ID: {selectedBooking.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Calendar size={14} className="text-[#1E4D8C]" /> Schedule</p>
                  <p className="text-sm font-black text-gray-800">{selectedBooking.slot.date}</p>
                  <p className="text-xs text-gray-500 font-bold mt-1">{selectedBooking.slot.time}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><User size={14} className="text-[#1E4D8C]" /> Customer</p>
                  <p className="text-sm font-black text-gray-800">{selectedBooking.userData?.username}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">₹{selectedBooking.price}</p>
                </div>
              </div>

              {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && (
                <div className="space-y-2 animate-in slide-in-from-bottom-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                    <MessageSquare size={12} className="text-[#1E4D8C]" /> Internal Remark / Note
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Customer confirmed via phone..."
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-none h-24"
                  />
                </div>
              )}

              {selectedBooking.note && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Last Remark</p>
                  <p className="text-xs text-amber-800 font-bold italic">"{selectedBooking.note}"</p>
                </div>
              )}

              <div className="pt-4">
                {selectedBooking.status === 'PENDING' && (
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => updateBookingStatus(selectedBooking.id, 'CANCELLED')} className="h-14 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95">Reject</button>
                    <button onClick={() => updateBookingStatus(selectedBooking.id, 'CONFIRMED')} className="h-14 bg-[#1E4D8C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">Confirm Booking</button>
                  </div>
                )}

                {selectedBooking.status === 'CONFIRMED' && (
                  <button onClick={() => updateBookingStatus(selectedBooking.id, 'COMPLETED')} className="w-full h-16 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                    <CheckCircle size={18} /> Mark as Completed
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