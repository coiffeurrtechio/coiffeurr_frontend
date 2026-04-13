import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  UserX,
  BarChart3,
  MoreHorizontal,
  Save
} from 'lucide-react';
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';
import { logoutUser } from '../../../../API/APIs';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../../../components/ui_components/Loader';

// --- Types ---
interface StaffMember {
  id: string;
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { apiSalonRequest, apiSalonPost } = useSalonApi();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<Map<string, AttendanceStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  useEffect(() => {
    fetchStaffAndAttendance();
  }, [selectedDate]);

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
      const staffRes = await apiSalonRequest<StaffMember[]>(`/staff/salon/${salonId}`);
      if (staffRes.data) {
        setStaffList(staffRes.data);
      }

      // Fetch attendance for selected date
      const dateStr = selectedDate.toISOString().split('T')[0];
      const attendanceRes = await apiSalonRequest<AttendanceRecord[]>(`/attendance/salon/${salonId}?date=${dateStr}`);
      
      // Convert to Map for easy lookup
      const attendanceMap = new Map<string, AttendanceStatus>();
      if (attendanceRes.data) {
        attendanceRes.data.forEach(record => {
          attendanceMap.set(record.staffId, record.status);
        });
      }
      setAttendance(attendanceMap);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      const records: AttendanceRecord[] = [];
      
      attendance.forEach((status, staffId) => {
        records.push({ staffId, date: dateStr, status });
      });

      await apiSalonPost(`/attendance/salon/${salonId}/bulk`, { records });
      
      // Show success feedback
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error("Save error:", error);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const markAttendance = (staffId: string, status: AttendanceStatus) => {
    setAttendance(prev => new Map(prev).set(staffId, status));
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
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
    const present = filtered.filter(s => attendance.get(s.id) === 'PRESENT').length;
    const absent = filtered.filter(s => attendance.get(s.id) === 'ABSENT').length;
    const late = filtered.filter(s => attendance.get(s.id) === 'LATE').length;
    const halfDay = filtered.filter(s => attendance.get(s.id) === 'HALF_DAY').length;
    const notMarked = filtered.filter(s => !attendance.get(s.id) || attendance.get(s.id) === 'NOT_MARKED').length;
    
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
      case 'PRESENT': return 'Present';
      case 'ABSENT': return 'Absent';
      case 'LATE': return 'Late';
      case 'HALF_DAY': return 'Half Day';
      default: return 'Not Marked';
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Loader isVisible={loading || saving} />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#1E4D8C] to-[#153a6b] rounded-xl shadow-lg shadow-blue-900/20">
              <UserCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Staff Attendance</h1>
              <p className="text-sm text-gray-500">Mark and manage daily staff attendance</p>
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
              <Calendar size={16} className="text-[#1E4D8C]" />
              <span className="text-sm font-bold text-gray-700 min-w-[180px] text-center">
                {formatDate(selectedDate)}
              </span>
              {isToday && (
                <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold uppercase rounded-full">
                  Today
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
            Save
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatPill 
          label="Present" 
          value={stats.present} 
          total={stats.total}
          color="green" 
          icon={CheckCircle}
        />
        <StatPill 
          label="Absent" 
          value={stats.absent} 
          total={stats.total}
          color="red" 
          icon={XCircle}
        />
        <StatPill 
          label="Late" 
          value={stats.late} 
          total={stats.total}
          color="orange" 
          icon={Clock}
        />
        <StatPill 
          label="Half Day" 
          value={stats.halfDay} 
          total={stats.total}
          color="yellow" 
          icon={AlertCircle}
        />
        <StatPill 
          label="Not Marked" 
          value={stats.notMarked} 
          total={stats.total}
          color="gray" 
          icon={MoreHorizontal}
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name or email..."
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
            <option value="ALL">All Roles</option>
            {getUniqueRoles().map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Users size={18} className="text-[#1E4D8C]" />
            Staff List
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
                  if (!newAttendance.has(staff.id) || newAttendance.get(staff.id) === 'NOT_MARKED') {
                    newAttendance.set(staff.id, 'PRESENT');
                  }
                });
                setAttendance(newAttendance);
              }}
              className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
            >
              Mark All Present
            </button>
            <button 
              onClick={() => setAttendance(new Map())}
              className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {getFilteredStaff().length > 0 ? (
            getFilteredStaff().map((staff) => {
              const currentStatus = attendance.get(staff.id) || 'NOT_MARKED';
              
              return (
                <div 
                  key={staff.id} 
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Staff Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-lg font-bold text-[#1E4D8C]">
                      {staff.images && staff.images.length > 0 ? (
                        <img 
                          src={staff.images[0]} 
                          alt={staff.name}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        staff.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">{staff.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">
                          {staff.role}
                        </span>
                        <span>•</span>
                        <span className="truncate">{staff.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'] as AttendanceStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => markAttendance(staff.id, status)}
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
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-gray-400">
              <Users size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium">No staff found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Summary Card */}
      <div className="bg-gradient-to-br from-[#1E4D8C] to-[#153a6b] rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/10 rounded-xl">
            <BarChart3 size={20} className="text-blue-200" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Attendance Summary</h3>
            <p className="text-xs text-blue-200">Quick overview for {formatDate(selectedDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard 
            label="Attendance Rate" 
            value={`${stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%`}
            subtext="Present staff"
            icon={UserCheck}
          />
          <SummaryCard 
            label="Absent Rate" 
            value={`${stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%`}
            subtext="Absent staff"
            icon={UserX}
          />
          <SummaryCard 
            label="Total Staff" 
            value={stats.total.toString()}
            subtext="Active employees"
            icon={Users}
          />
          <SummaryCard 
            label="Pending" 
            value={stats.notMarked.toString()}
            subtext="Not marked yet"
            icon={AlertCircle}
            highlight={stats.notMarked > 0}
          />
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-blue-200 uppercase tracking-wider font-bold">
              Today's Attendance Progress
            </span>
            <span className="text-sm font-bold">
              {stats.total - stats.notMarked} / {stats.total} marked
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-1000"
              style={{ width: `${stats.total > 0 ? ((stats.total - stats.notMarked) / stats.total) * 100 : 0}%` }}
            />
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
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100'
  };

  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={`p-4 rounded-2xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs opacity-70">({percentage}%)</span>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  highlight?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, subtext, icon: Icon, highlight }) => (
  <div className={`p-4 rounded-xl ${highlight ? 'bg-red-500/20' : 'bg-white/10'} backdrop-blur-sm`}>
    <div className="flex items-center gap-2 mb-2">
      <div className={`p-1.5 rounded-lg ${highlight ? 'bg-red-400/20 text-red-200' : 'bg-white/10 text-blue-200'}`}>
        <Icon size={14} />
      </div>
      <span className="text-xs text-blue-200 uppercase tracking-wider font-bold">{label}</span>
    </div>
    <p className="text-xl font-bold">{value}</p>
    <p className="text-xs text-blue-200">{subtext}</p>
  </div>
);

export default AttendancePage;
