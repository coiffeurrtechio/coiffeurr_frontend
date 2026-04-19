import React, { useEffect, useState, useCallback } from 'react';
import {
  Search, Calendar, Clock, CheckCircle, XCircle, X,
  CreditCard, CheckCircle2, User, MessageSquare, Filter, ChevronDown, RefreshCcw,
  Users, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Loader } from '../../../../components/ui_components/Loader';
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';
import { logoutUser } from '../../../../API/APIs';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DashboardLoader } from '../../../../components/ui_components/DashboardLoader';
import { useTranslation } from 'react-i18next';

// --- Types ---
interface BookingResponse {
  id: string;
  booking_id: string;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED';
  note: string | null;
  slot: { date: string; time: string };
  userData: { username: string; role: string; imageUrl?: string };
  serviceData: { serviceName: string; imageUrl: string; durationMinutes: number };
  service_id?: string;
  staffData?: { id: string; name: string; imageUrl?: string };
  isRescheduled?: boolean;
  previousSlot?: { date: string; time: string };
  rescheduleReason?: string;
  rescheduledAt?: string;
  modificationReason?: string;
  modifiedAt?: string;
  modifiedBy?: string;
}

interface FilterOptions {
  services: { id: string, name: string, price: number }[];
  staff: { id: string, name: string }[];
  statuses: string[];
  date_range: { min_date: string, max_date: string };
  price_range: { min_price: number, max_price: number };
}

const BookingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { apiSalonPatch, apiSalonRequest, apiSalonPost } = useSalonApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Data States
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [filterMeta, setFilterMeta] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting States
  const [sortField, setSortField] = useState<string>('slot.date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // UI States
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusNote, setStatusNote] = useState<string>("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // --- FILTER STATES ---
  const initialFilters = {
    search: '',
    status: 'PENDING',
    staff_id: 'ALL', // Added for staff filter
    date: '',
    from_date: '', // Don't default to today, let API provide range
    to_date: '',
    date_preset: 'today',
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
      if (res.data) {
        setFilterMeta(res.data);
      }
    } catch (err) { console.error("Filter fetch error", err); }
  };

  const fetchBookings = useCallback(async (filtersToUse = appliedFilters, page = currentPage) => {
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
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());

      // PRECISION: Only append if value is not 'ALL' or empty
      if (filtersToUse.status && filtersToUse.status !== 'ALL') {
        params.append('status', filtersToUse.status);
      }
      if (filtersToUse.staff_id && filtersToUse.staff_id !== 'ALL') {
        params.append('staff_id', filtersToUse.staff_id);
      }

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
      if (res.data) {
        setBookings(res.data);
        // For now, estimate total pages based on returned items
        // If API returns fewer items than limit, we might be on last page
        if (res.data.length < itemsPerPage) {
          setTotalPages(page);
        } else {
          setTotalPages(page + 1); // At least one more page exists
        }
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
    } finally {
      setLoading(false);
    }
  }, [apiSalonRequest, dispatch, navigate, appliedFilters, currentPage, itemsPerPage]);

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

  useEffect(() => {
    if (isRescheduleMode && rescheduleDate) {
      fetchAvailableSlots(rescheduleDate);
    }
  }, [isRescheduleMode, rescheduleDate]);

  // --- BUTTON HANDLERS ---
  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1);
    setAppliedFilters(draftFilters);
    fetchBookings(draftFilters, 1);
  }, [draftFilters, fetchBookings]);

  useEffect(() => {
    setCurrentPage(1);
    setAppliedFilters(draftFilters);
    fetchBookings(draftFilters, 1);
  }, [draftFilters.staff_id, draftFilters.status, draftFilters.date_preset]);

  const handleResetFilters = () => {
    setCurrentPage(1);
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
    fetchBookings(initialFilters, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchBookings(appliedFilters, newPage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortField === 'slot.date') {
      aValue = a.slot.date;
      bValue = b.slot.date;
    } else if (sortField === 'userData.username') {
      aValue = a.userData?.username || '';
      bValue = b.userData?.username || '';
    } else if (sortField === 'staffData.name') {
      aValue = a.staffData?.name || '';
      bValue = b.staffData?.name || '';
    } else if (sortField === 'serviceData.serviceName') {
      aValue = a.serviceData?.serviceName || '';
      bValue = b.serviceData?.serviceName || '';
    } else if (sortField === 'price') {
      aValue = a.price;
      bValue = b.price;
    } else if (sortField === 'status') {
      aValue = a.status;
      bValue = b.status;
    } else {
      return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const userId = getUserId();
    if (newStatus === 'CONFIRMED') {
      setIsConfirming(true);
    } else {
      setLoading(true);
    }
    try {
      const encodedNote = encodeURIComponent(statusNote.trim() || `Updated to ${newStatus}`);
      const res = await apiSalonPatch(
        `/bookings/${bookingId}/status?status=${newStatus}&note=${encodedNote}`,
        {},
        { headers: { "X-User-Id": userId } }
      );

      if (res.error) throw new Error(res.error);
      setNotification({ type: 'success', message: t('booking.bookingMarkedAs', { status: newStatus }) });
      setIsModalOpen(false);
      setStatusNote("");
      fetchBookings();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || t('booking.updateFailed') });
    } finally {
      setLoading(false);
      setIsConfirming(false);
    }
  };

  const handleRescheduleBooking = async () => {
    setIsRescheduling(true);
    try {
      const res = await apiSalonPost(
        `/bookings/${selectedBooking?.id}/modify`,
        {
          new_date: rescheduleDate,
          new_time: rescheduleTime,
          reason: rescheduleReason
        }
      );

      if (res.error) throw new Error(res.error);
      setNotification({ type: 'success', message: t('booking.bookingRescheduledSuccessfully') });
      setIsModalOpen(false);
      setIsRescheduleMode(false);
      setRescheduleDate("");
      setRescheduleTime("");
      setRescheduleReason("");
      setAvailableSlots([]);
      fetchBookings();
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || t('booking.rescheduleFailed') });
    } finally {
      setIsRescheduling(false);
    }
  };

  const fetchAvailableSlots = async (date: string) => {
    if (!date || !selectedBooking) return;
    const salonId = getSalonId();
    if (!salonId) return;

    setLoadingSlots(true);
    try {
      const res = await apiSalonRequest(
        `/salons/${salonId}/slots?date=${date}&service_id=${selectedBooking.service_id || ''}`,
        { headers: { "X-User-Id": getUserId() } }
      );
      if (res.data && 'slots' in res.data) {
        const slots = (res.data as any).slots.map((slot: any) => ({
          time: slot.time,
          capacity: slot.totalCapacity,
          booked: slot.bookedCount
        }));
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
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
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 bg-white border-l-4 border-[#1E4D8C] animate-in slide-in-from-top-4">
          <CheckCircle2 className="text-[#1E4D8C]" size={20} />
          <span className="text-sm font-bold text-gray-800">{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">{t('booking.appointmentDeck')}</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('booking.manageSchedule')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleResetFilters} className="p-2 text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-[10px] font-black uppercase">
            <RefreshCcw size={14} /> {t('booking.reset')}
          </button>
          <button onClick={handleApplyFilters} className="bg-[#1E4D8C] hover:bg-[#153a6b] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
            <Filter size={14} /> {t('booking.applyFilters')}
          </button>
        </div>
      </div>

      {/* --- SERVER SIDE FILTERS PANEL --- */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">

        {/* TOP SEARCH BAR (Prominent Position) */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('booking.searchEverywhere')}</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={draftFilters.global_search}
              onChange={(e) => setDraftFilters({ ...draftFilters, global_search: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder={t('booking.searchPlaceholder')}
              className="w-full pl-12 h-14 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 transition-all outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {/* Staff Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('booking.specialist')}</label>
            <div className="relative">
              <select
                // Ensure this matches the key in initialFilters
                value={draftFilters.staff_id || 'ALL'}
                onChange={(e) => setDraftFilters({ ...draftFilters, staff_id: e.target.value })}
                className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none cursor-pointer focus:ring-4 focus:ring-blue-50 appearance-none"
              >
                <option value="ALL">{t('booking.allStaff')}</option>
                {/* Optional chaining ?. ensure we don't crash if filterMeta is null */}
                {filterMeta?.staff?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('booking.processStatus')}</label>
            <div className="relative">
              <select
                value={draftFilters.status || 'ALL'}
                onChange={(e) => setDraftFilters({ ...draftFilters, status: e.target.value })}
                className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none cursor-pointer focus:ring-4 focus:ring-blue-50 appearance-none transition-all"
              >
                <option value="ALL">{t('booking.allStatuses')}</option>
                {filterMeta?.statuses?.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Staff Filter (New) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('booking.specialist')}</label>
            <div className="relative">
              <select
                value={draftFilters.staff_id}
                onChange={(e) => setDraftFilters({ ...draftFilters, staff_id: e.target.value })}
                className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none cursor-pointer focus:ring-4 focus:ring-blue-50 appearance-none"
              >
                <option value="ALL">{t('booking.allStaff')}</option>
                {filterMeta?.staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('booking.dateRangeFrom')}</label>
            <input
              type="date"
              min={filterMeta?.date_range.min_date}
              max={filterMeta?.date_range.max_date}
              value={draftFilters.from_date}
              onChange={(e) => setDraftFilters({ ...draftFilters, from_date: e.target.value, date: '', date_preset: '' })}
              onKeyPress={handleKeyPress}
              className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('booking.dateRangeTo')}</label>
            <input
              type="date"
              min={filterMeta?.date_range.min_date}
              max={filterMeta?.date_range.max_date}
              value={draftFilters.to_date}
              onChange={(e) => setDraftFilters({ ...draftFilters, to_date: e.target.value, date: '', date_preset: '' })}
              onKeyPress={handleKeyPress}
              className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-50">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('booking.quickDatePreset')}</label>
            <select
              value={draftFilters.date_preset}
              onChange={(e) => setDraftFilters({ ...draftFilters, date_preset: e.target.value, from_date: '', to_date: '', date: '' })}
              className="w-full h-12 px-4 bg-blue-50/50 text-[#1E4D8C] border-none rounded-2xl text-sm font-bold outline-none cursor-pointer"
            >
              <option value="">{t('booking.noPreset')}</option>
              <option value="today">{t('booking.today')}</option>
              <option value="yesterday">{t('booking.yesterday')}</option>
              <option value="this_week">{t('booking.thisWeek')}</option>
              <option value="last_month">{t('booking.lastMonth')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('booking.minPrice')}</label>
            <input type="number"
              min={filterMeta?.price_range?.min_price}
              max={filterMeta?.price_range?.max_price}
              value={draftFilters.min_price}
              onChange={(e) => setDraftFilters({ ...draftFilters, min_price: e.target.value })}
              onKeyPress={handleKeyPress}
              className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('booking.maxPrice')}</label>
            <input type="number"
              min={filterMeta?.price_range?.min_price}
              max={filterMeta?.price_range?.max_price}
              value={draftFilters.max_price}
              onChange={(e) => setDraftFilters({ ...draftFilters, max_price: e.target.value })}
              onKeyPress={handleKeyPress}
              className="w-full h-12 px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none" />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#1E4D8C] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-gray-400">{t('booking.loadingBookings')}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr className="text-[10px] uppercase text-gray-400 font-black tracking-[0.2em]">
                  <th className="px-8 py-5 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleSort('booking_id')}>
                    {t('booking.bookingId')} {sortField === 'booking_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-8 py-5 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleSort('slot.date')}>
                    {t('booking.schedule')} {sortField === 'slot.date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-8 py-5 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleSort('userData.username')}>
                    {t('booking.customer')} {sortField === 'userData.username' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-8 py-5 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleSort('staffData.name')}>
                    {t('booking.specialist')} {sortField === 'staffData.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-8 py-5 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleSort('serviceData.serviceName')}>
                    {t('booking.serviceRendered')} {sortField === 'serviceData.serviceName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-8 py-5 text-center cursor-pointer hover:text-gray-600 transition-colors" onClick={() => handleSort('status')}>
                    {t('booking.status')} {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedBookings.length > 0 ? (
                sortedBookings.map((row) => (
                  <tr key={row.id} onClick={() => { setSelectedBooking(row); setStatusNote(""); setIsModalOpen(true); }} className="group cursor-pointer hover:bg-blue-50/30 transition-all">
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-gray-600">{row.booking_id}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-black text-gray-800">{row.slot.date}</p>
                        <p className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5">
                          <Clock size={12} className="text-[#1E4D8C]" /> {row.slot.time}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {row.userData?.imageUrl ? (
                          <img
                            src={row.userData.imageUrl}
                            alt={row.userData.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#1E4D8C] font-black text-[10px] uppercase">
                            {row.userData?.username?.charAt(0)}
                          </div>
                        )}
                        <p className="text-sm font-bold text-gray-700">{row.userData?.username}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {row.staffData?.imageUrl ? (
                          <img
                            src={row.staffData.imageUrl}
                            alt={row.staffData.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-black text-[10px] uppercase">
                            {row.staffData?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <p className="text-sm font-bold text-gray-800">{row.staffData?.name || t('booking.notAssigned')}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-800">{row.serviceData?.serviceName}</p>
                      <p className="text-[11px] text-[#1E4D8C] font-black mt-1 uppercase tracking-tighter">₹{row.price}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(row.status)}`}>
                          {row.status}
                        </span>
                        {row.isRescheduled && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[8px] font-black uppercase rounded-full border border-orange-200">
                            RESC
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center text-gray-400 italic font-bold">{t('booking.noBookingsFound')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {!loading && (
        <div className="flex items-center justify-between px-8 py-4 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400">
            {t('booking.pageOf', { current: currentPage, total: totalPages })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
            <div className="relative h-40 bg-[#1E4D8C] flex-shrink-0">
              {selectedBooking.serviceData?.imageUrl && (
                <img src={selectedBooking.serviceData.imageUrl} alt="service" className="w-full h-full object-cover opacity-40" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-all"><X size={20} /></button>
            </div>

            <div className="px-8 pb-10 -mt-10 relative z-10 space-y-6 overflow-y-auto flex-1">
              <div>
                <span className="bg-[#1E4D8C] text-white text-[9px] px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block font-black">{t('booking.bookingDetail')}</span>
                <h2 className="text-lg font-black text-gray-800">{selectedBooking.serviceData?.serviceName}</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">{t('booking.bookingId')}: {selectedBooking.booking_id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Calendar size={14} className="text-[#1E4D8C]" /> {t('booking.schedule')}</p>
                  <p className="text-sm font-black text-gray-800">{selectedBooking.slot.date}</p>
                  <p className="text-xs text-gray-500 font-bold mt-1">{selectedBooking.slot.time}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><User size={14} className="text-[#1E4D8C]" /> {t('booking.customer')}</p>
                  <p className="text-sm font-black text-gray-800">{selectedBooking.userData?.username}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{t('booking.price')}: ₹{selectedBooking.price}</p>
                </div>
              </div>

              {selectedBooking.isRescheduled && (
                <div className="bg-orange-50/50 p-5 rounded-3xl border border-orange-100">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[8px] font-black uppercase rounded-full border border-orange-200">{t('booking.rescheduled')}</span>
                  </p>
                  {selectedBooking.previousSlot && (
                    <div className="mb-3">
                      <p className="text-[9px] font-bold text-gray-500">{t('booking.original')}: {selectedBooking.previousSlot.date} at {selectedBooking.previousSlot.time}</p>
                    </div>
                  )}
                  {(selectedBooking.rescheduleReason || selectedBooking.modificationReason) && (
                    <div className="mb-2">
                      <p className="text-[9px] font-bold text-gray-600">{t('booking.reason')}: {selectedBooking.rescheduleReason || selectedBooking.modificationReason}</p>
                    </div>
                  )}
                  {(selectedBooking.rescheduledAt || selectedBooking.modifiedAt) && (
                    <p className="text-[9px] font-bold text-gray-500">{t('booking.modified')}: {new Date(selectedBooking.rescheduledAt || selectedBooking.modifiedAt || '').toLocaleString()}</p>
                  )}
                </div>
              )}

              {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && (
                <div className="space-y-2 animate-in slide-in-from-bottom-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-2">
                    <MessageSquare size={12} className="text-[#1E4D8C]" /> {t('booking.internalRemark')}
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder={t('booking.remarkPlaceholder')}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-none h-24"
                  />
                </div>
              )}

              {isRescheduleMode && (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('booking.newDate')}</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setRescheduleDate(e.target.value);
                        setRescheduleTime("");
                      }}
                      className="w-full h-12 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                  {rescheduleDate && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('booking.availableTimeSlots')}</label>
                      {loadingSlots ? (
                        <div className="w-full h-12 px-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-sm text-gray-400">
                          {t('booking.loadingSlots')}
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot: any) => (
                            <button
                              key={slot.time}
                              onClick={() => setRescheduleTime(slot.time)}
                              disabled={slot.booked >= slot.capacity}
                              className={`h-12 px-4 rounded-2xl text-sm font-bold transition-all ${
                                rescheduleTime === slot.time
                                  ? 'bg-[#1E4D8C] text-white'
                                  : slot.booked >= slot.capacity
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white border border-gray-200 hover:bg-blue-50'
                              }`}
                            >
                              {slot.time}
                              {slot.booked > 0 && <span className="text-[9px] ml-1">({slot.booked}/{slot.capacity})</span>}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-12 px-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-sm text-gray-400">
                          {t('booking.noSlotsAvailable')}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('booking.reasonOptional')}</label>
                    <textarea
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      placeholder={t('booking.reasonPlaceholder')}
                      className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-none h-20"
                    />
                  </div>
                </div>
              )}

              {selectedBooking.note && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">{t('booking.lastRemark')}</p>
                  <p className="text-xs text-amber-800 font-bold italic">"{selectedBooking.note}"</p>
                </div>
              )}

              <div className="pt-4">
                {selectedBooking.status === 'PENDING' && (
                  <>
                    {!isRescheduleMode ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => updateBookingStatus(selectedBooking.id, 'CANCELLED')} className="h-14 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95">{t('booking.reject')}</button>
                        <button onClick={() => updateBookingStatus(selectedBooking.id, 'CONFIRMED')} disabled={isConfirming} className="h-14 bg-[#1E4D8C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                          {isConfirming ? (
                            <>
                              <RefreshCcw size={14} className="animate-spin" /> {t('booking.pleaseWait')}
                            </>
                          ) : (
                            t('booking.confirmBooking')
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setIsRescheduleMode(false)} disabled={isRescheduling} className="h-14 bg-gray-100 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">{t('booking.cancel')}</button>
                        <button onClick={handleRescheduleBooking} disabled={!rescheduleDate || !rescheduleTime || isRescheduling} className="h-14 bg-[#1E4D8C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                          {isRescheduling ? (
                            <>
                              <RefreshCcw size={14} className="animate-spin" /> {t('booking.rescheduling')}
                            </>
                          ) : (
                            <>
                              <RefreshCcw size={14} /> {t('booking.reschedule')}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    <button onClick={() => setIsRescheduleMode(!isRescheduleMode)} disabled={isRescheduling} className="w-full mt-3 h-12 bg-blue-50 text-[#1E4D8C] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <RefreshCcw size={14} /> {isRescheduleMode ? t('booking.cancelReschedule') : t('booking.rescheduleBooking')}
                    </button>
                  </>
                )}

                {selectedBooking.status === 'CONFIRMED' && (
                  <>
                    {!isRescheduleMode ? (
                      <button onClick={() => updateBookingStatus(selectedBooking.id, 'COMPLETED')} className="w-full h-16 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                        <CheckCircle size={18} /> {t('booking.markAsCompleted')}
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setIsRescheduleMode(false)} disabled={isRescheduling} className="h-14 bg-gray-100 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">{t('booking.cancel')}</button>
                        <button onClick={handleRescheduleBooking} disabled={!rescheduleDate || !rescheduleTime || isRescheduling} className="h-14 bg-[#1E4D8C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                          {isRescheduling ? (
                            <>
                              <RefreshCcw size={14} className="animate-spin" /> {t('booking.rescheduling')}
                            </>
                          ) : (
                            <>
                              <RefreshCcw size={14} /> {t('booking.reschedule')}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    <button onClick={() => setIsRescheduleMode(!isRescheduleMode)} disabled={isRescheduling} className="w-full mt-3 h-12 bg-blue-50 text-[#1E4D8C] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <RefreshCcw size={14} /> {isRescheduleMode ? t('booking.cancelReschedule') : t('booking.rescheduleBooking')}
                    </button>
                  </>
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