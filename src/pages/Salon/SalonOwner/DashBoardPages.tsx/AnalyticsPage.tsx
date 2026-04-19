import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  Users,
  ShoppingBag,
  IndianRupee,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  RefreshCw,
  Star,
  Activity,
  Target,
  Zap,
  Calendar,
  UserCheck,
  AlertCircle,
  CalendarDays,
  Users2,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';
import { logoutUser } from '../../../../API/APIs';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DashboardLoader } from '../../../../components/ui_components/DashboardLoader';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';

// --- Types ---
type TimeRange = 'TODAY' | '7DAYS' | '30DAYS' | 'CUSTOM';

interface DashboardAnalytics {
  salonId: string;
  todayBookings: number;
  todayIncome: number;
  totalBookings: number;
  monthlyIncome: number;
  pendingCount: number;
  confirmedCount: number;
  cancelledCount: number;
  completedCount: number;
  dateRange: { start: string; end: string };
}

interface ServiceAnalytics {
  salonId: string;
  totalBookings: number;
  services: ServiceData[];
  dateRange: { start: string; end: string };
}

interface ServiceData {
  serviceId: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  revenue: number;
  bookingRatio: number;
}

interface CustomerAnalytics {
  salonId: string;
  dateRange: { start: string; end: string };
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  retentionRate: number;
  topCustomers: TopCustomer[];
  bookingFrequencyDistribution: { [key: string]: number };
}

interface TopCustomer {
  userId: string;
  name: string;
  totalBookings: number;
  totalSpent: number;
  firstBooking: string;
  lastBooking: string;
}

interface StaffProductivity {
  salonId: string;
  dateRange: { start: string; end: string };
  salonAverages: {
    utilizationRate: number;
    conversionRate: number;
    servicesPerDay: number;
  };
  staffCount: number;
  staffData: StaffData[];
}

interface StaffData {
  staffId: string;
  name: string;
  role: string;
  metrics: {
    totalBookings: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    pending: number;
  };
  utilization: {
    availableSlots: number;
    bookedSlots: number;
    utilizationRate: number;
  };
  productivity: {
    revenueGenerated: number;
    conversionRate: number;
    servicesPerDay: number;
    averageServiceDuration: number;
    uniqueCustomers: number;
    busiestDay: { date: string; bookings: number } | null;
  };
  quality: {
    averageRating: number;
    totalReviews: number;
  };
}

const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { apiSalonRequest } = useSalonApi();
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7DAYS');
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'customers' | 'staff'>('overview');
  const [showTodayIncome, setShowTodayIncome] = useState(false);
  const [showMonthlyIncome, setShowMonthlyIncome] = useState(false);
  
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [serviceData, setServiceData] = useState<ServiceAnalytics | null>(null);
  const [customerData, setCustomerData] = useState<CustomerAnalytics | null>(null);
  const [staffProductivityData, setStaffProductivityData] = useState<StaffProductivity | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeRange]);

  const getDateRange = () => {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    let startDate: string;

    switch (timeRange) {
      case 'TODAY':
        startDate = endDate;
        break;
      case '7DAYS':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        startDate = sevenDaysAgo.toISOString().split('T')[0];
        break;
      case '30DAYS':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
        break;
      default:
        const defaultDaysAgo = new Date(today);
        defaultDaysAgo.setDate(defaultDaysAgo.getDate() - 6);
        startDate = defaultDaysAgo.toISOString().split('T')[0];
    }

    return { startDate, endDate };
  };

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
      
      if (!salonId) {
        dispatch(logoutUser() as any);
        navigate("/login");
        return;
      }

      const { startDate, endDate } = getDateRange();

      // Fetch all analytics data in parallel
      const [
        dashboardRes,
        serviceRes,
        customerRes,
        staffRes
      ] = await Promise.all([
        apiSalonRequest<DashboardAnalytics>(`/analytics/salon/${salonId}/dashboard?start_date=${startDate}&end_date=${endDate}`),
        apiSalonRequest<ServiceAnalytics>(`/analytics/salon/${salonId}/services?start_date=${startDate}&end_date=${endDate}`),
        apiSalonRequest<CustomerAnalytics>(`/analytics/salon/${salonId}/customers?start_date=${startDate}&end_date=${endDate}`),
        apiSalonRequest<StaffProductivity>(`/analytics/salon/${salonId}/staff-productivity?start_date=${startDate}&end_date=${endDate}`)
      ]);

      if (dashboardRes.data) setDashboardData(dashboardRes.data);
      if (serviceRes.data) setServiceData(serviceRes.data);
      if (customerRes.data) setCustomerData(customerRes.data);
      if (staffRes.data) setStaffProductivityData(staffRes.data);

    } catch (err: any) {
      console.error("Fetch analytics error:", err);
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const formatRevenue = (amount: number, isVisible: boolean) => {
    if (isVisible) {
      return formatCurrency(amount);
    }
    return '₹***';
  };

  const truncateLabel = (label: string) => {
    if (!label) return '';
    return label.length > 15 ? `${label.substring(0, 12)}...` : label;
  };

  const COLORS = ['#1E4D8C', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <DashboardLoader isVisible={loading} />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{t('analytics.title')}</h1>
            <span className="px-3 py-1 bg-[#1E4D8C]/10 text-[#1E4D8C] text-xs font-bold rounded-full">{t('analytics.salonOwner')}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{t('analytics.trackPerformance')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {[
              { id: 'TODAY' as const, label: t('analytics.today') },
              { id: '7DAYS' as const, label: '7 Days' },
              { id: '30DAYS' as const, label: '30 Days' },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                  timeRange === range.id 
                    ? 'bg-white text-[#1E4D8C] shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchAllAnalytics()}
            className="p-2 bg-[#1E4D8C] text-white rounded-lg hover:bg-[#153a6b] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {[
            { id: 'overview' as const, label: t('analytics.overview'), icon: BarChart3 },
            { id: 'services' as const, label: t('analytics.services'), icon: Star },
            { id: 'customers' as const, label: t('analytics.customers'), icon: Users },
            { id: 'staff' as const, label: t('analytics.staff'), icon: Users2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#1E4D8C] text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="space-y-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t('analytics.todayBookings')}
              value={dashboardData.todayBookings.toString()}
              icon={<ShoppingBag size={20} />}
              color="blue"
            />
            <StatCard
              label={t('analytics.todayIncome')}
              value={formatRevenue(dashboardData.todayIncome, showTodayIncome)}
              icon={<IndianRupee size={20} />}
              color="green"
              showEyeIcon={true}
              onEyeClick={() => setShowTodayIncome(!showTodayIncome)}
              isRevenueVisible={showTodayIncome}
            />
            <StatCard
              label={t('analytics.totalBookings')}
              value={dashboardData.totalBookings.toString()}
              icon={<ShoppingBag size={20} />}
              color="purple"
            />
            <StatCard
              label={t('analytics.monthlyIncome')}
              value={formatRevenue(dashboardData.monthlyIncome, showMonthlyIncome)}
              icon={<IndianRupee size={20} />}
              color="orange"
              showEyeIcon={true}
              onEyeClick={() => setShowMonthlyIncome(!showMonthlyIncome)}
              isRevenueVisible={showMonthlyIncome}
            />
          </div>

          {/* Status Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricPill
              label={t('analytics.confirmed')}
              value={dashboardData.confirmedCount}
              color="green"
              icon={CheckCircle}
            />
            <MetricPill
              label={t('analytics.completed')}
              value={dashboardData.completedCount}
              color="blue"
              icon={Zap}
            />
            <MetricPill
              label={t('analytics.pending')}
              value={dashboardData.pendingCount}
              color="orange"
              icon={Clock}
            />
            <MetricPill
              label={t('analytics.cancelled')}
              value={dashboardData.cancelledCount}
              color="red"
              icon={XCircle}
            />
          </div>

          {/* Booking Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <PieChart size={18} className="text-[#1E4D8C]" />
                {t('analytics.bookingStatusDistribution')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: t('analytics.confirmed'), value: dashboardData.confirmedCount },
                      { name: t('analytics.completed'), value: dashboardData.completedCount },
                      { name: t('analytics.pending'), value: dashboardData.pendingCount },
                      { name: t('analytics.cancelled'), value: dashboardData.cancelledCount },
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: t('analytics.confirmed'), value: dashboardData.confirmedCount },
                      { name: t('analytics.completed'), value: dashboardData.completedCount },
                      { name: t('analytics.pending'), value: dashboardData.pendingCount },
                      { name: t('analytics.cancelled'), value: dashboardData.cancelledCount },
                    ].filter(d => d.value > 0).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Insights */}
            <div className="bg-gradient-to-br from-[#1E4D8C] to-[#153a6b] rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Target size={20} className="text-blue-200" />
                {t('analytics.performanceInsights')}
              </h3>

              <div className="space-y-4">
                <InsightCard
                  icon={TrendingUp}
                  title={t('analytics.completionRate')}
                  value={`${dashboardData.totalBookings > 0 ? Math.round(((dashboardData.confirmedCount + dashboardData.completedCount) / dashboardData.totalBookings) * 100) : 0}%`}
                  subtext={t('analytics.successfulBookingsRatio')}
                />
                <InsightCard
                  icon={AlertCircle}
                  title={t('analytics.cancellationRate')}
                  value={`${dashboardData.totalBookings > 0 ? Math.round((dashboardData.cancelledCount / dashboardData.totalBookings) * 100) : 0}%`}
                  subtext={t('analytics.cancelledBookingsRatio')}
                />
                <InsightCard
                  icon={CalendarDays}
                  title={t('analytics.pendingActions')}
                  value={dashboardData.pendingCount.toString()}
                  subtext={t('analytics.bookingsAwaitingConfirmation')}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && serviceData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Services Bar Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Star size={18} className="text-[#1E4D8C]" />
                {t('analytics.topServicesByBookings')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceData.services.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="serviceName"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tickFormatter={truncateLabel}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [value, t('analytics.bookings')]}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                  <Bar dataKey="totalBookings" fill="#1E4D8C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Services Revenue Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <IndianRupee size={18} className="text-[#1E4D8C]" />
                {t('analytics.servicesRevenue')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceData.services.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="serviceName"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tickFormatter={truncateLabel}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value as number), t('analytics.revenue')]}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Services Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Building2 size={18} className="text-[#1E4D8C]" />
              {t('analytics.allServicesPerformance')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.service')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.bookings')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.revenue')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.confirmed')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.completed')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.cancelled')}</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceData.services.map((service) => (
                    <tr key={service.serviceId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{service.serviceName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{service.totalBookings}</td>
                      <td className="py-3 px-4 text-sm font-bold text-green-600">{formatCurrency(service.revenue)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{service.confirmedBookings}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{service.completedBookings}</td>
                      <td className="py-3 px-4 text-sm text-red-600">{service.cancelledBookings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && customerData && (
        <div className="space-y-6">
          {/* Customer Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t('analytics.totalCustomers')}
              value={customerData.totalCustomers.toString()}
              icon={<Users size={20} />}
              color="blue"
            />
            <StatCard
              label={t('analytics.newCustomers')}
              value={customerData.newCustomers.toString()}
              icon={<UserCheck size={20} />}
              color="green"
            />
            <StatCard
              label={t('analytics.returningCustomers')}
              value={customerData.returningCustomers.toString()}
              icon={<Users2 size={20} />}
              color="purple"
            />
            <StatCard
              label={t('analytics.retentionRate')}
              value={`${customerData.retentionRate}%`}
              icon={<TrendingUp size={20} />}
              color="orange"
            />
          </div>

          {/* Customer Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users size={18} className="text-[#1E4D8C]" />
                {t('analytics.customerDistribution')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: t('analytics.newCustomers'), value: customerData.newCustomers },
                      { name: t('analytics.returningCustomers'), value: customerData.returningCustomers },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#1E4D8C" />
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Booking Frequency */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Activity size={18} className="text-[#1E4D8C]" />
                {t('analytics.bookingFrequency')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(customerData.bookingFrequencyDistribution).map(([key, value]) => ({
                    name: key,
                    customers: value
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="customers" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Customers Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Star size={18} className="text-[#1E4D8C]" />
              {t('analytics.topCustomers')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.customer')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.totalBookings')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.totalSpent')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.firstBooking')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.lastBooking')}</th>
                  </tr>
                </thead>
                <tbody>
                  {customerData.topCustomers.map((customer) => (
                    <tr key={customer.userId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{customer.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{customer.totalBookings}</td>
                      <td className="py-3 px-4 text-sm font-bold text-green-600">{formatCurrency(customer.totalSpent)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{customer.firstBooking}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{customer.lastBooking}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && staffProductivityData && (
        <div className="space-y-6">
          {/* Staff Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t('analytics.totalStaff')}
              value={staffProductivityData.staffCount.toString()}
              icon={<Users2 size={20} />}
              color="blue"
            />
            <StatCard
              label={t('analytics.avgUtilization')}
              value={`${staffProductivityData.salonAverages.utilizationRate}%`}
              icon={<Activity size={20} />}
              color="green"
            />
            <StatCard
              label={t('analytics.avgConversion')}
              value={`${staffProductivityData.salonAverages.conversionRate}%`}
              icon={<Target size={20} />}
              color="purple"
            />
            <StatCard
              label={t('analytics.avgServicesPerDay')}
              value={staffProductivityData.salonAverages.servicesPerDay.toFixed(1)}
              icon={<Zap size={20} />}
              color="orange"
            />
          </div>

          {/* Staff Ranking Chart & Staff Occupancy Chart - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Ranking Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#1E4D8C]" />
                  {t('analytics.staffRankingByRevenue')}
                </h3>
                <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{t('analytics.topPerformersByMoneyEarned')}</p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={staffProductivityData.staffData
                    .sort((a, b) => b.productivity.revenueGenerated - a.productivity.revenueGenerated)
                    .slice(0, 10)}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tickFormatter={truncateLabel}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                  <Bar dataKey="productivity.revenueGenerated" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Staff Occupancy Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Activity size={18} className="text-[#1E4D8C]" />
                  {t('analytics.staffOccupancy')}
                </h3>
                <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{t('analytics.totalAppointmentsPerStaff')}</p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={staffProductivityData.staffData
                    .sort((a, b) => b.metrics.totalBookings - a.metrics.totalBookings)
                    .slice(0, 10)}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tickFormatter={truncateLabel}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [value, 'Bookings']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                  <Bar dataKey="metrics.totalBookings" fill="#1E4D8C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Staff Performance Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Users2 size={18} className="text-[#1E4D8C]" />
              {t('analytics.staffBookingsProductivity')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.rank')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.staff')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.role')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.totalBookings')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.completed')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.revenue')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.utilization')}</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('analytics.rating')}</th>
                  </tr>
                </thead>
                <tbody>
                  {staffProductivityData.staffData
                    .sort((a, b) => b.productivity.revenueGenerated - a.productivity.revenueGenerated)
                    .map((staff, index) => (
                    <tr key={staff.staffId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-bold text-gray-900">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{staff.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{staff.role}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{staff.metrics.totalBookings}</td>
                      <td className="py-3 px-4 text-sm text-green-600 font-bold">{staff.metrics.completed}</td>
                      <td className="py-3 px-4 text-sm font-bold text-green-600">{formatCurrency(staff.productivity.revenueGenerated)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{staff.utilization.utilizationRate}%</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{staff.quality.averageRating.toFixed(1)} ⭐</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper Components ---

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  showEyeIcon?: boolean;
  onEyeClick?: () => void;
  isRevenueVisible?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, showEyeIcon, onEyeClick, isRevenueVisible }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium mb-2">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
          {showEyeIcon && (
            <button
              onClick={onEyeClick}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title={isRevenueVisible ? "Hide Revenue" : "Show Revenue"}
            >
              {isRevenueVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ...

interface MetricPillProps {
  label: string;
  value: number;
  color: 'green' | 'blue' | 'orange' | 'red';
  icon: React.ElementType;
}

const MetricPill: React.FC<MetricPillProps> = ({ label, value, color, icon: Icon }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100'
  };

  return (
    <div className={`p-4 rounded-2xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
      </div>
    </div>
  );
};

interface InsightCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  subtext: string;
  highlight?: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, title, value, subtext }) => (
  <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
    <div className="p-2 rounded-lg bg-white/10 text-blue-200">
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <p className="text-xs text-blue-200 uppercase tracking-wider font-bold">{title}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
    <p className="text-xs text-blue-200 text-right max-w-[100px]">{subtext}</p>
  </div>
);

export default AnalyticsPage;
