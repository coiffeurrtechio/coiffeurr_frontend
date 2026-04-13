import React, { useEffect, useState } from "react";
import { 
    ArrowLeft, Calendar, Clock, MapPin, ChevronRight, 
    Star, X, Receipt, User as UserIcon, Scissors, Info 
} from "lucide-react";
import { useApi } from "../API/SalonsAPIs/ALLSalonAPI";
import { Badge } from "../components/ui_components/badge";
import { Loader } from "../components/ui_components/Loader";
import { usersalonApi } from "../API/SalonsAPIs/UserSalonAPI";

function BookingPage() {
    const { userapiRequest } = usersalonApi();
    const [bookingdata, setBookingData] = useState<any[]>([]);
    const [loading, setloading] = useState(false);
    
    // Modal State
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchAppointmentBookings();
    }, []);

    const fetchAppointmentBookings = async () => {
        try {
            setloading(true);
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const userid = parsedAuth?.user?.user?.id || parsedAuth?.user?.id;
            
            const res = await userapiRequest<any[]>(`/bookings/user/${userid}`);
            if (res?.data) setBookingData(res.data);
        } catch (error) {
            console.error("Error fetching user bookings:", error);
        } finally {
            setloading(false);
        }
    };

    const formatTo12Hour = (timeString: string) => {
        if (!timeString) return "";
        const [hour, minute] = timeString.split(":").map(Number);
        const ampm = hour >= 12 ? "PM" : "AM";
        const h = hour % 12 || 12;
        return minute === 0 ? `${h} ${ampm}` : `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
    };

    const getStatusStyles = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-blue-50 text-[#1E4D8C] border-blue-100';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-10">
            <Loader isVisible={loading} />

            <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => window.history.back()} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Appointment History</h1>
                    <div className="w-5" />
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* Status Summary */}
                <div className="flex gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
                    <div className="min-w-[140px] bg-[#1E4D8C] p-5 rounded-[2rem] shadow-lg shadow-blue-900/20 text-white">
                        <p className="text-[10px] opacity-70 uppercase font-black tracking-widest">Lifetime</p>
                        <p className="text-3xl font-black mt-1">{bookingdata.length}</p>
                    </div>
                    <div className="min-w-[140px] bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Active</p>
                        <p className="text-3xl font-black mt-1 text-slate-800">
                            {bookingdata.filter(b => b.status === 'PENDING').length}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {bookingdata.length > 0 ? (
                        bookingdata.map((booking, index) => (
                            <div
                                key={booking.id || index}
                                onClick={() => { setSelectedBooking(booking); setIsModalOpen(true); }}
                                className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer overflow-hidden"
                            >
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                                        <img 
                                            src={booking.serviceData?.imageUrl || 'https://via.placeholder.com/150'} 
                                            className="w-full h-full object-cover" 
                                            alt="service" 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-black text-slate-800 truncate pr-2">{booking.serviceData?.serviceName}</h3>
                                            <span className="font-black text-[#1E4D8C] whitespace-nowrap">₹{booking.price}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                            <span className="flex items-center gap-1"><Calendar size={12}/> {booking.slot?.date}</span>
                                            <span className="flex items-center gap-1"><Clock size={12}/> {formatTo12Hour(booking.slot?.time)}</span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <Badge className={`text-[9px] font-black px-3 py-1 rounded-full uppercase border ${getStatusStyles(booking.status)}`}>
                                                {booking.status}
                                            </Badge>
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1E4D8C] group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No Records Found</div>
                    )}
                </div>
            </main>

            {/* --- BOOKING DETAIL MODAL --- */}
            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)} />
                    
                    {/* Content */}
                    <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                        {/* Modal Header/Image */}
                        <div className="relative h-48 bg-slate-200">
                            <img 
                                src={selectedBooking.serviceData?.imageUrl} 
                                className="w-full h-full object-cover" 
                                alt="Service Banner" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
                            >
                                <X size={20} />
                            </button>
                            <div className="absolute bottom-6 left-8">
                                <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${getStatusStyles(selectedBooking.status)}`}>
                                    {selectedBooking.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Service Details */}
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedBooking.serviceData?.serviceName}</h2>
                                <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed line-clamp-2">
                                    {selectedBooking.serviceData?.description}
                                </p>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Calendar size={14} className="text-[#1E4D8C]" /> Date & Time
                                    </p>
                                    <p className="text-sm font-black text-slate-800">{selectedBooking.slot?.date}</p>
                                    <p className="text-xs font-bold text-slate-500 mt-0.5">{formatTo12Hour(selectedBooking.slot?.time)}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        {/* <Receipt size={14} className="text-[#1E4D8C]" />  */}
                                        Bill Amount
                                    </p>
                                    <p className="text-xl font-black text-[#1E4D8C]">₹{selectedBooking.price}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Inc. all taxes</p>
                                </div>
                            </div>

                            {/* Reference & Notes */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1E4D8C] shadow-sm">
                                            <UserIcon size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Customer</p>
                                            <p className="text-sm font-bold text-slate-700">{selectedBooking.userData?.username}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-mono text-slate-300">ID: {selectedBooking.id.slice(-6)}</p>
                                </div>

                                {selectedBooking.note && (
                                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <Info size={12} /> Appointment Note
                                        </p>
                                        <p className="text-xs font-bold text-amber-800 italic leading-relaxed">
                                            "{selectedBooking.note}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Booking Valid Till Info */}
                            <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.1em]">
                                Valid Through: {new Date(selectedBooking.validTill).toLocaleString()}
                            </p>

                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-full py-4 bg-[#1E4D8C] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookingPage;