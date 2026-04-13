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
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Star,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';
import { logoutUser } from '../../../../API/APIs';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../../../components/ui_components/Loader';

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
  userData?: { username: string };
  serviceData?: { serviceName: string };
}

interface DayStats {
  date: string;
  orders: number;
  revenue: number;
  customers: number;
}

type TimeRange = 'TODAY' | 'YESTERDAY' | '7DAYS' | '30DAYS' | 'CUSTOM';

const AnalyticsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { apiSalonRequest } = useSalonApi();
  
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7DAYS');
  const [customDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
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

  // Filter bookings based on selected time range
  const getFilteredBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.slot.date);
      bookingDate.setHours(0, 0, 0, 0);

      switch (timeRange) {
        case 'TODAY':
          return bookingDate.getTime() === today.getTime();
        case 'YESTERDAY': {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return bookingDate.getTime() === yesterday.getTime();
        }
        case '7DAYS': {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return bookingDate >= sevenDaysAgo;
        }
        case '30DAYS': {
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return bookingDate >= thirtyDaysAgo;
        }
        case 'CUSTOM':
          if (customDateRange.start && customDateRange.end) {
            const start = new Date(customDateRange.start);
            const end = new Date(customDateRange.end);
            return bookingDate >= start && bookingDate <= end;
          }
          return true;
        default:
          return true;
      }
    });
  };

  const filteredBookings = getFilteredBookings();

  // Calculate statistics
  const calculateStats = () => {
    const totalOrders = filteredBookings.length;
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.price, 0);
    const uniqueCustomers = new Set(filteredBookings.map(b => b.userId)).size;
    
    const confirmedOrders = filteredBookings.filter(b => b.status === 'CONFIRMED').length;
    const completedOrders = filteredBookings.filter(b => b.status === 'COMPLETED').length;
    const pendingOrders = filteredBookings.filter(b => b.status === 'PENDING').length;
    const cancelledOrders = filteredBookings.filter(b => b.status === 'CANCELLED').length;
    
    const successfulOrders = confirmedOrders + completedOrders;
    const completionRate = totalOrders > 0 ? Math.round((successfulOrders / totalOrders) * 100) : 0;
    const cancellationRate = totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;
    
    // Calculate average order value
    const avgOrderValue = successfulOrders > 0 ? Math.round(totalRevenue / successfulOrders) : 0;

    return {
      totalOrders,
      totalRevenue,
      uniqueCustomers,
      confirmedOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      successfulOrders,
      completionRate,
      cancellationRate,
      avgOrderValue
    };
  };

  const stats = calculateStats();

  // Get top services
  const getTopServices = () => {
    const serviceMap = new Map<string, { name: string; count: number; revenue: number }>();
    
    filteredBookings.forEach(booking => {
      const serviceName = booking.serviceData?.serviceName || 'Unknown Service';
      const existing = serviceMap.get(serviceName);
      if (existing) {
        existing.count += 1;
        existing.revenue += booking.price;
      } else {
        serviceMap.set(serviceName, { name: serviceName, count: 1, revenue: booking.price });
      }
    });

    return Array.from(serviceMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const topServices = getTopServices();

  // Calculate daily stats for chart
  const getDailyStats = (): DayStats[] => {
    const daysMap = new Map<string, DayStats>();
    const today = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      daysMap.set(dateStr, { date: dateStr, orders: 0, revenue: 0, customers: 0 });
    }

    filteredBookings.forEach(booking => {
      const dateStr = booking.slot.date;
      const existing = daysMap.get(dateStr);
      if (existing) {
        existing.orders += 1;
        existing.revenue += booking.price;
      }
    });

    return Array.from(daysMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const dailyStats = getDailyStats();

  // Calculate comparison with previous period
  const getComparisonStats = () => {
    const today = new Date();
    const currentPeriodDays = timeRange === 'TODAY' ? 1 : timeRange === '7DAYS' ? 7 : 30;
    
    const previousStart = new Date(today);
    previousStart.setDate(previousStart.getDate() - (currentPeriodDays * 2));
    const previousEnd = new Date(today);
    previousEnd.setDate(previousEnd.getDate() - currentPeriodDays);

    const previousBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.slot.date);
      return bookingDate >= previousStart && bookingDate < previousEnd;
    });

    const previousRevenue = previousBookings.reduce((sum, b) => sum + b.price, 0);
    const previousOrders = previousBookings.length;

    const revenueChange = previousRevenue > 0 
      ? Math.round(((stats.totalRevenue - previousRevenue) / previousRevenue) * 100) 
      : 0;
    const ordersChange = previousOrders > 0 
      ? Math.round(((stats.totalOrders - previousOrders) / previousOrders) * 100) 
      : 0;

    return { revenueChange, ordersChange };
  };

  const comparison = getComparisonStats();

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'TODAY': return 'Today';
      case 'YESTERDAY': return 'Yesterday';
      case '7DAYS': return 'Last 7 Days';
      case '30DAYS': return 'Last 30 Days';
      case 'CUSTOM': return 'Custom Range';
      default: return 'Last 7 Days';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Loader isVisible={loading} />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#1E4D8C] to-[#153a6b] rounded-xl shadow-lg shadow-blue-900/20">
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500">Track your salon's performance and growth metrics</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            {(['TODAY', '7DAYS', '30DAYS'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range 
                    ? 'bg-[#1E4D8C] text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {range === 'TODAY' ? 'Today' : range === '7DAYS' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
          
          <button 
            onClick={fetchBookings}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          icon={<ShoppingBag size={20} />}
          trend={comparison.ordersChange}
          isPositive={comparison.ordersChange >= 0}
          color="blue"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<IndianRupee size={20} />}
          trend={comparison.revenueChange}
          isPositive={comparison.revenueChange >= 0}
          color="green"
        />
        <StatCard
          label="Unique Customers"
          value={stats.uniqueCustomers.toString()}
          icon={<Users size={20} />}
          trend={0}
          isPositive={true}
          color="purple"
        />
        <StatCard
          label="Avg. Order Value"
          value={`₹${stats.avgOrderValue}`}
          icon={<Target size={20} />}
          trend={0}
          isPositive={true}
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricPill 
          label="Confirmed" 
          value={stats.confirmedOrders} 
          total={stats.totalOrders} 
          color="green" 
          icon={CheckCircle}
        />
        <MetricPill 
          label="Completed" 
          value={stats.completedOrders} 
          total={stats.totalOrders} 
          color="blue" 
          icon={Zap}
        />
        <MetricPill 
          label="Pending" 
          value={stats.pendingOrders} 
          total={stats.totalOrders} 
          color="orange" 
          icon={Clock}
        />
        <MetricPill 
          label="Cancelled" 
          value={stats.cancelledOrders} 
          total={stats.totalOrders} 
          color="red" 
          icon={XCircle}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Activity size={18} className="text-[#1E4D8C]" />
                Orders Trend
              </h3>
              <p className="text-xs text-gray-500 mt-1">Daily order volume for {getTimeRangeLabel().toLowerCase()}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total: {stats.totalOrders}
              </span>
            </div>
          </div>
          
          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end gap-2">
            {dailyStats.map((day) => {
              const maxOrders = Math.max(...dailyStats.map(d => d.orders), 1);
              const height = maxOrders > 0 ? (day.orders / maxOrders) * 100 : 0;
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex justify-center">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10">
                      {day.orders} orders
                      <br />
                      ₹{day.revenue.toLocaleString()}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full max-w-[40px] bg-gradient-to-t from-[#1E4D8C] to-[#3b82f6] rounded-t-lg transition-all duration-500 hover:from-[#153a6b] hover:to-[#1E4D8C]"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">
                    {formatDateLabel(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-t from-[#1E4D8C] to-[#3b82f6]" />
              <span className="text-xs text-gray-500 font-medium">Orders</span>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PieChart size={18} className="text-[#1E4D8C]" />
            Order Status
          </h3>
          
          <div className="space-y-4">
            <StatusBar 
              label="Confirmed" 
              value={stats.confirmedOrders} 
              total={stats.totalOrders} 
              color="bg-green-500" 
            />
            <StatusBar 
              label="Completed" 
              value={stats.completedOrders} 
              total={stats.totalOrders} 
              color="bg-blue-500" 
            />
            <StatusBar 
              label="Pending" 
              value={stats.pendingOrders} 
              total={stats.totalOrders} 
              color="bg-orange-500" 
            />
            <StatusBar 
              label="Cancelled" 
              value={stats.cancelledOrders} 
              total={stats.totalOrders} 
              color="bg-red-500" 
            />
          </div>
          
          {/* Completion Rate */}
          <div className="mt-6 pt-4 border-t border-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Success Rate</span>
              <span className="text-lg font-bold text-gray-800">{stats.completionRate}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Services & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Star size={18} className="text-[#1E4D8C]" />
              Top Services
            </h3>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              By Bookings
            </span>
          </div>
          
          <div className="space-y-4">
            {topServices.length > 0 ? (
              topServices.map((service, idx) => (
                <div key={service.name} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{service.name}</p>
                    <p className="text-xs text-gray-400">{service.count} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1E4D8C]">₹{service.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Revenue</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No service data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-gradient-to-br from-[#1E4D8C] to-[#153a6b] rounded-2xl shadow-lg p-6 text-white">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Target size={20} className="text-blue-200" />
            Performance Insights
          </h3>
          
          <div className="space-y-4">
            <InsightCard
              icon={TrendingUp}
              title="Best Performing Day"
              value={dailyStats.reduce((max, day) => day.orders > max.orders ? day : max, dailyStats[0] || { date: '-', orders: 0 }).date !== '-' 
                ? formatDateLabel(dailyStats.reduce((max, day) => day.orders > max.orders ? day : max, dailyStats[0]).date)
                : 'No data'
              }
              subtext="Highest order volume"
            />
            <InsightCard
              icon={IndianRupee}
              title="Revenue per Customer"
              value={stats.uniqueCustomers > 0 ? `₹${Math.round(stats.totalRevenue / stats.uniqueCustomers)}` : '₹0'}
              subtext="Average spend per unique customer"
            />
            <InsightCard
              icon={CheckCircle}
              title="Fulfillment Rate"
              value={`${stats.completionRate}%`}
              subtext={stats.completionRate > 80 ? 'Excellent performance!' : stats.completionRate > 50 ? 'Good progress' : 'Needs improvement'}
              highlight={stats.completionRate > 80}
            />
          </div>
          
          {/* Motivational Footer */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-xs text-blue-200 italic">
              "{stats.totalOrders > 10 
                ? 'Your salon is performing well! Keep up the great work.' 
                : 'Every booking counts! Keep promoting your services.'}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: number;
  isPositive: boolean;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, isPositive, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
      <h3 className="text-xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  );
};

interface MetricPillProps {
  label: string;
  value: number;
  total: number;
  color: 'green' | 'blue' | 'orange' | 'red';
  icon: React.ElementType;
}

const MetricPill: React.FC<MetricPillProps> = ({ label, value, total, color, icon: Icon }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100'
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

interface StatusBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ label, value, total, color }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
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

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, title, value, subtext, highlight }) => (
  <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
    <div className={`p-2 rounded-lg ${highlight ? 'bg-green-400/20 text-green-300' : 'bg-white/10 text-blue-200'}`}>
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
