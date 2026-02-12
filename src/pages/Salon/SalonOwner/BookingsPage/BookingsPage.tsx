import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  X,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { useApi } from '../../../../API/SalonsAPIs/ALLSalonAPI';
import { Loader } from '../../../../components/ui_components/Loader';
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';

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
}

const BookingsPage: React.FC = () => {
  const { apiRequest } = useApi();
  const { apiSalonPatch } = useSalonApi();
  
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Notification State for Success/Error feedback
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;

      const res = await apiRequest<BookingResponse[]>(`/bookings/salon/${salonId}`);
      if (res.data) {
        setBookings(res.data);
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setLoading(true);
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      // Get the logged-in User ID (Salon Owner) for the header
      const salonOwnerId = parsedAuth?.user?.user?.id;

      const res = await apiSalonPatch(
        `/bookings/${bookingId}/status?status=${newStatus}`, 
        {}, // Body is empty as per your requirement
        {
          headers: {
            "X-User-Id": selectedBooking.userId, // Salon Owner ID in header
          }
        }
      );

      if (res.error) throw new Error(res.error);

      setNotification({ type: 'success', message: `Booking ${newStatus.toLowerCase()} successfully!` });
      setIsModalOpen(false);
      fetchBookings(); 
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || "Failed to update status" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-50 text-green-600 border-green-100';
      case 'COMPLETED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      case 'PENDING': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500 relative">
      <Loader isVisible={loading} />

      {/* --- Notification Toast --- */}
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-white border-green-500 text-green-600' : 'bg-white border-red-500 text-red-600'
        } border-l-4`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Booking Management</h1>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        <button className="bg-[#1E4D8C] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <Filter size={16} /> Filters
        </button>
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search customer ID..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100" />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr className="text-[11px] uppercase text-gray-400 font-bold tracking-widest">
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Customer ID</th>
                <th className="px-6 py-4">Service Details</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => {
                    console.log("row =",row);
                    
                    setSelectedBooking(row);
                    setIsModalOpen(true);
                  }}
                  className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-gray-800">{row.slot.date}</p>
                    <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {row.slot.time} ({row.slot.duration}m)
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-mono text-gray-500 truncate w-32">{row.userId}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-gray-700">ID: ...{row.service_id.slice(-6)}</p>
                    <p className="text-[10px] text-[#1E4D8C] font-bold">₹{row.price}</p>
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
      </div>

      {/* DETAIL MODAL */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Booking Summary</h3>
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">REF: {selectedBooking.id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1.5"><Calendar size={12} /> Appointment</p>
                  <p className="text-sm font-bold text-gray-800">{selectedBooking.slot.date}</p>
                  <p className="text-xs text-gray-500 font-medium">{selectedBooking.slot.time}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1.5"><CreditCard size={12} /> Payment</p>
                  <p className="text-sm font-black text-[#1E4D8C]">₹{selectedBooking.price}</p>
                  <p className={`text-[9px] font-bold uppercase ${getStatusColor(selectedBooking.status).split(' ')[1]}`}>{selectedBooking.status}</p>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-50 pt-4">
                 <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-lg">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Customer UID</span>
                    <span className="text-xs font-mono font-bold text-gray-600">{selectedBooking.userId}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-lg">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Service UID</span>
                    <span className="text-xs font-mono font-bold text-gray-600">{selectedBooking.service_id}</span>
                 </div>
              </div>

              {/* Action Buttons */}
              {selectedBooking.status === 'PENDING' && (
                <div className="flex gap-3 pt-4">
                  <button onClick={() => updateBookingStatus(selectedBooking.id, 'CANCELLED')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-all hover:bg-red-100"><XCircle size={16} /> Reject</button>
                  <button onClick={() => updateBookingStatus(selectedBooking.id, 'CONFIRMED')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1E4D8C] text-white rounded-xl text-xs font-bold transition-all hover:bg-[#153a6b] shadow-lg"><CheckCircle size={16} /> Confirm</button>
                </div>
              )}

              {selectedBooking.status === 'CONFIRMED' && (
                <button onClick={() => updateBookingStatus(selectedBooking.id, 'COMPLETED')} className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-xs font-bold transition-all hover:bg-green-700 shadow-lg shadow-green-900/20"><CheckCircle size={16} /> Mark as Completed</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;