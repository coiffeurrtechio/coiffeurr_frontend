import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingDown, DollarSign, Calendar, Users, Star, Flame } from "lucide-react";
import { Card } from "../../components/ui_components/card";
import { Button } from "../../components/ui_components/button";

interface AnalyticsData {
  total_gmv: number;
  platform_revenue: number;
  commission_collected: number;
  total_bookings: number;
  pending_payouts: number;
  paid_payouts: number;
  active_salons: number;
  active_users: number;
  average_rating: number;
  customer_footfall: Array<{ date: string; bookings: number }>;
  new_customers: Array<{ date: string; customers: number }>;
  period: {
    start_date: string;
    end_date: string;
  };
}

interface TopPerformer {
  id: string;
  name: string;
  revenue: number;
  bookings_count: number;
  rating: number;
  performance_score: number;
  is_trending: boolean;
  period: string;
}

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("current_month");
  const [footfallView, setFootfallView] = useState<"bookings" | "customers">("bookings");

  const fetchAnalytics = async () => {
    console.log("Fetching analytics data...");
    try {
      const token = localStorage.getItem("super_admin_access_token");
      const url = `${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/analytics/financial?period=${period}`;
      console.log("API URL:", url);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      console.log("Analytics data received:", data);
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const fetchTopPerformers = async () => {
    console.log("Fetching top performers...");
    try {
      const token = localStorage.getItem("super_admin_access_token");
      const url = `${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/analytics/top-performers?period=${period}&limit=10`;
      console.log("API URL:", url);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      if (!response.ok) throw new Error("Failed to fetch top performers");

      const data = await response.json();
      console.log("Top performers data received:", data);
      setTopPerformers(data);
    } catch (error) {
      console.error("Error fetching top performers:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchAnalytics(), fetchTopPerformers()]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-[#09090b] text-white">
        <div className="text-gray-400 text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Nexus: Analytics Dashboard
          </h1>
          <p className="text-gray-400">Platform performance insights</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === "current_month" ? "default" : "outline"}
            onClick={() => setPeriod("current_month")}
            className={period === "current_month" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30" : "border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"}
          >
            This Month
          </Button>
          <Button
            variant={period === "last_month" ? "default" : "outline"}
            onClick={() => setPeriod("last_month")}
            className={period === "last_month" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30" : "border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"}
          >
            Last Month
          </Button>
          <Button
            variant={period === "all_time" ? "default" : "outline"}
            onClick={() => setPeriod("all_time")}
            className={period === "all_time" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30" : "border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"}
          >
            All Time
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-transparent backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Total Platform Revenue</p>
              <p className="text-2xl font-bold text-cyan-400 font-mono">
                {analyticsData ? formatCurrency(analyticsData.platform_revenue) : "₹0"}
              </p>
            </div>
            <div className="bg-cyan-500/20 p-3 rounded-full">
              <DollarSign className="text-cyan-400" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-transparent backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Total Bookings (24h)</p>
              <p className="text-2xl font-bold text-blue-400 font-mono">
                {analyticsData ? analyticsData.total_bookings : 0}
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-full">
              <Calendar className="text-blue-400" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-transparent backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Average Salon Rating</p>
              <p className="text-2xl font-bold text-purple-400 font-mono">
                {analyticsData ? analyticsData.average_rating.toFixed(1) : "0.0"}
                <Star className="inline ml-1 text-yellow-400 fill-yellow-400" size={16} />
              </p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-full">
              <Star className="text-purple-400" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-transparent backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Total Active Users</p>
              <p className="text-2xl font-bold text-green-400 font-mono">
                {analyticsData ? analyticsData.active_users : 0}
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-full">
              <Users className="text-green-400" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Footfall Chart */}
      <Card className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Customer Footfall (Last 30 Days)</h2>
          <select
            value={footfallView}
            onChange={(e) => setFootfallView(e.target.value as "bookings" | "customers")}
            className="px-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-white"
          >
            <option value="bookings">Booking Data</option>
            <option value="customers">New Customers</option>
          </select>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={footfallView === "bookings" ? analyticsData?.customer_footfall || [] : analyticsData?.new_customers || [] as any}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="#666"
                tickFormatter={formatDate}
                tick={{ fill: "#9ca3af" }}
              />
              <YAxis stroke="#666" tick={{ fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#fff" }}
                formatter={(value: any) => [value, footfallView === "bookings" ? "Bookings" : "Customers"]}
                labelFormatter={(label: any) => formatDate(label)}
              />
              <Line
                type="monotone"
                dataKey={footfallView === "bookings" ? "bookings" : "customers"}
                stroke={footfallView === "bookings" ? "#22d3ee" : "#a855f7"}
                strokeWidth={2}
                dot={{ fill: footfallView === "bookings" ? "#22d3ee" : "#a855f7", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Performers Table */}
      <Card className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Top Performing Salons</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase tracking-wider text-xs">Rank</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase tracking-wider text-xs">Salon Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase tracking-wider text-xs">Performance Score</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase tracking-wider text-xs">Revenue</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase tracking-wider text-xs">Bookings</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase tracking-wider text-xs">Rating</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase tracking-wider text-xs">Trending</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((performer, index) => (
                <tr key={performer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full text-sm font-bold border border-cyan-500/30">
                      #{index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">{performer.name}</td>
                  <td className="py-3 px-4">
                    <span className="text-cyan-400 font-bold font-mono">{performer.performance_score.toFixed(0)}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 font-mono">{formatCurrency(performer.revenue)}</td>
                  <td className="py-3 px-4 text-gray-400 font-mono">{performer.bookings_count}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400" size={14} fill="#facc15" />
                      <span className="text-gray-400 font-mono">{performer.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {performer.is_trending ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Flame size={16} />
                        <span className="text-sm font-semibold">🔥 Trending</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <TrendingDown size={16} />
                        <span className="text-sm">Stable</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {topPerformers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No data available for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
