import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  IndianRupee, 
  Users, 
  Calendar, 
  XCircle, 
  MoreVertical, 
  ShoppingBag, 
  UserCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Star 
} from 'lucide-react';

// 1. Define specific props for the StatCard component
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  isPositive: boolean;
}

// 2. Extracted StatCard for cleaner code
const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, isPositive }) => (
  <div className="glass-card p-6 rounded-xl elevation-1 hover:elevation-2 hover-lift transition-all">
    <div className="flex justify-between items-center mb-4">
      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg elevation-1">
        {icon}
      </div>
      <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </div>
    </div>
    <p className="text-gray-500 text-sm font-medium">{label}</p>
    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
  </div>
);

const DashBoardBusiness: React.FC = () => {
  const { t } = useTranslation();
  // Dummy Data
  const businessStats = [
    { label: t('business.totalCustomers'), value: '1,284', trend: '+14%', isPositive: true, icon: <Users size={20} /> },
    { label: t('business.avgTicketSize'), value: '₹850', trend: '+5%', isPositive: true, icon: <ShoppingBag size={20} /> },
    { label: t('business.retentionRate'), value: '64%', trend: '-2%', isPositive: false, icon: <UserCheck size={20} /> },
    { label: t('business.netProfit'), value: '₹42,000', trend: '+18%', isPositive: true, icon: <TrendingUp size={20} /> },
  ];

  const topServices = [
    { name: 'Haircut & Styling', bookings: 145, revenue: '₹43,500', growth: 12 },
    { name: 'Bridal Makeup', bookings: 12, revenue: '₹60,000', growth: 24 },
    { name: 'Facial Therapy', bookings: 88, revenue: '₹22,000', growth: -5 },
  ];

  return (
    <div className="space-y-8 animate-md3-fade-in">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center animate-md3-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('business.title')}</h1>
          <p className="text-sm text-gray-500">{t('business.subtitle')}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors elevation-1 hover:elevation-2">
          <MoreVertical className="text-gray-400" />
        </button>
      </div>

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {businessStats.map((stat, i) => (
          <StatCard 
            key={i}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            isPositive={stat.isPositive}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REVENUE CHART PLACEHOLDER */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl elevation-1 hover:elevation-2 hover-lift animate-delay-100 animate-md3-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">{t('business.revenueForecast')}</h3>
            <select className="text-xs border-gray-200 rounded-md bg-gray-50 p-1 outline-none cursor-pointer">
              <option>{t('business.last7Days')}</option>
              <option>{t('business.last30Days')}</option>
            </select>
          </div>
          <div className="h-64 w-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-sm flex flex-col items-center gap-2">
              <TrendingUp size={32} />
              <p>{t('business.chartVisualization')}</p>
            </div>
          </div>
        </div>

        {/* TOP SERVICES TABLE */}
        <div className="glass-card p-6 rounded-2xl elevation-1 hover:elevation-2 hover-lift animate-delay-200 animate-md3-fade-in">
          <h3 className="font-bold text-gray-800 mb-6">{t('business.topServices')}</h3>
          <div className="space-y-6">
            {topServices.map((service, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">{service.name}</p>
                  <p className="text-xs text-gray-400">{service.bookings} {t('business.bookings')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{service.revenue}</p>
                  <p className={`text-[10px] font-bold ${service.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {service.growth >= 0 ? '+' : ''}{service.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors elevation-1 hover:elevation-2">
            {t('business.viewServiceReports')}
          </button>
        </div>
      </div>

      {/* STAFF PERFORMANCE TABLE */}
      <section className="glass-card rounded-2xl overflow-hidden elevation-1 hover:elevation-2 hover-lift animate-delay-300 animate-md3-fade-in">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-bold text-gray-800">{t('business.staffPerformance')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr className="text-[11px] uppercase text-gray-400 font-bold">
                <th className="px-6 py-4">{t('business.staffMember')}</th>
                <th className="px-6 py-4">{t('business.rating')}</th>
                <th className="px-6 py-4 text-center">{t('business.appointments')}</th>
                <th className="px-6 py-4 text-right">{t('business.totalSales')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold elevation-1">R</div>
                  <span className="text-sm font-bold text-gray-700">Rahul Sharma</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-orange-500">
                  <div className="flex items-center gap-1">
                    <Star size={14} fill="currentColor" /> 4.9
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 text-center">142</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">₹48,200</td>
              </tr>
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold elevation-1">A</div>
                  <span className="text-sm font-bold text-gray-700">Aman Varma</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-orange-500">
                  <div className="flex items-center gap-1">
                    <Star size={14} fill="currentColor" /> 4.7
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 text-center">98</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">₹32,150</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashBoardBusiness;