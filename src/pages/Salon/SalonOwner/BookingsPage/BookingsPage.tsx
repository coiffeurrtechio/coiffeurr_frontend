import React, { useEffect, useState, useCallback } from 'react';
import {
  Search, Calendar, Clock, CheckCircle, XCircle, X,
  CreditCard, CheckCircle2, User, MessageSquare, Filter, ChevronDown, RefreshCcw,
  Users, ChevronLeft, ChevronRight, Phone, ShieldCheck, Send, Loader2
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
  const [isCancelMode, setIsCancelMode] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSlowLoader, setShowSlowLoader] = useState(false);
  const [priceError, setPriceError] = useState<{ min?: string; max?: string }>({});

  // --- OTP STATES ---
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [otpChannels, setOtpChannels] = useState<string[]>([]);
  const [maskedContacts, setMaskedContacts] = useState<string[]>([]);
  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // --- FILTER STATES ---
  const initialFilters = {
    search: '',
    status: 'PENDING',
    staff_id: 'ALL', // Added for staff filter
    date: '',
    from_date: '', // Don't default to today, let API provide range
    to_date: '',
    date_preset: '',
    min_price: '',
    max_price: '',
    global_search: ''
  };

  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  // --- SLOW LOADER HELPER ---
  const withSlowLoader = async (operation: () => Promise<any>) => {
    let loaderTimeout: ReturnType<typeof setTimeout>;
    
    // Start timer to show loader after 1 second
    loaderTimeout = setTimeout(() => {
      setShowSlowLoader(true);
    }, 1000);

    try {
      const result = await operation();
      clearTimeout(loaderTimeout);
      setShowSlowLoader(false);
      return result;
    } catch (error) {
      clearTimeout(loaderTimeout);
      setShowSlowLoader(false);
      throw error;
    }
  };

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
      await withSlowLoader(async () => {
        const res = await apiSalonRequest<FilterOptions>(
          `/bookings/salon/${salonId}/filters`,
          { headers: { "X-User-Id": userId } }
        );
        if (res.data) {
          setFilterMeta(res.data);
        }
      });
    } catch (err) { console.error("Filter fetch error", err); }
  };

  const fetchBookings = useCallback(async (filtersToUse = appliedFilters, page = currentPage) => {
    const salonId = getSalonId();
    const userId = getUserId();

    if (!salonId || salonId === 'undefined') {
      // Don't auto-logout if coming from login (race condition)
      const fromLogin = sessionStorage.getItem('fromLogin');
      if (!fromLogin) {
        // If OWNER without salon, just return gracefully (don't logout)
        const authData = localStorage.getItem("authState");
        const parsedAuth = authData ? JSON.parse(authData) : null;
        const userRole = parsedAuth?.user?.user?.role || parsedAuth?.user?.role;
        if (userRole !== 'OWNER') {
          dispatch(logoutUser());
          navigate("/login");
        }
      }
      return;
    }

    setLoading(true);
    try {
      await withSlowLoader(async () => {
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
        if (res.data && Array.isArray(res.data)) {
          setBookings(res.data);
          // For now, estimate total pages based on returned items
          // If API returns fewer items than limit, we might be on last page
          if (res.data.length < itemsPerPage) {
            setTotalPages(page);
          } else {
            setTotalPages(page + 1); // At least one more page exists
          }
        } else {
          setBookings([]);
        }
      });
    } catch (error) {
      console.error("Fetch bookings error:", error);
      setBookings([]); // Ensure bookings is always an array even on error
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

  // --- OTP TIMER EFFECT ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

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

  const sortedBookings = [...(Array.isArray(bookings) ? bookings : [])].sort((a, b) => {
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
      await withSlowLoader(async () => {
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
      });
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
      await withSlowLoader(async () => {
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
      });
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || t('booking.rescheduleFailed') });
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancelBooking = async () => {
    const userId = getUserId();
    const reason = cancellationReason.trim() || t('booking.defaultCancellationMessage');
    try {
      await withSlowLoader(async () => {
        const encodedNote = encodeURIComponent(reason);
        const res = await apiSalonPatch(
          `/bookings/${selectedBooking?.id}/status?status=CANCELLED&note=${encodedNote}`,
          {},
          { headers: { "X-User-Id": userId } }
        );

        if (res.error) throw new Error(res.error);
        setNotification({ type: 'success', message: t('booking.bookingMarkedAs', { status: 'CANCELLED' }) });
        setIsModalOpen(false);
        setIsCancelMode(false);
        setCancellationReason("");
        fetchBookings();
      });
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || t('booking.updateFailed') });
    }
  };

  // --- OTP FUNCTIONS ---
  const handleRequestOtp = async () => {
    if (!selectedBooking) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await apiSalonPost(
        `/bookings/${selectedBooking.id}/complete-otp/request`,
        {}
      );
      if (res.error) throw new Error(res.error);
      setOtpSent(true);
      setResendTimer(30);
      if (res.data.channels && res.data.masked_contacts) {
        setOtpChannels(res.data.channels);
        setMaskedContacts(res.data.masked_contacts);
      }
      const channels = res.data.channels || ['sms'];
      setNotification({ type: 'success', message: `OTP sent via ${channels.map((c: string) => c.toUpperCase()).join(' & ')}` });
    } catch (error: any) {
      setOtpError(error.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtpAndComplete = async () => {
    if (!selectedBooking) return;
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await apiSalonPost(
        `/bookings/${selectedBooking.id}/complete-otp/verify`,
        { otp: otpString, note: statusNote.trim() || 'Completed with OTP verification' }
      );
      if (res.error) throw new Error(res.error);
      setNotification({ type: 'success', message: 'Booking marked as completed' });
      setIsOtpModalOpen(false);
      setIsModalOpen(false);
      setOtp(['', '', '', '', '', '']);
      setOtpSent(false);
      setStatusNote("");
      fetchBookings();
    } catch (error: any) {
      setOtpError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((digit, idx) => {
      if (idx < 6) newOtp[idx] = digit;
    });
    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[focusIndex]?.focus();
  };

  const resetOtpModal = () => {
    setIsOtpModalOpen(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError(null);
    setOtpSent(false);
    setResendTimer(30);
  };

  const fetchAvailableSlots = async (date: string) => {
    if (!date || !selectedBooking) return;
    const salonId = getSalonId();
    if (!salonId) return;

    setLoadingSlots(true);
    try {
      await withSlowLoader(async () => {
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
      });
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' };
      case 'COMPLETED': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', glow: 'shadow-[0_0_10px_rgba(59,130,246,0.3)]' };
      case 'CANCELLED': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]' };
      case 'PENDING': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]', animate: 'animate-pulse' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100', glow: '' };
    }
  };

  const formatStatusForDisplay = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500 overflow-x-hidden w-full max-w-full" style={{ fontFamily: 'Manrope, sans-serif', backgroundColor: 'var(--soft-ivory)' }}>
      <DashboardLoader isVisible={loading} />

      {notification && (
        <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[200] px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 bg-white border-l-4 border-[#1E4D8C] animate-in slide-in-from-top-4 w-[90%] sm:w-auto max-w-sm">
          <CheckCircle2 className="text-[#1E4D8C] w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[11px] sm:text-sm font-bold text-gray-800">{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="font-semibold typography-display" style={{ color: 'var(--deep-charcoal)', fontSize: '24px', letterSpacing: '0.05em' }}>{t('booking.commandDeck') || 'Command Deck'}</h1>
          <p className="text-[10px] font-normal tracking-[0.2em] typography-label-light" style={{ color: '#666' }}>{t('booking.realtimeFlow') || 'Real-time flow of salon artistry'}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={handleResetFilters} className="p-1.5 sm:p-2 transition-colors flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase typography-label-light" style={{ color: '#666' }}>
            <RefreshCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">{t('booking.reset')}</span>
          </button>
          <button onClick={handleApplyFilters} className="text-white px-4 sm:px-6 rounded-2xl text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 hover:-translate-y-0.5 shadow-lg typography-label-light" style={{ height: '44px', background: 'linear-gradient(135deg, var(--deep-charcoal) 0%, var(--muted-gold) 100%)', boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)' }}>
            <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">{t('booking.applyFilters')}</span>
          </button>
        </div>
      </div>

      {/* --- CONDENSED SMART FILTER BAR --- */}
      <div className="p-4 space-y-4" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '1.5rem', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)' }}>
        {/* Single-line smart filter bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#666' }} />
            <input
              type="text"
              value={draftFilters.global_search}
              onChange={(e) => setDraftFilters({ ...draftFilters, global_search: e.target.value })}
              onKeyPress={handleKeyPress}
              placeholder={t('booking.searchPlaceholder')}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 rounded-2xl text-xs sm:text-sm font-semibold focus:ring-4 focus:ring-blue-50 transition-all outline-none typography-label-light"
              style={{ height: '44px', backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative min-w-[100px] sm:min-w-[140px]">
            <select
              value={draftFilters.status || 'ALL'}
              onChange={(e) => setDraftFilters({ ...draftFilters, status: e.target.value })}
              className="w-full px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold outline-none cursor-pointer focus:ring-4 focus:ring-blue-50 appearance-none transition-all typography-label-light"
              style={{ height: '44px', backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
            >
              <option value="ALL">{t('booking.allStatuses')}</option>
              {filterMeta?.statuses?.map(s => (
                <option key={s} value={s}>{formatStatusForDisplay(s)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: '#666' }} />
          </div>

          {/* Staff Dropdown */}
          <div className="relative min-w-[100px] sm:min-w-[140px]">
            <select
              value={draftFilters.staff_id || 'ALL'}
              onChange={(e) => setDraftFilters({ ...draftFilters, staff_id: e.target.value })}
              className="w-full px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-semibold outline-none cursor-pointer focus:ring-4 focus:ring-blue-50 appearance-none transition-all typography-label-light"
              style={{ height: '44px', backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
            >
              <option value="ALL">{t('booking.allStaff')}</option>
              {filterMeta?.staff?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: '#666' }} />
          </div>

          {/* Date Preset Dropdown */}
          <div className="relative min-w-[100px] sm:min-w-[140px]">
            <select
              value={draftFilters.date_preset}
              onChange={(e) => setDraftFilters({ ...draftFilters, date_preset: e.target.value, from_date: '', to_date: '', date: '' })}
              className="w-full px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-semibold outline-none cursor-pointer focus:ring-4 focus:ring-blue-50 appearance-none transition-all typography-label-light"
              style={{ height: '44px', backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
            >
              <option value="">{t('booking.noPreset')}</option>
              <option value="today">{t('booking.today')}</option>
              <option value="yesterday">{t('booking.yesterday')}</option>
              <option value="this_week">{t('booking.thisWeek')}</option>
              <option value="last_month">{t('booking.lastMonth')}</option>
            </select>
            <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: '#666' }} />
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 shadow-lg typography-label-light"
            style={{ height: '44px', backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
          >
            <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: 'var(--muted-gold)' }} />
            <span className="hidden sm:inline">{showAdvancedFilters ? (t('booking.less') || 'Less') : (t('booking.more') || 'More')}</span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: '#666', transform: showAdvancedFilters ? 'rotate(180deg)' : '', transition: 'transform 0.3s' }} />
          </button>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 animate-in slide-in-from-top-2 duration-300" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 typography-label-light" style={{ color: '#666' }}>{t('booking.dateRangeFrom')}</label>
              <input
                type="date"
                min={filterMeta?.date_range.min_date}
                max={filterMeta?.date_range.max_date}
                value={draftFilters.from_date}
                onChange={(e) => setDraftFilters({ ...draftFilters, from_date: e.target.value, date: '', date_preset: '' })}
                onKeyPress={handleKeyPress}
                className="w-full px-4 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50 typography-label-light"
                style={{ height: '44px', backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 typography-label-light" style={{ color: '#666' }}>{t('booking.dateRangeTo')}</label>
              <input
                type="date"
                min={filterMeta?.date_range.min_date}
                max={filterMeta?.date_range.max_date}
                value={draftFilters.to_date}
                onChange={(e) => setDraftFilters({ ...draftFilters, to_date: e.target.value, date: '', date_preset: '' })}
                onKeyPress={handleKeyPress}
                className="w-full px-4 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50 typography-label-light"
                style={{ height: '44px', backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 typography-label-light" style={{ color: '#666' }}>{t('booking.minPrice')}</label>
              <input type="number"
                min={filterMeta?.price_range?.min_price}
                max={filterMeta?.price_range?.max_price}
                value={draftFilters.min_price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  const minAllowed = filterMeta?.price_range?.min_price;
                  const maxAllowed = filterMeta?.price_range?.max_price;
                  
                  if (value < minAllowed) {
                    setPriceError({ ...priceError, min: t('validation.priceTooLow', { min: minAllowed }) });
                  } else if (value > maxAllowed) {
                    setPriceError({ ...priceError, min: t('validation.priceTooHigh', { max: maxAllowed }) });
                  } else {
                    setPriceError({ ...priceError, min: undefined });
                  }
                  
                  setDraftFilters({ ...draftFilters, min_price: e.target.value });
                }}
                onKeyPress={handleKeyPress}
                className="w-full px-4 rounded-2xl text-sm font-semibold outline-none typography-label-light"
                style={{ height: '44px', backgroundColor: 'var(--light-greige)', border: priceError.min ? '1px solid #ef4444' : '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }} />
              {priceError.min && <p className="text-[9px] font-bold text-red-500 ml-1">{priceError.min}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1 typography-label-light" style={{ color: '#666' }}>{t('booking.maxPrice')}</label>
              <input type="number"
                min={filterMeta?.price_range?.min_price}
                max={filterMeta?.price_range?.max_price}
                value={draftFilters.max_price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  const minAllowed = filterMeta?.price_range?.min_price;
                  const maxAllowed = filterMeta?.price_range?.max_price;
                  
                  if (value < minAllowed) {
                    setPriceError({ ...priceError, max: t('validation.priceTooLow', { min: minAllowed }) });
                  } else if (value > maxAllowed) {
                    setPriceError({ ...priceError, max: t('validation.priceTooHigh', { max: maxAllowed }) });
                  } else {
                    setPriceError({ ...priceError, max: undefined });
                  }
                  
                  setDraftFilters({ ...draftFilters, max_price: e.target.value });
                }}
                onKeyPress={handleKeyPress}
                className="w-full px-4 rounded-2xl text-sm font-semibold outline-none typography-label-light"
                style={{ height: '44px', backgroundColor: 'var(--light-greige)', border: priceError.max ? '1px solid #ef4444' : '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }} />
              {priceError.max && <p className="text-[9px] font-bold text-red-500 ml-1">{priceError.max}</p>}
            </div>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden min-h-[400px]" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '1.5rem', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--muted-gold)', borderTopColor: 'transparent' }}></div>
              <p className="text-sm font-bold typography-label-light" style={{ color: '#666' }}>{t('booking.loadingBookings')}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors typography-label-light" style={{ color: '#666', fontSize: '12px', letterSpacing: '0.05em' }} onClick={() => handleSort('booking_id')}>
                    {t('booking.bookingId')} {sortField === 'booking_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors typography-label-light" style={{ color: '#666', fontSize: '12px', letterSpacing: '0.05em' }} onClick={() => handleSort('slot.date')}>
                    {t('booking.schedule')} {sortField === 'slot.date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors typography-label-light" style={{ color: '#666', fontSize: '12px', letterSpacing: '0.05em' }} onClick={() => handleSort('userData.username')}>
                    {t('booking.customer')} {sortField === 'userData.username' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-center typography-label-light" style={{ color: '#666', fontSize: '12px', letterSpacing: '0.05em' }}>
                    {t('booking.customerNo')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors typography-label-light" style={{ color: '#666', fontSize: '12px', letterSpacing: '0.05em' }} onClick={() => handleSort('staffData.name')}>
                    {t('booking.specialist')} {sortField === 'staffData.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors typography-label-light" style={{ color: '#666', fontSize: '12px', letterSpacing: '0.05em' }} onClick={() => handleSort('serviceData.serviceName')}>
                    {t('booking.serviceRendered')} {sortField === 'serviceData.serviceName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-center cursor-pointer hover:text-gray-600 transition-colors typography-label-light" style={{ color: '#666', fontSize: '12px', letterSpacing: '0.05em' }} onClick={() => handleSort('status')}>
                    {t('booking.status')} {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
            <tbody>
              {sortedBookings.length > 0 ? (
                sortedBookings.map((row) => (
                  <tr key={row.id} onClick={() => { setSelectedBooking(row); setStatusNote(""); setIsModalOpen(true); }} className="group cursor-pointer hover:-translate-y-0.5 transition-all duration-300" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <p className="text-xs font-semibold typography-label-light" style={{ color: '#666' }}>{row.booking_id}</p>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold typography-display" style={{ color: 'var(--deep-charcoal)' }}>{row.slot.date}</p>
                        <p className="text-[11px] font-semibold flex items-center gap-1.5 typography-label-light" style={{ color: '#666' }}>
                          <span style={{ color: 'var(--muted-gold)' }}><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /></span> {row.slot.time}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {row.userData?.imageUrl ? (
                          <img
                            src={row.userData.imageUrl}
                            alt={row.userData.username}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-[8px] sm:text-[10px] uppercase" style={{ background: 'linear-gradient(135deg, var(--muted-gold) 0%, var(--deep-charcoal) 100%)', color: 'white' }}>
                            {row.userData?.username?.charAt(0)}
                          </div>
                        )}
                        <p className="text-sm font-semibold typography-display" style={{ color: 'var(--deep-charcoal)' }}>{row.userData?.username}</p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                      <p className="text-sm font-semibold typography-label-light" style={{ color: '#666' }}>{row.userData?.phone || '-'}</p>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {row.staffData?.imageUrl ? (
                          <img
                            src={row.staffData.imageUrl}
                            alt={row.staffData.name}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-[8px] sm:text-[10px] uppercase" style={{ background: 'linear-gradient(135deg, var(--muted-gold) 0%, var(--deep-charcoal) 100%)', color: 'white' }}>
                            {row.staffData?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <p className="text-sm font-semibold typography-display" style={{ color: 'var(--deep-charcoal)' }}>{row.staffData?.name || t('booking.notAssigned')}</p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <p className="text-sm font-semibold typography-display" style={{ color: 'var(--deep-charcoal)' }}>{row.serviceData?.serviceName}</p>
                      <p className="text-[11px] font-semibold mt-1 uppercase tracking-tighter typography-number" style={{ color: 'var(--muted-gold)' }}>₹{row.price}</p>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] font-semibold uppercase border ${getStatusColor(row.status).bg} ${getStatusColor(row.status).text} ${getStatusColor(row.status).border} ${getStatusColor(row.status).glow} ${getStatusColor(row.status).animate || ''} transition-all duration-300`}>
                          {formatStatusForDisplay(row.status)}
                        </span>
                        {row.isRescheduled && (
                          <span className="px-2 py-0.5 text-[8px] font-semibold uppercase rounded-full border typography-label-light" style={{ backgroundColor: 'var(--light-greige)', borderColor: 'var(--light-greige)', color: 'var(--muted-gold)' }}>
                            RESC
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-32 text-center italic font-semibold typography-label-light" style={{ color: '#666' }}>{t('booking.noBookingsFound')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {!loading && (
        <div className="flex items-center justify-between px-8 py-4" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '1.5rem', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)' }}>
          <p className="text-xs font-bold typography-label-light" style={{ color: '#666' }}>
            {t('booking.pageOf', { current: currentPage, total: totalPages })}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg"
              style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', boxShadow: 'var(--inset-shadow)' }}
            >
              <ChevronLeft size={16} style={{ color: '#666' }} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg"
              style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', boxShadow: 'var(--inset-shadow)' }}
            >
              <ChevronRight size={16} style={{ color: '#666' }} />
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL SLOW LOADER OVERLAY */}
      {showSlowLoader && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4 p-6 sm:p-8 rounded-3xl w-[85%] sm:w-auto max-w-sm" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)' }}>
            <RefreshCcw className="w-10 h-10 sm:w-12 sm:h-12 animate-spin" style={{ color: 'var(--muted-gold)' }} />
            <p className="text-xs sm:text-sm font-black uppercase tracking-widest typography-label-light" style={{ color: 'var(--deep-charcoal)' }}>Loading...</p>
          </div>
        </div>
      )}

      {/* OTP VERIFICATION MODAL - Dark Luxury Theme */}
      {isOtpModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-[95%] sm:w-full max-w-md mx-auto animate-in zoom-in duration-300 overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: '#1A1A1A', borderRadius: '2rem sm:rounded-[2rem]', boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(212, 175, 55, 0.1)' }}>
            {/* Header - Metallic Dark Gold */}
            <div className="p-5 sm:p-8 text-center relative" style={{ background: 'linear-gradient(135deg, #2A2520 0%, #3D3429 50%, #4A3F32 100%)', borderRadius: '2rem 2rem 0 0 sm:rounded-[2rem] sm:rounded-t-[2rem]', borderBottom: '1px solid rgba(212, 175, 55, 0.3)' }}>
              {/* Subtle metallic shine overlay */}
              <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, transparent 60%)', borderRadius: '2rem 2rem 0 0 sm:rounded-[2rem] sm:rounded-t-[2rem]' }} />
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center relative" style={{ background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', backdropFilter: 'blur(4px)' }}>
                <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: '#D4AF37' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-black typography-display relative" style={{ color: '#D4AF37', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Verify Customer</h3>
              <p className="text-[9px] sm:text-[10px] font-bold mt-2 uppercase tracking-[0.2em] typography-label-light relative" style={{ color: '#111111' }}>Complete Booking Confirmation</p>
            </div>

            <div className="p-5 sm:p-8 space-y-4 sm:space-y-6" style={{ background: '#1A1A1A' }}>
              {/* Customer Info Card - Lighter Dark Gray */}
              <div className="p-4 sm:p-5 rounded-2xl" style={{ backgroundColor: '#252525', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3 flex items-center gap-2 typography-label-light" style={{ color: '#8B7355' }}>
                  <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color: '#D4AF37' }} /> Customer
                </p>
                <p className="text-base sm:text-lg font-black typography-display" style={{ color: '#F5F5F5' }}>{selectedBooking.userData?.username}</p>
                <p className="text-[10px] sm:text-xs font-medium mt-1 typography-label-light" style={{ color: '#888' }}>
                  Booking ID: <span style={{ color: '#D4AF37', fontFamily: 'monospace', letterSpacing: '0.05em', fontSize: '10px sm:12px' }}>{selectedBooking.booking_id}</span>
                </p>
              </div>

              {/* Instructions - Dynamic based on channels */}
              <div className="text-center space-y-2">
                <p className="text-xs sm:text-sm font-bold typography-label-light" style={{ color: '#E8E8E8' }}>
                  {otpSent 
                    ? (() => {
                        const parts = [];
                        if (otpChannels.includes('sms') && maskedContacts[otpChannels.indexOf('sms')]) {
                          parts.push(`WhatsApp (${maskedContacts[otpChannels.indexOf('sms')]})`);
                        } else if (otpChannels.includes('sms')) {
                          parts.push('WhatsApp');
                        }
                        if (otpChannels.includes('email')) {
                          parts.push('Email');
                        }
                        return `OTP sent to ${parts.join(' and ')}`;
                      })()
                    : 'Requesting OTP...'}
                </p>
                <p className="text-xs font-medium typography-label-light" style={{ color: '#777' }}>
                  Customer must provide the OTP to complete this booking
                </p>
              </div>

              {/* Remove channel toggle since we send to both now */}

              {/* OTP Inputs - Dark Theme */}
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    disabled={otpLoading}
                    className="w-10 h-12 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl outline-none transition-all duration-200 disabled:opacity-40 typography-display"
                    style={{
                      backgroundColor: '#252525',
                      border: otpError 
                        ? '2px solid #C75B5B' 
                        : digit 
                          ? '2px solid #D4AF37' 
                          : '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#F5F5F5',
                      boxShadow: digit 
                        ? '0 0 20px rgba(212, 175, 55, 0.25), inset 0 2px 4px rgba(0,0,0,0.3)' 
                        : 'inset 0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  />
                ))}
              </div>

              {/* Error Message - Elegant Dark Crimson */}
              {otpError && (
                <div className="p-4 rounded-xl flex items-center justify-center gap-2" style={{ backgroundColor: '#4A1C1C', border: '1px solid rgba(199, 91, 91, 0.3)' }}>
                  <XCircle size={14} style={{ color: '#E57373', flexShrink: 0 }} />
                  <p className="text-xs font-bold typography-label-light" style={{ color: '#FFFFFF' }}>{otpError}</p>
                </div>
              )}

              {/* Action Buttons - Sleek Dark */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleVerifyOtpAndComplete}
                  disabled={otp.join('').length !== 6 || otpLoading}
                  className="w-full h-14 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 typography-label-light"
                  style={{ 
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B8960C 100%)', 
                    color: '#1A1A1A',
                    boxShadow: '0 4px 20px rgba(212, 175, 55, 0.35), 0 1px 0 rgba(255,255,255,0.15) inset',
                    textShadow: '0 1px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  {otpLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} strokeWidth={2.5} /> Verify & Complete Booking
                    </>
                  )}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={resetOtpModal}
                    disabled={otpLoading}
                    className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 disabled:opacity-40 hover:bg-white/5 typography-label-light"
                    style={{ backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#999' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestOtp}
                    disabled={otpLoading || resendTimer > 0}
                    className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 typography-label-light"
                    style={{ 
                      backgroundColor: resendTimer > 0 ? '#252525' : 'rgba(212, 175, 55, 0.1)', 
                      border: '1px solid rgba(212, 175, 55, 0.3)', 
                      color: resendTimer > 0 ? '#555' : '#D4AF37'
                    }}
                  >
                    <Send size={12} />
                    {otpLoading ? 'Sending OTP...' : resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL SIDE-DRAWER */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-end sm:justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full sm:max-w-lg max-h-[90vh] sm:max-h-[100vh] overflow-y-auto no-scrollbar floating-tile animate-in slide-in-from-right sm:slide-in-from-bottom duration-300 mr-0 sm:mr-4" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)' }}>
            <div className="relative h-48 flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--deep-charcoal) 0%, var(--muted-gold) 100%)' }}>
              {selectedBooking.serviceData?.imageUrl && (
                <img src={selectedBooking.serviceData.imageUrl} alt="service" className="w-full h-full object-cover opacity-40" />
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }} />
              <button onClick={() => { setIsModalOpen(false); setIsRescheduleMode(false); setIsCancelMode(false); setCancellationReason(""); }} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-all"><X size={20} /></button>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>{t('booking.bookingDetail')}</span>
                <h2 className="text-xl font-black text-white typography-display mt-2">{selectedBooking.serviceData?.serviceName}</h2>
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em] typography-label-light mt-1">{t('booking.bookingId')}: {selectedBooking.booking_id}</p>
              </div>
            </div>

            <div className="px-8 pb-10 pt-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl shadow-sm floating-tile" style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 typography-label-light" style={{ color: '#666' }}><Calendar size={14} style={{ color: 'var(--muted-gold)' }} /> {t('booking.schedule')}</p>
                  <p className="text-sm font-black typography-display" style={{ color: 'var(--deep-charcoal)' }}>{selectedBooking.slot.date}</p>
                  <p className="text-xs font-bold mt-1 typography-label-light" style={{ color: '#666' }}>{selectedBooking.slot.time}</p>
                </div>
                <div className="p-5 rounded-3xl shadow-sm floating-tile" style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 typography-label-light" style={{ color: '#666' }}><User size={14} style={{ color: 'var(--muted-gold)' }} /> {t('booking.customer')}</p>
                  <p className="text-sm font-black typography-display" style={{ color: 'var(--deep-charcoal)' }}>{selectedBooking.userData?.username}</p>
                  <p className="text-[10px] font-bold uppercase mt-1 typography-label-light" style={{ color: '#666' }}>{t('booking.price')}: ₹{selectedBooking.price}</p>
                </div>
              </div>

              {selectedBooking.isRescheduled && (
                <div className="p-5 rounded-3xl border floating-tile" style={{ backgroundColor: 'var(--light-greige)', borderColor: 'var(--light-greige)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 typography-label-light" style={{ color: 'var(--muted-gold)' }}>
                    <span className="px-2 py-0.5 text-[8px] font-black uppercase rounded-full border typography-label-light" style={{ backgroundColor: 'var(--light-greige)', borderColor: 'var(--light-greige)', color: 'var(--muted-gold)' }}>{t('booking.rescheduled')}</span>
                  </p>
                  {selectedBooking.previousSlot && (
                    <div className="mb-3">
                      <p className="text-[9px] font-bold typography-label-light" style={{ color: '#666' }}>{t('booking.original')}: {selectedBooking.previousSlot.date} at {selectedBooking.previousSlot.time}</p>
                    </div>
                  )}
                  {(selectedBooking.rescheduleReason || selectedBooking.modificationReason) && (
                    <div className="mb-2">
                      <p className="text-[9px] font-bold typography-label-light" style={{ color: '#666' }}>{t('booking.reason')}: {selectedBooking.rescheduleReason || selectedBooking.modificationReason}</p>
                    </div>
                  )}
                  {(selectedBooking.rescheduledAt || selectedBooking.modifiedAt) && (
                    <p className="text-[9px] font-bold typography-label-light" style={{ color: '#666' }}>{t('booking.modified')}: {new Date(selectedBooking.rescheduledAt || selectedBooking.modifiedAt || '').toLocaleString()}</p>
                  )}
                </div>
              )}

              {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && (
                <div className="space-y-2 animate-in slide-in-from-bottom-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 typography-label-light" style={{ color: '#666' }}>
                    <MessageSquare size={12} style={{ color: 'var(--muted-gold)' }} /> {t('booking.internalRemark')}
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder={t('booking.remarkPlaceholder')}
                    className="w-full p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-none h-24 typography-label-light"
                    style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
                  />
                </div>
              )}

              {isRescheduleMode && (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 p-4 rounded-2xl border floating-tile" style={{ backgroundColor: 'var(--light-greige)', borderColor: 'var(--light-greige)' }}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 typography-label-light" style={{ color: '#666' }}>{t('booking.newDate')}</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setRescheduleDate(e.target.value);
                        setRescheduleTime("");
                      }}
                      className="w-full h-12 px-4 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 typography-label-light"
                      style={{ backgroundColor: 'white', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
                    />
                  </div>
                  {rescheduleDate && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 typography-label-light" style={{ color: '#666' }}>{t('booking.availableTimeSlots')}</label>
                      {loadingSlots ? (
                        <div className="w-full h-12 px-4 rounded-2xl flex items-center justify-center text-sm typography-label-light" style={{ backgroundColor: 'white', border: '1px solid var(--light-greige)', color: '#666' }}>
                          {t('booking.loadingSlots')}
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot: any) => (
                            <button
                              key={slot.time}
                              onClick={() => setRescheduleTime(slot.time)}
                              disabled={slot.booked >= slot.capacity}
                              className={`h-12 px-4 rounded-2xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-lg typography-label-light ${
                                rescheduleTime === slot.time
                                  ? ''
                                  : slot.booked >= slot.capacity
                                  ? ''
                                  : ''
                              }`}
                              style={
                                rescheduleTime === slot.time
                                  ? { background: 'linear-gradient(135deg, var(--deep-charcoal) 0%, var(--muted-gold) 100%)', color: 'white', boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)' }
                                  : slot.booked >= slot.capacity
                                  ? { backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: '#666', boxShadow: 'var(--inset-shadow)' }
                                  : { backgroundColor: 'white', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }
                              }
                            >
                              {slot.time}
                              {slot.booked > 0 && <span className="text-[9px] ml-1">({slot.booked}/{slot.capacity})</span>}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-12 px-4 rounded-2xl flex items-center justify-center text-sm typography-label-light" style={{ backgroundColor: 'white', border: '1px solid var(--light-greige)', color: '#666' }}>
                          {t('booking.noSlotsAvailable')}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 typography-label-light" style={{ color: '#666' }}>{t('booking.reasonOptional')}</label>
                    <textarea
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      placeholder={t('booking.reasonPlaceholder')}
                      className="w-full p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-none h-20 typography-label-light"
                      style={{ backgroundColor: 'white', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
                    />
                  </div>
                </div>
              )}

              {selectedBooking.note && (
                <div className="p-4 rounded-2xl border floating-tile" style={{ backgroundColor: 'var(--light-greige)', borderColor: 'var(--light-greige)' }}>
                  <p className="text-[9px] font-black uppercase tracking-widest mb-1 typography-label-light" style={{ color: 'var(--muted-gold)' }}>{t('booking.lastRemark')}</p>
                  <p className="text-xs font-bold italic typography-label-light" style={{ color: '#666' }}>"{selectedBooking.note}"</p>
                </div>
              )}

              <div className="pt-4">
                {selectedBooking.status === 'PENDING' && (
                  <>
                    {!isRescheduleMode ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => updateBookingStatus(selectedBooking.id, 'CANCELLED')} className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 hover:-translate-y-0.5 shadow-lg typography-label-light" style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}>{t('booking.reject')}</button>
                        <button onClick={() => updateBookingStatus(selectedBooking.id, 'CONFIRMED')} disabled={isConfirming} className="h-14 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg typography-label-light" style={{ backgroundColor: '#000000', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
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
                        <button onClick={() => setIsRescheduleMode(false)} disabled={isRescheduling} className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg typography-label-light" style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}>{t('booking.cancel')}</button>
                        <button onClick={handleRescheduleBooking} disabled={!rescheduleDate || !rescheduleTime || isRescheduling} className="h-14 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg typography-label-light" style={{ backgroundColor: '#000000', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
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
                    <button onClick={() => setIsRescheduleMode(!isRescheduleMode)} disabled={isRescheduling} className="w-full mt-3 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg typography-label-light" style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}>
                      <RefreshCcw size={14} /> {isRescheduleMode ? t('booking.cancelReschedule') : t('booking.rescheduleBooking')}
                    </button>
                  </>
                )}

                {selectedBooking.status === 'CONFIRMED' && (
                  <>
                    {!isRescheduleMode && !isCancelMode ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setIsCancelMode(true)} className="h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 hover:-translate-y-0.5 shadow-lg typography-label-light flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}>
                          <X size={18} /> {t('booking.cancelBooking')}
                        </button>
                        <button onClick={() => { setIsOtpModalOpen(true); handleRequestOtp(); }} className="h-16 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5 shadow-lg typography-label-light" style={{ backgroundColor: '#000000', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
                          <CheckCircle size={18} /> {t('booking.markAsCompleted')}
                        </button>
                      </div>
                    ) : isCancelMode ? (
                      <div className="space-y-4 animate-in slide-in-from-bottom-2 p-4 rounded-2xl border floating-tile" style={{ backgroundColor: 'var(--light-greige)', borderColor: 'var(--light-greige)' }}>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest ml-1 typography-label-light" style={{ color: '#666' }}>{t('booking.cancellationReason')}</label>
                          <textarea
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            placeholder={t('booking.cancellationReasonPlaceholder')}
                            className="w-full p-4 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-none h-20 typography-label-light"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => { setIsCancelMode(false); setCancellationReason(""); }} className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg typography-label-light" style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}>Go back</button>
                          <button onClick={handleCancelBooking} className="h-14 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 shadow-lg typography-label-light" style={{ backgroundColor: '#000000', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
                            <X size={14} /> {t('booking.cancelBooking')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setIsRescheduleMode(false)} disabled={isRescheduling} className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg typography-label-light" style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}>{t('booking.cancel')}</button>
                        <button onClick={handleRescheduleBooking} disabled={!rescheduleDate || !rescheduleTime || isRescheduling} className="h-14 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg typography-label-light" style={{ backgroundColor: '#000000', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
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
                    <button onClick={() => { setIsRescheduleMode(true); setIsCancelMode(false); }} disabled={isRescheduling} className="w-full mt-3 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 shadow-lg typography-label-light" style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}>
                      <RefreshCcw size={14} /> {t('booking.rescheduleBooking')}
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