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
  EyeOff,
  DollarSign,
  TrendingDown,
  Info
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
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  ReferenceLine
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
  image?: string;
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

// Helper function to process review data for the line chart
const processReviewData = (reviews: any[]) => {
  if (!reviews || reviews.length === 0) {
    return [];
  }

  // Group reviews by date
  const groupedByDate: { [key: string]: any[] } = {};
  
  reviews.forEach((review) => {
    if (review.createdAt) {
      const date = new Date(review.createdAt);
      const dateKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push({
        rating: review.rating,
        date: date
      });
    }
  });

  // Convert to array and sort by date
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(groupedByDate[a][0].date).getTime() - new Date(groupedByDate[b][0].date).getTime();
  });

  // Calculate average rating per day
  const processedData = sortedDates.map((dateKey) => {
    const dayReviews = groupedByDate[dateKey];
    const avgRating = dayReviews.reduce((sum, r) => sum + r.rating, 0) / dayReviews.length;
    
    // Determine sentiment based on rating
    let sentiment = "Good";
    if (avgRating >= 4.5) sentiment = "Excellent";
    else if (avgRating >= 4.0) sentiment = "Great";
    else if (avgRating >= 3.5) sentiment = "Good";
    else if (avgRating >= 3.0) sentiment = "Fair";
    else sentiment = "Poor";
    
    return {
      day: dateKey,
      rating: avgRating,
      volume: dayReviews.length,
      sentiment
    };
  });

  // Add dotColor property based on first rating comparison
  if (processedData.length > 0) {
    const firstRating = processedData[0].rating;
    processedData.forEach((item, index) => {
      if (index === 0) {
        item.dotColor = '#10b981'; // First point always green
      } else {
        item.dotColor = item.rating >= firstRating ? '#10b981' : '#ef4444'; // Green if >= first, red if < first
      }
    });
  }

  return processedData;
};

const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { apiSalonRequest } = useSalonApi();
  const [ratingData, setRatingData] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7DAYS');
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'customers' | 'staff'>('overview');
  const [showTodayIncome, setShowTodayIncome] = useState(false);
  const [showMonthlyIncome, setShowMonthlyIncome] = useState(false);
  const [reviewTimeRange, setReviewTimeRange] = useState<'2DAYS' | '1WEEK' | '1MONTH' | '1YEAR'>('1WEEK');
  
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [serviceData, setServiceData] = useState<ServiceAnalytics | null>(null);
  const [customerData, setCustomerData] = useState<CustomerAnalytics | null>(null);
  const [staffProductivityData, setStaffProductivityData] = useState<StaffProductivity | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeRange]);

  useEffect(() => {
    fetchReviews();
  }, [reviewTimeRange]);

  const fetchReviews = async () => {
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;
      
      if (!salonId) {
        return;
      }

      // Calculate date range based on selected filter
      const now = new Date();
      let startDate: string | null = null;
      
      switch (reviewTimeRange) {
        case '2DAYS':
          startDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case '1WEEK':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case '1MONTH':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case '1YEAR':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        default:
          break;
      }

      const endDate = now.toISOString().split('T')[0];
      
      let url = `/reviews/SALON/${salonId}?limit=500`;
      if (startDate) {
        url += `&start_date=${startDate}`;
      }
      if (endDate) {
        url += `&end_date=${endDate}`;
      }

      const reviewsRes = await apiSalonRequest<any[]>(url);
      if (reviewsRes.data) {
        setReviews(reviewsRes.data);
        setRatingData(processReviewData(reviewsRes.data));
      }
    } catch (err: any) {
      console.error("Fetch reviews error:", err);
    }
  };

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

  const formatCurrency = (amount: number) => `₹${Math.round(amount).toLocaleString()}`;

  const calculateRevenueLeakage = () => {
    if (!dashboardData) return 0;
    // Estimate average booking value from completed bookings
    const averageBookingValue = dashboardData.completedCount > 0 
      ? dashboardData.monthlyIncome / dashboardData.completedCount 
      : 500; // fallback estimate
    return Math.round(dashboardData.cancelledCount * averageBookingValue);
  };

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
    <div className="min-h-screen p-6 animate-in fade-in duration-500" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: 'var(--soft-ivory)' }}>
      <DashboardLoader isVisible={loading} />

      {/* Main Stage Container */}
      <div className="main-stage p-6 space-y-6">
        {/* Fixed Header Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--light-greige)' }}>
          <div>
            <h1 className="font-semibold" style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: 'var(--deep-charcoal)' }}>{t('analytics.title')}</h1>
            <p className="typography-label-light" style={{ fontSize: '14px' }}>{t('analytics.trackPerformance')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg p-1" style={{ 
              backgroundColor: 'var(--light-greige)',
              border: '1px solid var(--ghost-row-line)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
            }}>
              {[
                { id: 'TODAY' as const, label: t('analytics.today') },
                { id: '7DAYS' as const, label: '7 Days' },
                { id: '30DAYS' as const, label: '30 Days' },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`px-5 rounded-md text-xs font-bold transition-all ${
                    timeRange === range.id 
                      ? 'bg-white shadow-md' 
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                  style={{ 
                    color: timeRange === range.id ? 'var(--deep-charcoal)' : '#666',
                    height: '44px',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase'
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => fetchAllAnalytics()}
              className="rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--muted-gold)', 
                height: '44px', 
                width: '44px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--deep-charcoal)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)'
              }}
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
      <div className="flex items-center gap-4 pb-4" style={{ borderBottom: '1px solid var(--ghost-row-line)' }}>
        {[
          { id: 'overview' as const, label: t('analytics.overview'), icon: BarChart3 },
          { id: 'services' as const, label: t('analytics.services'), icon: Star },
          { id: 'customers' as const, label: t('analytics.customers'), icon: Users },
          { id: 'staff' as const, label: t('analytics.staff'), icon: Users2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-bold border-b-3 transition-all typography-label ${activeTab === tab.id ? 'text-[#1E4D8C]' : 'text-gray-500 hover:text-gray-700'}`}
            style={{
              borderBottom: activeTab === tab.id ? '3px solid #1E4D8C' : '3px solid transparent',
              letterSpacing: '0.03em',
              textTransform: 'uppercase'
            }}
          >
            <tab.icon size={16} className="inline mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="space-y-6 px-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t('analytics.todayBookings')}
              value={(dashboardData?.todayBookings ?? 0).toString()}
              icon={<ShoppingBag size={20} />}
              color="blue"
            />
            <StatCard
              label={t('analytics.todayIncome')}
              value={formatRevenue(dashboardData?.todayIncome ?? 0, showTodayIncome)}
              icon={<IndianRupee size={20} />}
              color="green"
              showEyeIcon={true}
              onEyeClick={() => setShowTodayIncome(!showTodayIncome)}
              isRevenueVisible={showTodayIncome}
              isRevenue={true}
            />
            <StatCard
              label={t('analytics.totalBookings')}
              value={(dashboardData?.totalBookings ?? 0).toString()}
              icon={<ShoppingBag size={20} />}
              color="purple"
            />
            <StatCard
              label={t('analytics.monthlyIncome')}
              value={formatRevenue(dashboardData?.monthlyIncome ?? 0, showMonthlyIncome)}
              icon={<IndianRupee size={20} />}
              color="orange"
              showEyeIcon={true}
              onEyeClick={() => setShowMonthlyIncome(!showMonthlyIncome)}
              isRevenueVisible={showMonthlyIncome}
              isRevenue={true}
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
            <div style={{
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
              padding: '24px'
            }}>
              <h3 className="typography-label mb-6 flex items-center gap-2" style={{ fontSize: '16px', color: '#D4AF37', letterSpacing: '0.03em', fontWeight: '700', fontFamily: 'Playfair Display, serif' }}>
                <PieChart size={18} style={{ color: '#D4AF37' }} />
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
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
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

            {/* Quick Insights with Actionable Insights */}
            <div className="rounded-2xl shadow-lg p-6 hover-lift" style={{
              background: 'linear-gradient(135deg, var(--luxury-charcoal) 0%, #2d2d2d 100%)',
              color: 'white'
            }}>
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <Target size={20} style={{ color: 'var(--luxury-gold)' }} />
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
                  subtext={`Lost approx ${formatCurrency(calculateRevenueLeakage())} this week.`}
                />
                <InsightCard
                  icon={CalendarDays}
                  title={t('analytics.pendingActions')}
                  value={(dashboardData.pendingCount ?? 0).toString()}
                  subtext={t('analytics.bookingsAwaitingConfirmation')}
                />
              </div>
            </div>
          </div>

          {/* Artisan Quality Index Card */}
          <div style={{
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            background: '#FFFFFF',
            padding: '24px',
            color: '#1a1a1a'
          }}>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="typography-label flex items-center gap-2" style={{ fontSize: '16px', color: '#D4AF37', letterSpacing: '0.03em', fontWeight: '700', fontFamily: 'Playfair Display, serif' }}>
                  <TrendingUp size={18} style={{ color: '#D4AF37' }} />
                  Salon Stars Tracker
                </h3>
              </div>
              
              {/* Time Range Filter */}
              <div className="flex items-center gap-2">
                {[
                  { id: '2DAYS' as const, label: '2 Days' },
                  { id: '1WEEK' as const, label: '1 Week' },
                  { id: '1MONTH' as const, label: '1 Month' },
                  { id: '1YEAR' as const, label: '1 Year' },
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setReviewTimeRange(range.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      reviewTimeRange === range.id 
                        ? 'bg-[#D4AF37] text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={{ letterSpacing: '0.02em' }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative" style={{ height: '256px', marginBottom: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingData}>
                  <defs>
                    <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="0" vertical={false} horizontal={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 10 }}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis 
                    domain={[1, 5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 10 }}
                    tickCount={5}
                  />
                  <ReferenceLine y={3} stroke="#D4AF37" strokeOpacity={0.2} strokeWidth={1} />
                  <ReferenceLine y={4} stroke="#D4AF37" strokeOpacity={0.3} strokeWidth={1} />
                  <ReferenceLine y={5} stroke="#D4AF37" strokeOpacity={0.4} strokeWidth={1} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '16px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                              <span style={{ fontWeight: '600' }}>{data.day}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Star size={14} style={{ color: '#D4AF37', fill: '#D4AF37' }} />
                              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a' }}>{data.rating.toFixed(1)}⭐</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                              <span style={{ fontWeight: '600' }}>Volume:</span> {data.volume} reviews
                            </div>
                            <div style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: 'rgba(212, 175, 55, 0.2)', borderRadius: '20px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#D4AF37' }}>{data.sentiment}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#1a1a1a" 
                    strokeWidth={3}
                    dot={true}
                    activeDot={{ r: 8, fill: '#1a1a1a', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && serviceData && (
        <div className="space-y-6 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Services Bar Chart */}
            <div style={{
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
              padding: '24px'
            }}>
              <h3 className="typography-label mb-6 flex items-center gap-2" style={{ fontSize: '16px', color: 'var(--deep-charcoal)', letterSpacing: '0.03em', fontWeight: '700', textTransform: 'uppercase' }}>
                <Star size={18} style={{ color: 'var(--muted-gold)' }} />
                {t('analytics.topServicesByBookings')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceData.services.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(212, 175, 55, 0.2)" />
                  <XAxis
                    dataKey="serviceName"
                    tick={{ fontSize: 12, fill: '#666', fontWeight: '600' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tickFormatter={truncateLabel}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#666', fontWeight: '600' }} />
                  <Tooltip
                    formatter={(value) => [value, t('analytics.bookings')]}
                    contentStyle={{ backgroundColor: 'var(--luxury-white-glass)', border: '1px solid var(--luxury-gold-muted)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                  />
                  <Bar dataKey="totalBookings" fill="#1E4D8C" radius={[6, 6, 0, 0]} style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Services Revenue Chart */}
            <div style={{
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
              padding: '24px'
            }}>
              <h3 className="typography-label mb-6 flex items-center gap-2" style={{ fontSize: '16px', color: 'var(--deep-charcoal)', letterSpacing: '0.03em', fontWeight: '700', textTransform: 'uppercase' }}>
                <IndianRupee size={18} style={{ color: 'var(--muted-gold)' }} />
                {t('analytics.servicesRevenue')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceData.services.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(212, 175, 55, 0.2)" />
                  <XAxis
                    dataKey="serviceName"
                    tick={{ fontSize: 12, fill: '#666', fontWeight: '600' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tickFormatter={truncateLabel}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#666', fontWeight: '600' }} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value as number), t('analytics.revenue')]}
                    contentStyle={{ backgroundColor: 'var(--luxury-white-glass)', border: '1px solid var(--luxury-gold-muted)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                  />
                  <Bar dataKey="revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Services Table with Revenue per Service */}
          <div style={{
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
            padding: '24px'
          }}>
            <h3 className="typography-label mb-6 flex items-center gap-2" style={{ fontSize: '16px', color: 'var(--deep-charcoal)', letterSpacing: '0.03em', fontWeight: '700', textTransform: 'uppercase' }}>
                <Building2 size={18} style={{ color: 'var(--muted-gold)' }} />
              {t('analytics.allServicesPerformance')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full ghost-row-table">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ghost-row-line)' }}>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.service')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.bookings')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.revenue')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>Revenue/Service</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.confirmed')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.completed')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.cancelled')}</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceData.services.map((service) => (
                    <tr 
                      key={service.serviceId} 
                      className="hover-lift transition-all"
                      style={{ height: '64px', borderBottom: '1px solid var(--ghost-row-line)' }}
                    >
                      <td className="typography-label" style={{ fontSize: '14px', color: 'var(--deep-charcoal)' }}>{service.serviceName}</td>
                      <td className="typography-label-light" style={{ fontSize: '14px' }}>{service.totalBookings}</td>
                      <td className="typography-number" style={{ fontSize: '14px', color: '#10b981' }}>{formatCurrency(service.revenue)}</td>
                      <td className="typography-number" style={{ fontSize: '14px', color: 'var(--muted-gold)' }}>{service.totalBookings > 0 ? formatCurrency(service.revenue / service.totalBookings) : '₹0'}</td>
                      <td className="typography-label-light" style={{ fontSize: '14px' }}>{service.confirmedBookings}</td>
                      <td className="typography-label-light" style={{ fontSize: '14px' }}>{service.completedBookings}</td>
                      <td className="typography-label-light" style={{ fontSize: '14px', color: 'var(--muted-terracotta)' }}>{service.cancelledBookings}</td>
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
        <div className="space-y-6 px-6">
          {/* Customer Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t('analytics.totalCustomers')}
              value={customerData.totalCustomers.toString()}
              icon={<Users size={20} style={{ color: 'var(--icon-color)' }} />}
              color="blue"
            />
            <StatCard
              label={t('analytics.newCustomers')}
              value={customerData.newCustomers.toString()}
              icon={<UserCheck size={20} style={{ color: 'var(--icon-color)' }} />}
              color="green"
            />
            <StatCard
              label={t('analytics.returningCustomers')}
              value={customerData.returningCustomers.toString()}
              icon={<Users2 size={20} style={{ color: 'var(--icon-color)' }} />}
              color="purple"
            />
            <StatCard
              label={t('analytics.retentionRate')}
              value={`${customerData.retentionRate}%`}
              icon={<TrendingUp size={20} style={{ color: 'var(--icon-color)' }} />}
              color="orange"
            />
          </div>

          {/* Churn Risk Widget */}
          <div className="floating-tile p-6" style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: '2px solid rgba(239, 68, 68, 0.3)'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="typography-number" style={{ fontSize: '18px', color: 'var(--deep-charcoal)' }}>Churn Risk</h3>
                  <p className="typography-label-light" style={{ fontSize: '14px' }}>Clients who haven't returned in 30+ days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="typography-number" style={{ fontSize: '28px', color: '#ef4444' }}>
                  {Math.round(customerData.totalCustomers * (1 - customerData.retentionRate / 100))}
                </p>
                <div className="flex items-center gap-2 justify-end mt-1">
                  <Info size={14} style={{ color: '#666' }} />
                  <p className="text-xs" style={{ color: '#666' }}>Consider re-engagement campaigns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={{
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
              padding: '24px'
            }}>
              <h3 className="typography-label mb-6 flex items-center gap-2" style={{ fontSize: '16px', color: 'var(--deep-charcoal)', letterSpacing: '0.02em', fontWeight: '700' }}>
                <Users size={18} style={{ color: 'var(--muted-gold)' }} />
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
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                  >
                    <Cell fill="#059669" />
                    <Cell fill="#1E4D8C" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--luxury-white-glass)', border: '1px solid var(--luxury-gold-muted)', borderRadius: '8px', backdropFilter: 'blur(10px)' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Booking Frequency */}
            <div style={{
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
              padding: '24px'
            }}>
              <h3 className="typography-label mb-6 flex items-center gap-2" style={{ fontSize: '16px', color: 'var(--deep-charcoal)', letterSpacing: '0.02em', fontWeight: '700' }}>
                <Activity size={18} style={{ color: 'var(--muted-gold)' }} />
                {t('analytics.bookingFrequency')}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(customerData.bookingFrequencyDistribution).map(([key, value]) => ({
                    name: key,
                    customers: value
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.2)" />
                  <XAxis dataKey="name" tick={{ fill: '#666', fontWeight: '600' }} />
                  <YAxis tick={{ fill: '#666', fontWeight: '600' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--luxury-white-glass)', border: '1px solid var(--luxury-gold-muted)', borderRadius: '8px', backdropFilter: 'blur(10px)' }} />
                  <Bar dataKey="customers" fill="#D4AF37" radius={[6, 6, 0, 0]} style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Customers Table */}
          <div style={{
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
            padding: '24px'
          }}>
            <h3 className="typography-label mb-6 flex items-center gap-2" style={{ fontSize: '16px', color: 'var(--deep-charcoal)', letterSpacing: '0.02em', fontWeight: '700' }}>
              <Star size={18} style={{ color: 'var(--muted-gold)' }} />
              Top 20 Customers
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full ghost-row-table">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ghost-row-line)' }}>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.customer')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.totalBookings')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.totalSpent')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.firstBooking')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.lastBooking')}</th>
                  </tr>
                </thead>
                <tbody>
                  {customerData.topCustomers.slice(0, 20).map((customer) => (
                    <tr 
                      key={customer.userId} 
                      className="hover-lift transition-all"
                      style={{ height: '64px', borderBottom: '1px solid var(--ghost-row-line)' }}
                    >
                      <td className="typography-label" style={{ fontSize: '14px', color: 'var(--deep-charcoal)' }}>
                        <div className="flex items-center gap-3">
                          {customer.image ? (
                            <img 
                              src={customer.image} 
                              alt={customer.name}
                              className="w-10 h-10 rounded-full object-cover"
                              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                              onError={(e) => {
                                console.error('Image load error for customer:', customer.name, customer.image);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ 
                              backgroundColor: 'var(--muted-gold)',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}>
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {customer.name}
                        </div>
                      </td>
                      <td className="typography-label-light" style={{ fontSize: '14px' }}>{customer.totalBookings}</td>
                      <td className="typography-number" style={{ fontSize: '14px', color: '#10b981' }}>{formatCurrency(customer.totalSpent)}</td>
                      <td className="typography-label-light" style={{ fontSize: '14px' }}>{customer.firstBooking}</td>
                      <td className="typography-label-light" style={{ fontSize: '14px' }}>{customer.lastBooking}</td>
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
        <div className="space-y-6 px-6">
          {/* Staff Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t('analytics.totalStaff')}
              value={staffProductivityData.staffCount.toString()}
              icon={<Users2 size={20} style={{ color: 'var(--icon-color)' }} />}
              color="blue"
            />
            <StatCard
              label={t('analytics.avgUtilization')}
              value={`${staffProductivityData.salonAverages.utilizationRate}%`}
              icon={<Activity size={20} style={{ color: 'var(--icon-color)' }} />}
              color="green"
            />
            <StatCard
              label={t('analytics.avgConversion')}
              value={`${staffProductivityData.salonAverages.conversionRate}%`}
              icon={<Target size={20} style={{ color: 'var(--icon-color)' }} />}
              color="purple"
            />
            <StatCard
              label={t('analytics.avgServicesPerDay')}
              value={staffProductivityData.salonAverages.servicesPerDay.toFixed(1)}
              icon={<Zap size={20} style={{ color: 'var(--icon-color)' }} />}
              color="orange"
            />
          </div>

          {/* Utilization Rate Highlight Widget */}
          <div className="floating-tile p-6" style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
            border: '2px solid rgba(16, 185, 129, 0.3)'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="typography-number" style={{ fontSize: '18px', color: 'var(--deep-charcoal)' }}>Staff Utilization Rate</h3>
                  <p className="typography-label-light" style={{ fontSize: '14px' }}>Average time spent on appointments vs idle time</p>
                </div>
              </div>
              <div className="text-right">
                <p className="typography-number" style={{ fontSize: '28px', color: '#10b981' }}>{staffProductivityData.salonAverages.utilizationRate}%</p>
                <div className="flex items-center gap-2 justify-end mt-1">
                  <Info size={14} style={{ color: '#666' }} />
                  <p className="text-xs" style={{ color: '#666' }}>Optimal range: 70-85%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Ranking Chart & Staff Occupancy Chart - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Ranking Chart */}
            <div style={{
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
              padding: '24px'
            }}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="typography-label flex items-center gap-2" style={{ fontSize: '16px', color: 'var(--deep-charcoal)', letterSpacing: '0.02em', fontWeight: '700' }}>
                  <TrendingUp size={18} style={{ color: 'var(--muted-gold)' }} />
                  {t('analytics.staffRankingByRevenue')}
                </h3>
                <p className="text-xs px-3 py-1 rounded-full typography-label-light" style={{ backgroundColor: 'var(--light-greige)', fontSize: '12px' }}>{t('analytics.topPerformersByMoneyEarned')}</p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={staffProductivityData.staffData
                    .sort((a, b) => b.productivity.revenueGenerated - a.productivity.revenueGenerated)
                    .slice(0, 10)}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(212, 175, 55, 0.2)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#666' }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tickFormatter={truncateLabel}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                    contentStyle={{ backgroundColor: 'var(--luxury-white-glass)', border: '1px solid var(--luxury-gold-muted)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                  />
                  <Bar dataKey="productivity.revenueGenerated" fill="var(--luxury-gold)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Staff Occupancy Chart */}
            <div style={{
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
              padding: '24px'
            }}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="typography-label flex items-center gap-2" style={{ fontSize: '16px', color: 'var(--deep-charcoal)', letterSpacing: '0.02em', fontWeight: '700' }}>
                  <Activity size={18} style={{ color: 'var(--muted-gold)' }} />
                  {t('analytics.staffOccupancy')}
                </h3>
                <p className="text-xs px-3 py-1 rounded-full typography-label-light" style={{ backgroundColor: 'var(--light-greige)', fontSize: '12px' }}>{t('analytics.totalAppointmentsPerStaff')}</p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={staffProductivityData.staffData
                    .sort((a, b) => b.metrics.totalBookings - a.metrics.totalBookings)
                    .slice(0, 10)}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(212, 175, 55, 0.2)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#666' }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tickFormatter={truncateLabel}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                  <Tooltip 
                    formatter={(value) => [value, 'Bookings']}
                    contentStyle={{ backgroundColor: 'var(--luxury-white-glass)', border: '1px solid var(--luxury-gold-muted)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                  />
                  <Bar dataKey="metrics.totalBookings" fill="var(--luxury-charcoal)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Staff Performance Table */}
          <div style={{
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
            padding: '24px'
          }}>
            <h3 className="typography-label mb-6 flex items-center gap-2" style={{ fontSize: '16px', color: 'var(--deep-charcoal)', letterSpacing: '0.02em', fontWeight: '700' }}>
                <Users2 size={18} style={{ color: 'var(--muted-gold)' }} />
              {t('analytics.staffBookingsProductivity')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full ghost-row-table">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ghost-row-line)' }}>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.rank')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.staff')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.role')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.totalBookings')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.completed')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.revenue')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.utilization')}</th>
                    <th className="text-left typography-label" style={{ fontSize: '12px', color: '#666' }}>{t('analytics.rating')}</th>
                  </tr>
                </thead>
                <tbody>
                  {staffProductivityData.staffData
                    .sort((a, b) => b.productivity.revenueGenerated - a.productivity.revenueGenerated)
                    .map((staff, index) => (
                    <tr 
                      key={staff.staffId} 
                      className="hover-lift transition-all"
                      style={{ height: '64px', borderBottom: '1px solid var(--ghost-row-line)' }}
                    >
                      <td className="typography-number" style={{ fontSize: '14px', color: 'var(--deep-charcoal)' }}>
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="typography-label" style={{ fontSize: '14px', color: 'var(--deep-charcoal)' }}>{staff.name}</td>
                      <td className="typography-label-light" style={{ fontSize: '14px' }}>{staff.role}</td>
                      <td className="typography-label-light" style={{ fontSize: '14px' }}>{staff.metrics.totalBookings}</td>
                      <td className="typography-label-light" style={{ fontSize: '14px', color: '#10b981' }}>{staff.metrics.completed}</td>
                      <td className="typography-number" style={{ fontSize: '14px', color: '#10b981' }}>{formatCurrency(staff.productivity.revenueGenerated)}</td>
                      <td className="typography-number" style={{ fontSize: '14px', color: 'var(--muted-gold)' }}>{staff.utilization.utilizationRate}%</td>
                      <td className="typography-label-light" style={{ fontSize: '14px' }}>{staff.quality.averageRating.toFixed(1)} ⭐</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>
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
  isRevenue?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, showEyeIcon, onEyeClick, isRevenueVisible, isRevenue }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  const iconBgColors = {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    red: '#ef4444',
  };

  const displayValue = (isRevenue && !isRevenueVisible) ? '***' : value;

  return (
    <div style={{
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
      padding: '20px'
    }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="typography-label mb-2" style={{ fontSize: '12px', color: '#666', letterSpacing: '0.03em', textTransform: 'uppercase', fontWeight: '600' }}>{label}</p>
          <p 
            className="cursor-pointer transition-all" 
            style={{ 
              fontFamily: 'Playfair Display, serif',
              fontWeight: '700',
              color: 'var(--deep-charcoal)',
              fontSize: isRevenue ? '32px' : '28px',
              letterSpacing: '-0.02em',
              cursor: isRevenue ? 'pointer' : 'default'
            }}
            onClick={() => isRevenue && onEyeClick && onEyeClick()}
          >
            {displayValue}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showEyeIcon && (
            <button
              onClick={onEyeClick}
              style={{ 
                backgroundColor: 'var(--light-greige)',
                padding: '6px',
                borderRadius: '6px',
                border: '1px solid var(--ghost-row-line)',
                cursor: 'pointer'
              }}
            >
              {isRevenueVisible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}
          <div className="p-3 rounded-xl" style={{ 
            backgroundColor: iconBgColors[color],
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}>
            {icon}
          </div>
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
  const iconBgColors = {
    green: '#10b981',
    blue: '#3b82f6',
    orange: '#f59e0b',
    red: '#ef4444'
  };

  const valueColorClasses = {
    green: '#10b981',
    blue: '#3b82f6',
    orange: '#f59e0b',
    red: '#ef4444'
  };

  return (
    <div style={{
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
      padding: '16px'
    }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-lg" style={{ 
            backgroundColor: iconBgColors[color],
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}>
            <Icon size={16} style={{ color: '#FFFFFF' }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider typography-label" style={{ color: '#4A4A4A', fontSize: '11px', letterSpacing: '0.05em' }}>
            {label}
          </span>
        </div>
      </div>
      <p className="typography-number font-bold" style={{ color: valueColorClasses[color], fontSize: '28px', letterSpacing: '-0.02em' }}>
        {value}
      </p>
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
  <div style={{
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F5F2 100%)',
    padding: '16px'
  }} className="flex items-center gap-4">
    <div className="p-2.5 rounded-lg" style={{ 
      backgroundColor: 'var(--muted-gold)', 
      color: 'var(--deep-charcoal)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    }}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <p className="text-xs font-bold mb-1" style={{ color: '#4A4A4A', letterSpacing: '0.03em', textTransform: 'uppercase' }}>{title}</p>
      <p className="text-xl font-bold" style={{ color: 'var(--deep-charcoal)', letterSpacing: '-0.02em' }}>{value}</p>
      <p className="text-xs" style={{ color: '#666' }}>{subtext}</p>
    </div>
  </div>
);

export default AnalyticsPage;
