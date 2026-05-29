import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui_components/card";
import { Button } from "../../components/ui_components/button";
import { BarChart3, Users, Eye, Calendar, TrendingUp } from "lucide-react";

interface AnalyticsSummary {
  total_events: number;
  unique_sessions: number;
  unique_users: number;
  event_type_breakdown: Record<string, number>;
  top_pages: Array<{ page: string; count: number }>;
  date_range: { start: string; end: string };
  top_users?: Array<{ user_id: string; user_name: string; user_email: string; event_count: number }>;
}

const getSampleData = (): AnalyticsSummary => ({
  total_events: 15420,
  unique_sessions: 2340,
  unique_users: 1890,
  event_type_breakdown: {
    page_view: 8542,
    button_click: 3210,
    link_click: 1890,
    form_submit: 756,
    custom_event: 567,
    search: 345,
    login: 89,
    signup: 21
  },
  top_pages: [
    { page: "/", count: 4521 },
    { page: "/salons", count: 2341 },
    { page: "/salon/123", count: 1876 },
    { page: "/search", count: 1234 },
    { page: "/profile", count: 987 },
    { page: "/bookings", count: 765 },
    { page: "/wishlist", count: 543 },
    { page: "/salon/456", count: 432 },
    { page: "/salon/789", count: 321 },
    { page: "/feedback/123", count: 234 }
  ],
  top_users: [
    { user_id: "user_1", user_name: "John Doe", user_email: "john@example.com", event_count: 245 },
    { user_id: "user_2", user_name: "Jane Smith", user_email: "jane@example.com", event_count: 198 },
    { user_id: "user_3", user_name: "Bob Johnson", user_email: "bob@example.com", event_count: 167 },
    { user_id: "user_4", user_name: "Alice Brown", user_email: "alice@example.com", event_count: 143 },
    { user_id: "user_5", user_name: "Charlie Wilson", user_email: "charlie@example.com", event_count: 121 }
  ],
  date_range: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString()
  }
});

const Tracking = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endDate = new Date();
      const startDate = new Date();
      
      if (timeRange === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (timeRange === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(
        `${apiUrl}/analytics/track/summary?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch analytics data: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600 font-medium">Error loading analytics data</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={fetchAnalytics}>
                Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setError(null);
                  setSummary(getSampleData());
                }}
              >
                Load Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>
        <p className="text-sm text-gray-500">
          Make sure the backend is running at {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500 mb-4">No analytics data available</p>
            <Button onClick={() => setSummary(getSampleData())}>
              Load Sample Data
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">User Tracking Analytics</h1>
          <p className="text-gray-400 mt-2 text-lg">Monitor user behavior and interactions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
            <Calendar size={16} className="text-amber-400" />
            <span className="text-sm text-gray-300">
              {new Date(summary.date_range.start).toLocaleDateString()} - {new Date(summary.date_range.end).toLocaleDateString()}
            </span>
          </div>
          <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                onClick={() => setTimeRange(range)}
                size="sm"
                className={`${
                  timeRange === range
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                } rounded-lg transition-all duration-300 font-medium`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2 uppercase tracking-wider">
              <BarChart3 size={18} className="text-amber-400" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white tracking-tight">
              {summary.total_events.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2 uppercase tracking-wider">
              <Users size={18} className="text-emerald-400" />
              Unique Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white tracking-tight">
              {summary.unique_users.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-2 font-medium">Authenticated users</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2 uppercase tracking-wider">
              <Eye size={18} className="text-violet-400" />
              Unique Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white tracking-tight">
              {summary.unique_sessions.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-2 font-medium">Active sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp size={18} className="text-rose-400" />
              Avg Events/User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white tracking-tight">
              {summary.unique_users > 0 
                ? (summary.total_events / summary.unique_users).toFixed(1)
                : '0'
              }
            </div>
            <p className="text-sm text-gray-500 mt-2 font-medium">Events per user</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-xl">
            <BarChart3 size={24} className="text-amber-400" />
            Event Type Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {Object.entries(summary.event_type_breakdown)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([eventType, count]) => {
                const percentage = (count / summary.total_events) * 100;
                return (
                  <div key={eventType}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-300 capitalize">
                        {eventType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-medium text-amber-400">
                        {count.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 h-2.5 rounded-full transition-all duration-700 shadow-lg shadow-amber-500/20"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-xl">
            <Calendar size={24} className="text-blue-400" />
            Top Visited Salons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.top_pages.slice(0, 10).map((page, index) => {
              const percentage = summary.top_pages[0].count > 0 ? (page.count / summary.top_pages[0].count) * 100 : 0;
              return (
                <div key={page.page} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-300">
                        {page.page}
                      </span>
                      <span className="text-sm font-medium text-blue-400">
                        {page.count.toLocaleString()} visits
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 h-2 rounded-full transition-all duration-700 shadow-lg shadow-blue-500/20"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {summary.top_users && summary.top_users.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-xl">
              <Users size={24} className="text-emerald-400" />
              Top Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.top_users.slice(0, 10).map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.user_name}</p>
                      <p className="text-sm text-gray-400">{user.user_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-white">{user.event_count}</p>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">events</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tracking;
