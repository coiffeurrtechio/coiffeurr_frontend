import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  MoreHorizontal,
  Save,
  Download,
  Mail,
  X,
  Check
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';
import { logoutUser } from '../../../../API/APIs';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DashboardLoader } from '../../../../components/ui_components/DashboardLoader';
import Config from '../../../../configs/config';

// --- Types ---
interface StaffMember {
  staff_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  gender: string;
  images?: string[];
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'NOT_MARKED';

interface AttendanceRecord {
  staffId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

const AttendancePage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { apiSalonRequest, apiSalonPost, apiSalonPut } = useSalonApi();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<Map<string, AttendanceStatus>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [showPartialSaveDialog, setShowPartialSaveDialog] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isChangingDate, setIsChangingDate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('');
  const [monthlyAttendance, setMonthlyAttendance] = useState<Map<string, Map<string, AttendanceStatus>>>(new Map());
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  const [salonEmail, setSalonEmail] = useState('');
  const [useRegisteredEmail, setUseRegisteredEmail] = useState(false);
  const [emailAnimationPhase, setEmailAnimationPhase] = useState<'idle' | 'sending' | 'success'>('idle');

  useEffect(() => {
    fetchStaffAndAttendance();
    fetchSalonProfile();
  }, [selectedDate]);

  const fetchSalonProfile = async () => {
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
      if (!salonId) return;

      const salonRes = await apiSalonRequest<any>(`/salons/${salonId}`);
      if (salonRes.data) {
        const salonData = salonRes.data.salonData || salonRes.data;
        setSalonEmail(salonData.email || '');
      }
    } catch (error) {
      console.error("Fetch salon profile error:", error);
    }
  };

  useEffect(() => {
    if (viewMode === 'monthly' && staffList.length > 0) {
      fetchMonthlyAttendance();
    }
  }, [viewMode, currentMonth, staffList]);

  useEffect(() => {
    if (staffList.length > 0 && !selectedStaffFilter) {
      const sortedStaff = [...staffList].sort((a, b) => a.name.localeCompare(b.name));
      setSelectedStaffFilter(sortedStaff[0].staff_id);
    }
  }, [staffList]);

  const fetchStaffAndAttendance = async () => {
    setLoading(true);
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
      if (!salonId) {
        dispatch(logoutUser() as any);
        navigate("/login");
        return;
      }

      // Fetch staff list
      const staffRes = await apiSalonRequest<StaffMember[]>(`/salons/${salonId}/staff`);
      if (staffRes.data) {
        setStaffList(staffRes.data);
      }

      // Fetch attendance for selected date
      const dateStr = selectedDate.toISOString().split('T')[0];
      const attendanceRes = await apiSalonRequest<any>(`/attendance/salon/${salonId}?date=${dateStr}`);
      
      // Convert to Map for easy lookup
      const attendanceMap = new Map<string, AttendanceStatus>();
      if (attendanceRes.data?.staff) {
        attendanceRes.data.staff.forEach((staff: any) => {
          attendanceMap.set(staff.staffId || staff.staff_id, staff.attendance?.status || 'NOT_MARKED');
        });
      }
      console.log('Attendance map:', attendanceMap);
      console.log('Staff list:', staffRes.data);
      setAttendance(attendanceMap);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyAttendance = async () => {
    setLoading(true);
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
      if (!salonId) {
        dispatch(logoutUser() as any);
        navigate("/login");
        return;
      }

      // Get the first and last day of the current month
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const lastDay = new Date(year, month + 1, 0);

      const daysInMonth = lastDay.getDate();
      const monthlyMap = new Map<string, Map<string, AttendanceStatus>>();

      // Create array of promises for all days
      const promises = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dateStr = currentDate.toISOString().split('T')[0];

        promises.push(
          apiSalonRequest<any>(`/attendance/salon/${salonId}?date=${dateStr}`)
            .then(attendanceRes => {
              if (attendanceRes.data && attendanceRes.data.staff) {
                const dayMap = new Map<string, AttendanceStatus>();
                attendanceRes.data.staff.forEach((staff: any) => {
                  const staffId = staff.staffId || staff.staff_id;
                  dayMap.set(staffId, staff.attendance?.status || 'NOT_MARKED');
                });
                return { dateStr, dayMap };
              }
              return { dateStr, dayMap: new Map<string, AttendanceStatus>() };
            })
            .catch(error => {
              console.error(`Error fetching attendance for ${dateStr}:`, error);
              return { dateStr, dayMap: new Map<string, AttendanceStatus>() };
            })
        );
      }

      // Execute all requests in parallel
      const results = await Promise.all(promises);

      // Build the monthly map from results
      results.forEach(({ dateStr, dayMap }) => {
        monthlyMap.set(dateStr, dayMap);
      });

      setMonthlyAttendance(monthlyMap);
    } catch (error) {
      console.error("Fetch monthly attendance error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAttendance = async () => {
    // Check if any staff are still NOT_MARKED
    const unmarkedCount = staffList.filter(staff => !attendance.get(staff.staff_id) || attendance.get(staff.staff_id) === 'NOT_MARKED').length;

    if (unmarkedCount > 0) {
      setShowPartialSaveDialog(true);
      return;
    }

    // All staff are marked, proceed with save
    proceedWithSave();
  };

  const updateStaffPresence = async (staffId: string, isPresent: boolean) => {
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;

      await apiSalonPut(`/salons/${salonId}/staff/${staffId}`, {
        is_present: isPresent
      });
    } catch (error) {
      console.error("Error updating staff presence:", error);
    }
  };

  const proceedWithSave = async () => {
    setSaving(true);
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;

      const dateStr = selectedDate.toISOString().split('T')[0];
      const records: AttendanceRecord[] = [];

      attendance.forEach((status, staffId) => {
        if (status !== 'NOT_MARKED') {
          records.push({ staffId, date: dateStr, status });
        }
      });

      await apiSalonPost(`/attendance/salon/${salonId}/bulk-mark`, {
        date: dateStr,
        attendance_list: records
      });

      // Update staff is_present field based on attendance status
      attendance.forEach((status, staffId) => {
        const isPresent = status === 'PRESENT';
        updateStaffPresence(staffId, isPresent);
      });

      // Show success notification
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
      setShowPartialSaveDialog(false);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Save error:", error);
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const markAttendance = (staffId: string, status: AttendanceStatus) => {
    console.log('Marking attendance for staffId:', staffId, 'status:', status);
    console.log('Current attendance map before:', new Map(attendance));
    setAttendance(prev => {
      const currentStatus = prev.get(staffId);
      // If clicking the same status, toggle to NOT_MARKED
      if (currentStatus === status) {
        const newMap = new Map(prev);
        newMap.delete(staffId);
        setHasUnsavedChanges(true);
        return newMap;
      }
      setHasUnsavedChanges(true);
      return new Map(prev).set(staffId, status);
    });
    console.log('Current attendance map after:', new Map(attendance));
  };

  const handleMarkAllPresent = () => {
    const newAttendance = new Map(attendance);
    getFilteredStaff().forEach(staff => {
      if (!newAttendance.has(staff.staff_id) || newAttendance.get(staff.staff_id) === 'NOT_MARKED') {
        newAttendance.set(staff.staff_id, 'PRESENT');
      }
    });
    setAttendance(newAttendance);
    setHasUnsavedChanges(true);
  };

  const changeDate = (days: number) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
        setHasUnsavedChanges(false);
      });
      setShowUnsavedChangesDialog(true);
      return;
    }
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const changeMonth = (months: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + months);
    setCurrentMonth(newMonth);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getFilteredStaffForMonthly = () => {
    return staffList.filter(staff => staff.staff_id === selectedStaffFilter);
  };

  const handleSaveAndNavigate = async () => {
    await proceedWithSave();
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
    setShowUnsavedChangesDialog(false);
  };

  const handleDiscardAndNavigate = () => {
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
    setShowUnsavedChangesDialog(false);
    setHasUnsavedChanges(false);
  };

  const handleCancelNavigation = () => {
    setPendingNavigation(null);
    setShowUnsavedChangesDialog(false);
  };

  const handleDateChange = (dateStr: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => {
        setSelectedDate(new Date(dateStr));
        setHasUnsavedChanges(false);
      });
      setShowUnsavedChangesDialog(true);
      return;
    }
    setIsChangingDate(true);
    setSelectedDate(new Date(dateStr));
    setTimeout(() => setIsChangingDate(false), 300);
  };

  const handleViewModeChange = (mode: 'daily' | 'monthly') => {
    if (hasUnsavedChanges && mode !== viewMode) {
      setPendingNavigation(() => {
        setViewMode(mode);
        setHasUnsavedChanges(false);
      });
      setShowUnsavedChangesDialog(true);
      return;
    }
    setViewMode(mode);
  };

  const getFilteredStaff = () => {
    return staffList.filter(staff => {
      const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'ALL' || staff.role === filterRole;
      return matchesSearch && matchesRole;
    });
  };

  const getUniqueRoles = () => {
    const roles = new Set(staffList.map(s => s.role));
    return Array.from(roles);
  };

  const getAttendanceStats = () => {
    const filtered = getFilteredStaff();
    const present = filtered.filter(s => attendance.get(s.staff_id) === 'PRESENT').length;
    const absent = filtered.filter(s => attendance.get(s.staff_id) === 'ABSENT').length;
    const late = filtered.filter(s => attendance.get(s.staff_id) === 'LATE').length;
    const halfDay = filtered.filter(s => attendance.get(s.staff_id) === 'HALF_DAY').length;
    const notMarked = filtered.filter(s => !attendance.get(s.staff_id) || attendance.get(s.staff_id) === 'NOT_MARKED').length;

    return { present, absent, late, halfDay, notMarked, total: filtered.length };
  };

  const stats = getAttendanceStats();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-500 text-white border-green-500';
      case 'ABSENT': return 'bg-red-500 text-white border-red-500';
      case 'LATE': return 'bg-orange-500 text-white border-orange-500';
      case 'HALF_DAY': return 'bg-purple-500 text-white border-purple-500';
      default: return 'bg-gray-100 text-gray-400 border-gray-200';
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle size={16} />;
      case 'ABSENT': return <XCircle size={16} />;
      case 'LATE': return <Clock size={16} />;
      case 'HALF_DAY': return <AlertCircle size={16} />;
      default: return <MoreHorizontal size={16} />;
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT': return t('attendance.present');
      case 'ABSENT': return t('attendance.absent');
      case 'LATE': return t('attendance.late');
      case 'HALF_DAY': return t('attendance.halfDay');
      default: return t('attendance.notMarked');
    }
  };

  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
      if (!salonId) {
        dispatch(logoutUser() as any);
        navigate("/login");
        return;
      }

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const userData = localStorage.getItem("authState");
      const accessToken = JSON.parse(userData || '{}')?.user?.access_token;

      const response = await fetch(`${Config.API_Salon_owner}/attendance/salon/${salonId}/monthly/csv?year=${year}&month=${month}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${year}_${month.toString().padStart(2, '0')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setShowDownloadModal(false);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    const emailToSend = useRegisteredEmail ? salonEmail : emailInput;
    
    if (!emailToSend || !emailToSend.includes('@')) {
      alert(t('attendance.validEmail'));
      return;
    }

    setIsSendingEmail(true);
    setEmailAnimationPhase('sending');
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
      if (!salonId) {
        dispatch(logoutUser() as any);
        navigate("/login");
        return;
      }

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const userData = localStorage.getItem("authState");
      const accessToken = JSON.parse(userData || '{}')?.user?.access_token;

      const response = await fetch(`${Config.API_Salon_owner}/attendance/salon/${salonId}/monthly/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          year,
          month,
          email: emailToSend
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      // Show success animation
      setEmailAnimationPhase('success');
      
      // Auto-dismiss after success
      setTimeout(() => {
        setShowEmailSuccess(false);
        setShowDownloadModal(false);
        setEmailInput('');
        setUseRegisteredEmail(false);
        setEmailAnimationPhase('idle');
      }, 2000);
    } catch (error) {
      console.error("Email error:", error);
      setEmailAnimationPhase('idle');
      alert(t('attendance.emailFailed'));
    } finally {
      setIsSendingEmail(false);
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen p-6 animate-in fade-in duration-500" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--soft-ivory)' }}>
      <DashboardLoader isVisible={loading || saving} />

      {/* Success Notification - Screen Popup with Enhanced Animations */}
      {showSuccessNotification && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl px-8 py-6 border border-white/40 flex items-center gap-4 animate-in zoom-in-95 duration-300" style={{ animation: 'successPopup 0.5s ease-out' }}>
            <div className="relative">
              <div className="w-12 h-12 rounded-full flex items-center justify-center animate-bounce" style={{ backgroundColor: '#10b981', animation: 'pulse 2s infinite' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" style={{ color: '#FFFFFF', strokeDasharray: '30', strokeDashoffset: '30', animation: 'drawCheck 0.5s ease-out 0.1s forwards' }} />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: '#10b981', opacity: 0.3 }}></div>
            </div>
            <div>
              <span className="font-bold text-lg" style={{ color: '#2C2C2C', fontFamily: 'Inter, sans-serif', animation: 'slideIn 0.3s ease-out 0.2s both' }}>{t('attendance.attendanceSaved')}</span>
            </div>
          </div>
          <style>{`
            @keyframes successPopup {
              0% { transform: scale(0.8); opacity: 0; }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes drawCheck {
              0% { stroke-dashoffset: 30; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes slideIn {
              0% { transform: translateX(-10px); opacity: 0; }
              100% { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Error Notification */}
      {showErrorNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <XCircle size={20} />
            <span className="font-semibold">{t('attendance.saveFailed')}</span>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Dialog */}
      {showUnsavedChangesDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle size={24} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{t('attendance.unsavedChanges')}</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t('attendance.unsavedChangesMessage')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelNavigation}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDiscardAndNavigate}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                {t('attendance.discard')}
              </button>
              <button
                onClick={handleSaveAndNavigate}
                className="flex-1 px-4 py-3 bg-[#1E4D8C] text-white rounded-xl font-semibold hover:bg-[#153a6b] transition-colors"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partial Save Confirmation Dialog */}
      {showPartialSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle size={24} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{t('attendance.incompleteAttendance')}</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t('attendance.incompleteAttendanceMessage', { count: staffList.filter(staff => !attendance.get(staff.staff_id) || attendance.get(staff.staff_id) === 'NOT_MARKED').length })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPartialSaveDialog(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={proceedWithSave}
                className="flex-1 px-4 py-3 bg-[#1E4D8C] text-white rounded-xl font-semibold hover:bg-[#153a6b] transition-colors"
              >
                {t('attendance.savePartial')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[20px] flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-xl border border-white/30 rounded-[2.5rem] shadow-2xl max-w-md w-full mx-4 p-8" style={{ boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>{t('attendance.downloadAttendance')}</h3>
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setEmailInput('');
                  setShowEmailSuccess(false);
                  setEmailAnimationPhase('idle');
                }}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all hover:scale-105"
                style={{ boxShadow: "0 0 15px rgba(0,0,0,0.1)" }}
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {!showEmailSuccess ? (
              <>
                {/* Glassmorphism Card 1: Download CSV */}
                <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6 mb-6 shadow-lg" style={{ boxShadow: "rgba(0,0,0,0.05) 0 4px 16px" }}>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {t('attendance.downloadAttendanceMessage')}
                  </p>
                  <button
                    onClick={handleDownloadCSV}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold text-sm shadow-lg transition-all hover:scale-1.02 hover:shadow-[0_0_30px_rgba(26,26,26,0.4)] active:scale-0.98 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={20} />
                    {isDownloading ? t('attendance.downloading') : t('attendance.downloadCSV')}
                  </button>
                </div>

                {/* Elegant Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300/50"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-gray-500 font-semibold tracking-widest uppercase text-xs">{t('common.or')}</span>
                  </div>
                </div>

                {/* Glassmorphism Card 2: Send via Email */}
                <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6 shadow-lg" style={{ boxShadow: "rgba(0,0,0,0.05) 0 4px 16px" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Mail size={18} className="text-gray-500" />
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('attendance.sendViaEmail')}</label>
                  </div>
                  
                  {salonEmail && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-white/40 rounded-xl border border-white/30">
                      <span className="text-sm font-semibold text-gray-600">Use registered email</span>
                      <button
                        onClick={() => {
                          setUseRegisteredEmail(!useRegisteredEmail);
                          if (!useRegisteredEmail) {
                            setEmailInput(salonEmail);
                          } else {
                            setEmailInput('');
                          }
                        }}
                        className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                          useRegisteredEmail ? 'bg-[#D4AF37]' : 'bg-gray-300'
                        }`}
                        style={{ boxShadow: useRegisteredEmail ? "0 0 15px rgba(212, 175, 55, 0.4)" : "none" }}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                            useRegisteredEmail ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                  
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (useRegisteredEmail && e.target.value !== salonEmail) {
                        setUseRegisteredEmail(false);
                      }
                    }}
                    placeholder={t('attendance.enterEmailAddress')}
                    disabled={useRegisteredEmail}
                    className={`w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all duration-300 ${
                      useRegisteredEmail || !emailInput 
                        ? 'bg-white/30 border-white/40 text-gray-400 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed' 
                        : 'bg-white/70 border-white/50 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                    style={{ boxShadow: "var(--inset-shadow)" }}
                  />
                  
                  {/* Animated Send Button */}
                  <button
                    onClick={handleSendEmail}
                    disabled={isSendingEmail || (!emailInput && !useRegisteredEmail)}
                    className="w-full mt-4 h-12 flex items-center justify-center gap-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                    style={{ 
                      backgroundColor: emailAnimationPhase === 'idle' ? '#f3f4f6' : emailAnimationPhase === 'sending' ? '#1a1a1a' : '#10b981',
                      color: emailAnimationPhase === 'idle' ? '#374151' : '#ffffff',
                      boxShadow: emailAnimationPhase === 'idle' ? 'none' : emailAnimationPhase === 'sending' ? '0 0 20px rgba(26, 26, 26, 0.3)' : '0 0 20px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    {emailAnimationPhase === 'idle' && (
                      <>
                        <Mail size={18} />
                        <span>{t('attendance.sendEmail')}</span>
                      </>
                    )}
                    
                    {emailAnimationPhase === 'sending' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="100%" height="100%" viewBox="0 0 200 48" className="overflow-visible">
                          <defs>
                            <filter id="portalGlow">
                              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                              <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>
                          <circle cx="190" cy="24" r="8" fill="#D4AF37" filter="url(#portalGlow)" opacity="0.8">
                            <animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1s" repeatCount="indefinite" />
                          </circle>
                          <g>
                            <rect x="10" y="20" width="24" height="16" rx="2" fill="#D4AF37" />
                            <polygon points="34,28 44,24 34,20" fill="#D4AF37" />
                            <line x1="14" y1="24" x2="30" y2="24" stroke="#1a1a1a" strokeWidth="1.5" />
                            <animateMotion
                              path="M10,24 L180,24"
                              dur="1.5s"
                              repeatCount="indefinite"
                              calcMode="spline"
                              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
                            />
                          </g>
                        </svg>
                      </div>
                    )}
                    
                    {emailAnimationPhase === 'success' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-white" />
                        <span className="text-white">Sent!</span>
                      </div>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                  <CheckCircle size={32} className="text-emerald-600" />
                </div>
                <h4 className="text-lg font-black text-[#1a1a1a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{t('attendance.emailSent')}</h4>
                <p className="text-gray-600 text-sm">{t('attendance.emailSentMessage')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1 pb-4" style={{ borderBottom: '1px solid var(--ghost-row-line)' }}>
        <h1 className="font-semibold typography-display" style={{ color: 'var(--deep-charcoal)', fontSize: '24px', letterSpacing: '0.05em', fontFamily: 'Playfair Display, serif' }}>Floor Status</h1>
        <p className="text-sm font-normal tracking-[0.2em] typography-label-light" style={{ color: '#666' }}>Monitoring the rhythm of your elite crew</p>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-4 pb-4" style={{ borderBottom: '1px solid var(--ghost-row-line)' }}>
        <button
          onClick={() => handleViewModeChange('daily')}
          className={`px-6 py-3 text-sm font-semibold border-b-3 transition-all ${viewMode === 'daily' ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-gray-700'}`}
          style={{
            borderBottom: viewMode === 'daily' ? '3px solid #D4AF37' : '3px solid transparent',
            letterSpacing: '0.15em',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Daily Attendance
        </button>
        <button
          onClick={() => handleViewModeChange('monthly')}
          className={`px-6 py-3 text-sm font-semibold border-b-3 transition-all ${viewMode === 'monthly' ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-gray-700'}`}
          style={{
            borderBottom: viewMode === 'monthly' ? '3px solid #D4AF37' : '3px solid transparent',
            letterSpacing: '0.15em',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Monthly View
        </button>
      </div>

      {/* Date Scroller - Daily View Only */}
      {viewMode === 'daily' && (
        <div className="flex items-center justify-between gap-3 py-2 transition-opacity duration-300" style={{ opacity: isChangingDate ? 0.5 : 1 }}>
          <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => changeDate(-1)}
              className="p-1 rounded-full transition-all hover:bg-gray-100"
              style={{ color: '#2C2C2C' }}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() - 3 + i);
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <button
                    key={i}
                    onClick={() => handleDateChange(date.toISOString().split('T')[0])}
                    className="flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: isSelected ? '#D4AF37' : 'transparent',
                      border: isSelected ? '1.5px solid #D4AF37' : '1.5px solid #E8E4DE',
                      boxShadow: isSelected ? '0 2px 8px rgba(212, 175, 55, 0.3)' : 'none',
                      minWidth: '45px',
                      transform: isChangingDate ? 'scale(0.95)' : 'scale(1)'
                    }}
                  >
                    <span className="text-xs font-medium" style={{ 
                      color: isSelected ? '#FFFFFF' : '#999',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '8px',
                      letterSpacing: '0.05em'
                    }}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-base font-bold" style={{ 
                      color: isSelected ? '#FFFFFF' : '#2C2C2C',
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '14px'
                    }}>
                      {date.getDate()}
                    </span>
                    {isToday && (
                      <span className="text-xs font-medium" style={{ 
                        color: isSelected ? '#FFFFFF' : '#D4AF37',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '7px'
                      }}>
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => changeDate(1)}
              className="p-1 rounded-full transition-all hover:bg-gray-100"
              style={{ color: '#2C2C2C' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Action Buttons - Premium Action Chips */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleMarkAllPresent}
              disabled={loading || saving}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs transition-all active:scale-95 disabled:opacity-50 hover:bg-white/80"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                color: '#2C2C2C',
                border: '1px solid rgba(232, 228, 222, 0.8)',
                backdropFilter: 'blur(8px)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif'
              }}
              title="Mark All Present"
            >
              <UserCheck size={14} />
              Mark All
            </button>
            <button
              onClick={saveAttendance}
              disabled={loading || saving}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
              style={{
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                color: '#D4AF37',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif'
              }}
              title="Save Attendance"
            >
              <span className="relative z-10 flex items-center gap-1">
                <Check size={14} />
                Save
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Add shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div className="space-y-4">
      {/* Daily View Content */}
      {viewMode === 'daily' && (
        <div className="flex gap-4">
          {/* Main Content Area (100%) */}
          <div className="flex-1 space-y-4">

            {/* Attendance Grid - Ghost Row Table */}
            <div style={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E8E4DE',
              background: '#FFFFFF',
              overflow: 'hidden'
            }}>
            <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid #E8E4DE' }}>
              <h3 className="flex items-center gap-2" style={{ 
                fontFamily: 'Cinzel, serif', 
                fontSize: '16px', 
                color: '#2C2C2C', 
                letterSpacing: '0.1em', 
                fontWeight: '500' 
              }}>
                <Users size={18} style={{ color: '#D4AF37' }} />
                {t('attendance.staffList')}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: '#D4AF37', color: '#FFFFFF', letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif' }}>
                  {getFilteredStaff().length}
                </span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #E8E4DE' }}>
                    <th className="text-left" style={{ fontSize: '11px', color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', fontWeight: '600', padding: '16px' }}>{t('attendance.staff')}</th>
                    <th className="text-left" style={{ fontSize: '11px', color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', fontWeight: '600', padding: '16px' }}>{t('attendance.role')}</th>
                    <th className="text-left" style={{ fontSize: '11px', color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', fontWeight: '600', padding: '16px' }}>{t('attendance.email')}</th>
                    <th className="text-left" style={{ fontSize: '11px', color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', fontWeight: '600', padding: '16px' }}>{t('attendance.phone')}</th>
                    <th className="text-left" style={{ fontSize: '11px', color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', fontWeight: '600', padding: '16px' }}>Last Action</th>
                    <th className="text-center" style={{ fontSize: '11px', color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', fontWeight: '600', padding: '16px' }}>{t('attendance.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredStaff().length > 0 ? (
                    getFilteredStaff().map((staff) => {
                      const currentStatus = attendance.get(staff.staff_id) || 'NOT_MARKED';

                      return (
                        <tr key={staff.staff_id} className="transition-all duration-300 hover:scale-[1.01] hover:shadow-lg" style={{ height: '72px', borderBottom: '1px solid #F7F5F2' }}>
                          <td style={{ padding: '16px' }}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0" style={{ backgroundColor: 'var(--light-greige)', color: 'var(--deep-charcoal)', margin: '0', padding: '3px' }}>
                                {staff.images && staff.images.length > 0 ? (
                                  <img
                                    src={staff.images[0]}
                                    alt={staff.name}
                                    className="w-full h-full rounded-md object-cover"
                                    style={{ objectFit: 'cover', display: 'block' }}
                                  />
                                ) : (
                                  <span className="text-sm font-semibold" style={{ color: 'var(--deep-charcoal)' }}>
                                    {staff.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="typography-label" style={{ fontSize: '14px', color: 'var(--deep-charcoal)' }}>{staff.name}</span>
                            </div>
                          </td>
                          <td className="typography-label-light" style={{ fontSize: '14px', padding: '16px' }}>{staff.role}</td>
                          <td className="typography-label-light" style={{ fontSize: '14px', padding: '16px' }}>{staff.email}</td>
                          <td className="typography-label-light" style={{ fontSize: '14px', padding: '16px' }}>{staff.phone || '-'}</td>
                          <td className="typography-label-light" style={{ fontSize: '11px', padding: '16px', color: '#999', fontFamily: 'Inter, sans-serif' }}>
                            {currentStatus !== 'NOT_MARKED' ? (
                              <span style={{ color: '#D4AF37', fontWeight: '500' }}>
                                Check-in: {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </span>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div className="flex items-center justify-center">
                              <div className="flex items-center" style={{ backgroundColor: '#F7F5F2', border: '1px solid #E8E4DE', borderRadius: '8px', padding: '2px' }}>
                                {(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'] as AttendanceStatus[]).map((status, index) => {
                                  const isSelected = currentStatus === status;
                                  const statusColors: Record<string, { bg: string; icon: string; glow: string }> = {
                                    PRESENT: { bg: '#10b981', icon: '#FFFFFF', glow: 'rgba(16, 185, 129, 0.4)' },
                                    ABSENT: { bg: '#ef4444', icon: '#FFFFFF', glow: 'rgba(239, 68, 68, 0.4)' },
                                    LATE: { bg: '#f59e0b', icon: '#FFFFFF', glow: 'rgba(245, 158, 11, 0.4)' },
                                    HALF_DAY: { bg: '#8b5cf6', icon: '#FFFFFF', glow: 'rgba(139, 92, 246, 0.4)' }
                                  };
                                  const colors = statusColors[status];
                                  const isFirst = index === 0;
                                  const isLast = index === 3;
                                  return (
                                    <div key={`${staff.staff_id}-${status}`} className="relative group">
                                      <button
                                        onClick={() => markAttendance(staff.staff_id, status)}
                                        className="flex items-center justify-center p-1.5 transition-all duration-200"
                                        style={{
                                          backgroundColor: isSelected ? colors.bg : 'transparent',
                                          opacity: isSelected ? 1 : 0.4,
                                          borderRadius: isFirst ? '6px 0 0 6px' : isLast ? '0 6px 6px 0' : '0',
                                          marginLeft: isFirst ? '0' : '1px',
                                          boxShadow: isSelected ? `0 0 12px ${colors.glow}` : 'none'
                                        }}
                                      >
                                        {isSelected ? (
                                          <div style={{ color: colors.icon }}>
                                            {getStatusIcon(status)}
                                          </div>
                                        ) : (
                                          <div style={{ color: '#2C2C2C' }}>
                                            {getStatusIcon(status)}
                                          </div>
                                        )}
                                      </button>
                                      {/* Tooltip */}
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}>
                                        {getStatusLabel(status)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-400">
                        <Users size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="text-sm font-medium">{t('attendance.noStaffFound')}</p>
                        <p className="text-xs mt-1">{t('attendance.adjustSearchFilters')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Legend */}
          <div className="flex items-center justify-center gap-6 pt-4" style={{ borderTop: '1px solid #F7F5F2' }}>
            {(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'] as AttendanceStatus[]).map((status) => {
              const statusColors: Record<string, { bg: string; icon: string }> = {
                PRESENT: { bg: '#10b981', icon: '#FFFFFF' },
                ABSENT: { bg: '#ef4444', icon: '#FFFFFF' },
                LATE: { bg: '#f59e0b', icon: '#FFFFFF' },
                HALF_DAY: { bg: '#8b5cf6', icon: '#FFFFFF' }
              };
              const colors = statusColors[status];
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
                    <span style={{ color: colors.icon }}>
                      {getStatusIcon(status)}
                    </span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {getStatusLabel(status)}
                  </span>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}

      {/* Monthly View Content */}
      {viewMode === 'monthly' && (
        <>
          <MonthlyCalendarView
            currentMonth={currentMonth}
            monthlyAttendance={monthlyAttendance}
            staffList={staffList}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            getStatusLabel={getStatusLabel}
            changeMonth={changeMonth}
            selectedStaffFilter={selectedStaffFilter}
            setSelectedStaffFilter={setSelectedStaffFilter}
            fetchMonthlyAttendance={fetchMonthlyAttendance}
            setShowDownloadModal={setShowDownloadModal}
            formatMonthYear={formatMonthYear}
          />
        </>
      )}
      </div>
    </div>
  );
};

// --- Helper Components ---

interface MonthlyCalendarViewProps {
  currentMonth: Date;
  monthlyAttendance: Map<string, Map<string, AttendanceStatus>>;
  staffList: StaffMember[];
  getStatusColor: (status: AttendanceStatus) => string;
  getStatusIcon: (status: AttendanceStatus) => React.ReactNode;
  getStatusLabel: (status: AttendanceStatus) => string;
  changeMonth: (delta: number) => void;
  selectedStaffFilter: string;
  setSelectedStaffFilter: (value: string) => void;
  fetchMonthlyAttendance: () => void;
  setShowDownloadModal: (show: boolean) => void;
  formatMonthYear: (date: Date) => string;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  currentMonth,
  monthlyAttendance,
  staffList,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  changeMonth,
  selectedStaffFilter,
  setSelectedStaffFilter,
  fetchMonthlyAttendance,
  setShowDownloadModal,
  formatMonthYear
}) => {
  const { t } = useTranslation();
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = [t('attendance.sunday'), t('attendance.monday'), t('attendance.tuesday'), t('attendance.wednesday'), t('attendance.thursday'), t('attendance.friday'), t('attendance.saturday')];
  
  // Filter staff list to only show selected staff in calendar
  const filteredStaffList = staffList.filter(staff => staff.staff_id === selectedStaffFilter);

  return (
    <div style={{
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
      overflow: 'hidden'
    }}>
      <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid #E8E4DE' }}>
        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 rounded-full transition-all hover:bg-gray-100"
            style={{ color: '#2C2C2C' }}
          >
            <ChevronLeft size={16} />
          </button>
          <div className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#F7F5F2', border: '1px solid #E8E4DE' }}>
            <span className="font-bold" style={{ fontSize: '13px', color: '#2C2C2C', letterSpacing: '0.02em', fontFamily: 'Inter, sans-serif' }}>
              {formatMonthYear(currentMonth)}
            </span>
          </div>
          <button
            onClick={() => changeMonth(1)}
            className="p-1 rounded-full transition-all hover:bg-gray-100"
            style={{ color: '#2C2C2C' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Staff Filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} style={{ color: '#666' }} />
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer font-semibold" style={{ fontSize: '12px', backgroundColor: '#F7F5F2', border: '1px solid #E8E4DE', color: '#2C2C2C', letterSpacing: '0.01em', fontFamily: 'Inter, sans-serif' }}
          >
            {[...staffList].sort((a, b) => a.name.localeCompare(b.name)).map(staff => (
              <option key={staff.staff_id} value={staff.staff_id}>{staff.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchMonthlyAttendance}
          className="p-1.5 rounded-lg transition-all hover:bg-gray-50" style={{ backgroundColor: '#F7F5F2', border: '1px solid #E8E4DE' }}
        >
          <RefreshCw size={14} style={{ color: '#2C2C2C' }} />
        </button>

        <button
          onClick={() => setShowDownloadModal(true)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 ml-auto"
          style={{
            backgroundColor: '#D4AF37',
            color: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          <Download size={14} />
          {t('attendance.download')}
        </button>
      </div>

      <div className="overflow-x-auto p-5">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3">
          {/* Week Day Headers */}
          {weekDays.map((day) => (
            <div key={day} className="text-center typography-label py-3 font-bold" style={{ fontSize: '11px', color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-16"></div>;
            }

            const dateStr = day.toISOString().split('T')[0];
            const dayAttendance = monthlyAttendance.get(dateStr) || new Map();

            return (
              <div
                key={dateStr}
                className="rounded-lg p-2 min-h-[75px] hover:shadow-md transition-all" style={{ 
                  border: '1px solid var(--ghost-row-line)', 
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div className="typography-label mb-2 font-bold" style={{ fontSize: '13px', color: 'var(--deep-charcoal)', letterSpacing: '0.01em' }}>
                  {day.getDate()}
                </div>

                {/* Staff Attendance for this day */}
                <div className="space-y-0.5">
                  {filteredStaffList.map((staff) => {
                    const status = dayAttendance.get(staff.staff_id) || 'NOT_MARKED';
                    return (
                      <div
                        key={`${dateStr}-${staff.staff_id}`}
                        className={`flex items-center justify-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-medium ${getStatusColor(status)}`}
                        title={getStatusLabel(status)}
                      >
                        <span className="flex-shrink-0">
                          {getStatusIcon(status)}
                        </span>
                        <span>{getStatusLabel(status)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center">
            {(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'NOT_MARKED'] as AttendanceStatus[]).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${getStatusColor(status).split(' ')[0]}`}></div>
                <span className="text-xs text-gray-600">{getStatusLabel(status)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

interface StatPillProps {
  label: string;
  value: number;
  total: number;
  color: 'green' | 'red' | 'orange' | 'yellow' | 'gray';
  icon: React.ElementType;
}

const StatPill: React.FC<StatPillProps> = ({ label, value, total, color, icon: Icon }) => {
  const colorClasses: Record<string, {
    bg: string;
    iconBg: string;
    iconColor: string;
    labelColor: string;
    valueColor: string;
    accent: string;
  }> = {
    green: {
      bg: '#FFFFFF',
      iconBg: '#D4AF37',
      iconColor: '#FFFFFF',
      labelColor: '#666',
      valueColor: '#2C2C2C',
      accent: '#D4AF37'
    },
    red: {
      bg: '#FFFFFF',
      iconBg: '#D4AF37',
      iconColor: '#FFFFFF',
      labelColor: '#666',
      valueColor: '#2C2C2C',
      accent: '#D4AF37'
    },
    orange: {
      bg: '#FFFFFF',
      iconBg: '#D4AF37',
      iconColor: '#FFFFFF',
      labelColor: '#666',
      valueColor: '#2C2C2C',
      accent: '#D4AF37'
    },
    yellow: {
      bg: '#FFFFFF',
      iconBg: '#D4AF37',
      iconColor: '#FFFFFF',
      labelColor: '#666',
      valueColor: '#2C2C2C',
      accent: '#D4AF37'
    },
    gray: {
      bg: '#FFFFFF',
      iconBg: '#D4AF37',
      iconColor: '#FFFFFF',
      labelColor: '#666',
      valueColor: '#2C2C2C',
      accent: '#D4AF37'
    }
  };

  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const styles = colorClasses[color];
  const circumference = 2 * Math.PI * 16; // radius = 16
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{
      backgroundColor: styles.bg,
      borderRadius: '10px',
      padding: '8px',
      boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
      border: '1px solid #E8E4DE',
      position: 'relative'
    }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <svg width="36" height="36" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="#E8E4DE"
              strokeWidth="2.5"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke={styles.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ fontSize: '8px', color: styles.labelColor, letterSpacing: '0.05em', display: 'block' }}>
              {label}
            </span>
            <div className="flex items-baseline gap-1">
              <span style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.02em', color: styles.valueColor, fontFamily: 'Playfair Display, serif' }}>{value}</span>
              <span className="text-[10px] font-bold" style={{ letterSpacing: '-0.01em', color: '#999' }}>/ {total}</span>
              <span className="text-[10px] font-semibold" style={{ color: styles.accent }}>{percentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
