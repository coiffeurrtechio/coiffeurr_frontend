import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

// --- Types ---
interface Booking {
  id: string;
  customer: { name: string; avatar: string };
  time: string;
  service: string;
  price: string;
  staff: { name: string; avatar: string; rating: string };
  status: 'Confirmed' | 'Ready' | 'In-Progress' | 'Pending';
}

const BookingsPage: React.FC = () => {
  const [selectedBookingId, setSelectedBookingId] = useState<string>('1');

  const bookings: Booking[] = [
    { id: '1', customer: { name: 'Ankit', avatar: 'https://i.pravatar.cc/150?u=1' }, time: '5:30 PM', service: 'Haircut', price: '₹299', staff: { name: 'Rahul', avatar: 'https://i.pravatar.cc/150?u=10', rating: '4.8' }, status: 'Confirmed' },
    { id: '2', customer: { name: 'Riya', avatar: 'https://i.pravatar.cc/150?u=2' }, time: '6:00 PM', service: 'Facial', price: '₹4,099', staff: { name: 'Aman', avatar: 'https://i.pravatar.cc/150?u=11', rating: '4.6' }, status: 'Ready' },
    { id: '3', customer: { name: 'Birendra', avatar: 'https://i.pravatar.cc/150?u=3' }, time: '5:30 PM', service: 'Beard', price: '₹159', staff: { name: 'Rahul', avatar: 'https://i.pravatar.cc/150?u=10', rating: '4.8' }, status: 'In-Progress' },
    { id: '4', customer: { name: 'Rahul', avatar: 'https://i.pravatar.cc/150?u=4' }, time: '5:30 PM', service: 'Haircut', price: '₹299', staff: { name: 'Rahul', avatar: 'https://i.pravatar.cc/150?u=10', rating: '4.8' }, status: 'Pending' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-50 text-green-600 border-green-100';
      case 'Ready': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'In-Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* LEFT: MAIN LIST & FILTERS */}
      <div className="flex-1 space-y-4">
        
        {/* FILTERS BAR */}
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
          <button className="bg-[#1E4D8C] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Filter size={16} /> Filters
          </button>
          <select className="bg-gray-50 border-none text-xs font-bold text-gray-500 rounded-lg px-3 py-2 outline-none">
            <option>Customer</option>
          </select>
          <select className="bg-gray-50 border-none text-xs font-bold text-gray-500 rounded-lg px-3 py-2 outline-none">
            <option>State</option>
          </select>
          <select className="bg-gray-50 border-none text-xs font-bold text-gray-500 rounded-lg px-3 py-2 outline-none">
            <option>Status</option>
          </select>
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search service..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm outline-none" />
          </div>
        </div>

        {/* DATA TABLE (Desktop) / LIST (Mobile) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr className="text-[11px] uppercase text-gray-400 font-bold tracking-widest">
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Staff</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((row) => (
                  <tr 
                    key={row.id} 
                    onClick={() => setSelectedBookingId(row.id)}
                    className={`cursor-pointer transition-colors ${selectedBookingId === row.id ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-800">{row.time}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <img src={row.customer.avatar} className="w-9 h-9 rounded-full border border-gray-100" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{row.customer.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-tight">{row.time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-gray-700">{row.service}</p>
                      <div className="flex items-center gap-1 text-orange-500 text-[10px] font-bold">
                        ★ {row.staff.rating}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST VIEW */}
          <div className="md:hidden divide-y divide-gray-50">
            {bookings.map((row) => (
              <div key={row.id} className="p-4 flex items-center justify-between" onClick={() => setSelectedBookingId(row.id)}>
                <div className="flex gap-3">
                   <img src={row.customer.avatar} className="w-10 h-10 rounded-full" />
                   <div>
                     <p className="text-sm font-bold text-gray-900">{row.customer.name}</p>
                     <p className="text-xs text-gray-500">{row.service} • {row.time}</p>
                   </div>
                </div>
                <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusColor(row.status)}`}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>

          {/* PAGINATION FOOTER */}
          <div className="p-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium">1 - 10 of 113 Bookings</p>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-white rounded border border-gray-200 text-gray-400"><ChevronLeft size={16} /></button>
              <button className="p-1.5 bg-[#1E4D8C] rounded text-white shadow-sm px-3 text-xs font-bold">1</button>
              <button className="p-1.5 hover:bg-white rounded border border-gray-200 text-gray-400"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default BookingsPage;