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
  X
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

  useEffect(() => {
    fetchStaffAndAttendance();
  }, [selectedDate]);

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
    setSelectedDate(new Date(dateStr));
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
      case 'HALF_DAY': return 'bg-yellow-500 text-white border-yellow-500';
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
    if (!emailInput || !emailInput.includes('@')) {
      alert(t('attendance.validEmail'));
      return;
    }

    setIsSendingEmail(true);
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
          email: emailInput
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setShowEmailSuccess(true);
      setTimeout(() => {
        setShowEmailSuccess(false);
        setShowDownloadModal(false);
        setEmailInput('');
      }, 2000);
    } catch (error) {
      console.error("Email error:", error);
      alert(t('attendance.emailFailed'));
    } finally {
      setIsSendingEmail(false);
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <DashboardLoader isVisible={loading || saving} />

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle size={20} />
            <span className="font-semibold">{t('attendance.attendanceSaved')}</span>
          </div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">{t('attendance.downloadAttendance')}</h3>
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setEmailInput('');
                  setShowEmailSuccess(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {!showEmailSuccess ? (
              <>
                <p className="text-gray-600 mb-6">
                  {t('attendance.downloadAttendanceMessage')}
                </p>

                <div className="space-y-4">
                  <button
                    onClick={handleDownloadCSV}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#1E4D8C] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-[#153a6b] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={20} />
                    {isDownloading ? t('attendance.downloading') : t('attendance.downloadCSV')}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">{t('common.or')}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail size={18} className="text-gray-500" />
                      <label className="text-sm font-semibold text-gray-700">{t('attendance.sendViaEmail')}</label>
                    </div>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder={t('attendance.enterEmailAddress')}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                    <button
                      onClick={handleSendEmail}
                      disabled={isSendingEmail || !emailInput}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Mail size={18} />
                      {isSendingEmail ? t('attendance.sending') : t('attendance.sendEmail')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">{t('attendance.emailSent')}</h4>
                <p className="text-gray-600">{t('attendance.emailSentMessage')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 pb-4">
        <button
          onClick={() => handleViewModeChange('daily')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${viewMode === 'daily' ? 'border-[#1E4D8C] text-[#1E4D8C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          {t('attendance.dailyAttendance')}
        </button>
        <button
          onClick={() => handleViewModeChange('monthly')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${viewMode === 'monthly' ? 'border-[#1E4D8C] text-[#1E4D8C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          {t('attendance.monthlyView')}
        </button>
      </div>

      {/* Header Section */}
      {viewMode === 'daily' && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#1E4D8C] to-[#153a6b] rounded-xl shadow-lg shadow-blue-900/20">
                <UserCheck size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{t('attendance.title')}</h1>
                <p className="text-sm text-gray-500">{t('attendance.subtitle')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Navigator */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 hover:bg-gray-50 rounded-l-xl transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <div className="px-4 py-2 flex items-center gap-2 border-x border-gray-100">
                <span className="text-sm font-bold text-gray-700 min-w-[180px] text-center">
                  {formatDate(selectedDate)}
                </span>
                {isToday && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold uppercase rounded-full">
                    {t('common.today')}
                  </span>
                )}
              </div>
              <button
                onClick={() => changeDate(1)}
                className="p-2 hover:bg-gray-50 rounded-r-xl transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Date Picker */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={fetchStaffAndAttendance}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw size={18} className="text-gray-600" />
            </button>

            <button
              onClick={saveAttendance}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E4D8C] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-[#153a6b] transition-all active:scale-95 disabled:opacity-50"
            >
              <Save size={18} />
              {t('common.save')}
            </button>
          </div>
        </div>
      )}

      {/* Monthly View Header */}
      {viewMode === 'monthly' && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{t('attendance.monthlyAttendance')}</h1>
            <p className="text-sm text-gray-500">{t('attendance.monthlySubtitle')}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Month Navigator */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-gray-50 rounded-l-xl transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <div className="px-4 py-2 flex items-center gap-2 border-x border-gray-100">
                <span className="text-sm font-bold text-gray-700 min-w-[180px] text-center">
                  {formatMonthYear(currentMonth)}
                </span>
              </div>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-gray-50 rounded-r-xl transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>

            <button
              onClick={fetchMonthlyAttendance}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw size={18} className="text-gray-600" />
            </button>

            <button
              onClick={() => setShowDownloadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E4D8C] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-[#153a6b] transition-all active:scale-95"
            >
              <Download size={18} />
              {t('attendance.downloadMonthlyAttendance')}
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search - Daily View */}
      {viewMode === 'daily' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('attendance.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 shadow-sm cursor-pointer"
            >
              <option value="ALL">{t('attendance.allRoles')}</option>
              {getUniqueRoles().map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Staff Filter - Monthly View */}
      {viewMode === 'monthly' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 shadow-sm cursor-pointer"
            >
              {[...staffList].sort((a, b) => a.name.localeCompare(b.name)).map(staff => (
                <option key={staff.staff_id} value={staff.staff_id}>{staff.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Daily View Content */}
      {viewMode === 'daily' && (
        <>
          {/* Stats Overview - Inside Daily Attendance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            <StatPill
              label={t('attendance.present')}
              value={stats.present}
              total={stats.total}
              color="green"
              icon={CheckCircle}
            />
            <StatPill
              label={t('attendance.absent')}
              value={stats.absent}
              total={stats.total}
              color="red"
              icon={XCircle}
            />
            <StatPill
              label={t('attendance.late')}
              value={stats.late}
              total={stats.total}
              color="orange"
              icon={Clock}
            />
            <StatPill
              label={t('attendance.halfDay')}
              value={stats.halfDay}
              total={stats.total}
              color="yellow"
              icon={AlertCircle}
            />
            <StatPill
              label={t('attendance.notMarked')}
              value={stats.notMarked}
              total={stats.total}
              color="gray"
              icon={MoreHorizontal}
            />
          </div>

          {/* Attendance Grid */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users size={18} className="text-[#1E4D8C]" />
                {t('attendance.staffList')}
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                  {getFilteredStaff().length}
                </span>
              </h3>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newAttendance = new Map(attendance);
                    getFilteredStaff().forEach(staff => {
                      if (!newAttendance.has(staff.staff_id) || newAttendance.get(staff.staff_id) === 'NOT_MARKED') {
                        newAttendance.set(staff.staff_id, 'PRESENT');
                      }
                    });
                    setAttendance(newAttendance);
                    setHasUnsavedChanges(true);
                  }}
                  className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                >
                  {t('attendance.markAllPresent')}
                </button>
                <button
                  onClick={() => {
                    setAttendance(new Map());
                    setHasUnsavedChanges(true);
                  }}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  {t('attendance.clearAll')}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">{t('attendance.staff')}</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">{t('attendance.role')}</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">{t('attendance.email')}</th>
                    <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">{t('attendance.phone')}</th>
                    <th className="text-center p-4 text-xs font-bold text-gray-600 uppercase tracking-wider">{t('attendance.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {getFilteredStaff().length > 0 ? (
                    getFilteredStaff().map((staff) => {
                      const currentStatus = attendance.get(staff.staff_id) || 'NOT_MARKED';

                      return (
                        <tr key={staff.staff_id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-sm font-bold text-[#1E4D8C] flex-shrink-0">
                                {staff.images && staff.images.length > 0 ? (
                                  <img
                                    src={staff.images[0]}
                                    alt={staff.name}
                                    className="w-full h-full rounded-lg object-cover"
                                  />
                                ) : (
                                  staff.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                                )}
                              </div>
                              <span className="font-bold text-gray-800 text-sm">{staff.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600">{staff.role}</td>
                          <td className="p-4 text-sm text-gray-600">{staff.email}</td>
                          <td className="p-4 text-sm text-gray-600">{staff.phone || '-'}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                              {(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'] as AttendanceStatus[]).map((status) => (
                                <button
                                  key={`${staff.staff_id}-${status}`}
                                  onClick={() => markAttendance(staff.staff_id, status)}
                                  className={`
                                    flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all
                                    ${currentStatus === status
                                      ? getStatusColor(status)
                                      : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                                    }
                                  `}
                                >
                                  {getStatusIcon(status)}
                                  {getStatusLabel(status)}
                                </button>
                              ))}
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
        </>
      )}

      {/* Monthly View Content */}
      {viewMode === 'monthly' && (
        <MonthlyCalendarView
          currentMonth={currentMonth}
          monthlyAttendance={monthlyAttendance}
          staffList={getFilteredStaffForMonthly()}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          getStatusLabel={getStatusLabel}
        />
      )}
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
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  currentMonth,
  monthlyAttendance,
  staffList,
  getStatusColor,
  getStatusIcon,
  getStatusLabel
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Calendar size={18} className="text-[#1E4D8C]" />
          <h3>{t('attendance.attendanceCalendar')}</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
            {staffList.length} {staffList.length === 1 ? t('attendance.staff') : t('attendance.staffMembers')}
          </span>
        </h3>
      </div>

      <div className="p-6">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Week Day Headers */}
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase py-2">
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
                className="border border-gray-200 rounded-lg p-1.5 min-h-[70px] bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="text-xs font-bold text-gray-700 mb-1">
                  {day.getDate()}
                </div>

                {/* Staff Attendance for this day */}
                <div className="space-y-0.5">
                  {staffList.map((staff) => {
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
  const colorClasses = {
    green: {
      bg: 'bg-white',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      labelColor: 'text-gray-600',
      valueColor: 'text-gray-900',
      accent: 'text-green-600'
    },
    red: {
      bg: 'bg-white',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      labelColor: 'text-gray-600',
      valueColor: 'text-gray-900',
      accent: 'text-red-600'
    },
    orange: {
      bg: 'bg-white',
      border: 'border-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      labelColor: 'text-gray-600',
      valueColor: 'text-gray-900',
      accent: 'text-orange-600'
    },
    yellow: {
      bg: 'bg-white',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      labelColor: 'text-gray-600',
      valueColor: 'text-gray-900',
      accent: 'text-yellow-600'
    },
    gray: {
      bg: 'bg-white',
      border: 'border-gray-200',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      labelColor: 'text-gray-600',
      valueColor: 'text-gray-900',
      accent: 'text-gray-600'
    }
  };

  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const styles = colorClasses[color];

  return (
    <div className={`${styles.bg} rounded-xl border ${styles.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${styles.iconBg}`}>
            <Icon size={18} className={styles.iconColor} />
          </div>
          <span className={`text-xs font-semibold uppercase tracking-wider ${styles.labelColor}`}>
            {label}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className={`text-3xl font-bold ${styles.valueColor}`}>{value}</span>
            <span className={`text-sm font-medium ${styles.accent} ml-1`}>/{total}</span>
          </div>
          <div className={`text-sm font-semibold ${styles.accent}`}>
            {percentage}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
