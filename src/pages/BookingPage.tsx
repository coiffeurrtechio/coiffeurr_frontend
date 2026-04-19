import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Calendar, Clock, MapPin, ChevronRight,
    Star, X, Receipt, User as UserIcon, Scissors, Info,
    ChevronDown,
    User,
    Navigation
} from "lucide-react";
import { useApi } from "../API/SalonsAPIs/ALLSalonAPI";
import { Badge } from "../components/ui_components/badge";
import { Loader } from "../components/ui_components/Loader";
import { usersalonApi } from "../API/SalonsAPIs/UserSalonAPI";
import { useToast } from "../components/Toast";

function BookingPage() {
    const { t } = useTranslation();
    const { userapiRequest } = usersalonApi();
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [bookingdata, setBookingData] = useState<any[]>([]);
    const [loading, setloading] = useState(false);
    const { showToast } = useToast();
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


    const fetchBookingDetails = async (bookingId: string) => {
        setloading(true);
        try {
            // Assuming apiSalonRequest is your helper that handles baseURL and Auth
            const res = await userapiRequest<any>(`/bookings/${bookingId}/details`);

            if (res.data) {
                setSelectedBooking(res.data);
                setIsModalOpen(true);
            } else {
                showToast({
                    type: 'error',
                    title: t('bookings.error'),
                    message: res.error || t('bookings.failedToFetchDetails')
                });
            }
        } catch (error) {
            console.error("Detail fetch error:", error);
            showToast({ type: 'error', title: t('bookings.networkError'), message: t('bookings.couldNotConnect') });
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
                    <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">{t('bookings.appointmentHistory')}</h1>
                    <div className="w-5" />
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* Status Summary */}
                <div className="mb-6 flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('bookings.filterBookings')}</label>
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-white border border-slate-100 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="ALL">{t('bookings.allBookings')}</option>
                            <option value="PENDING">{t('bookings.pending')}</option>
                            <option value="CONFIRMED">{t('bookings.confirmed')}</option>
                            <option value="COMPLETED">{t('bookings.completed')}</option>
                            <option value="CANCELLED">{t('bookings.cancelled')}</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="space-y-4">
                    {bookingdata.length > 0 ? (
                        bookingdata
                            .filter(b => filterStatus === 'ALL' || b.status === filterStatus) // Filter logic
                            .map((booking, index) => (
                                <div
                                    key={booking.id || index}
                                    // onClick={() => { setSelectedBooking(booking); setIsModalOpen(true); }}
                                    onClick={() => fetchBookingDetails(booking.id)}
                                    className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group cursor-pointer overflow-hidden"
                                >
                                    {/* ... rest of your mapping code remains exactly same ... */}
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
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {booking.slot?.date}</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {formatTo12Hour(booking.slot?.time)}</span>
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
                        <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">{t('bookings.noRecordsFound')}</div>
                    )}
                </div>
            </main>

            {/* --- BOOKING DETAIL MODAL --- */}
            {/* --- BOOKING DETAIL MODAL --- */}
            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)} />

                    {/* Content */}
                    <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">

                        {/* Modal Header/Banner with Service Image */}
                        <div className="relative h-56 bg-slate-200">
                            <img
                                src={selectedBooking.service?.imageUrl || selectedBooking.salon?.logoUrl}
                                className="w-full h-full object-cover"
                                alt="Service"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all z-20"
                            >
                                <X size={20} />
                            </button>

                            <div className="absolute bottom-6 left-8 right-8 z-10 flex justify-between items-end">
                                <div>
                                    <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border-none ${getStatusStyles(selectedBooking.status)}`}>
                                        {selectedBooking.statusLabel || selectedBooking.status}
                                    </Badge>
                                    <h2 className="text-2xl font-black text-white tracking-tight mt-2">{selectedBooking.service?.name}</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-white">₹{selectedBooking.price}</p>
                                    <p className="text-[10px] font-bold text-white/70 uppercase">{t('bookings.totalAmount')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">

                            {/* Validity Alert */}
                            {selectedBooking.status === "PENDING" && (
                                <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex items-center gap-3">
                                    <Clock size={16} className="text-amber-600" />
                                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">
                                        {t('bookings.expiresOn')} {new Date(selectedBooking.validTill).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {/* Included Items Tags */}
                            {selectedBooking.service?.includedItems?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedBooking.service.includedItems.map((item: string, idx: number) => (
                                        <span key={idx} className="px-3 py-1 bg-blue-50 text-[#1E4D8C] text-[9px] font-black uppercase rounded-lg border border-blue-100">
                                            ✓ {item}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Info Grid: Date, Time & Staff with Image */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Calendar size={14} className="text-[#1E4D8C]" /> {t('bookings.schedule')}
                                    </p>
                                    <p className="text-sm font-black text-slate-800">{selectedBooking.slot?.date}</p>
                                    <p className="text-xs font-bold text-slate-500 mt-0.5">{formatTo12Hour(selectedBooking.slot?.time)}</p>
                                    <p className="text-[10px] font-bold text-[#1E4D8C] mt-1 uppercase tracking-tighter">{selectedBooking.slot?.duration} {t('bookings.minutesSession')}</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <User size={14} className="text-[#1E4D8C]" /> {t('bookings.specialist')}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={selectedBooking.staff?.imageUrl}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                            alt="Staff"
                                        />
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{selectedBooking.staff?.name}</p>
                                            <div className="flex items-center gap-1">
                                                <Star size={10} className="fill-orange-400 text-orange-400" />
                                                <span className="text-[10px] font-bold text-slate-500">{selectedBooking.staff?.rating?.average} ({selectedBooking.staff?.experienceYears}{t('bookings.yearsExp')})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Salon Card with Logo */}
                            <div className="p-5 bg-slate-900 rounded-[2.5rem] text-white space-y-4 shadow-xl">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl p-1 shrink-0 overflow-hidden">
                                        <img src={selectedBooking.salon?.logoUrl} className="w-full h-full object-contain" alt="Salon Logo" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">{t('bookings.studio')}</p>
                                        <h4 className="text-sm font-black tracking-tight">{selectedBooking.salon?.name}</h4>
                                    </div>
                                    <a
                                        href={selectedBooking.salon?.directionsUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                                    >
                                        <Navigation size={18} className="text-white" />
                                    </a>
                                </div>
                                <div className="flex gap-3">
                                    <MapPin size={16} className="text-blue-400 shrink-0" />
                                    <p className="text-[11px] font-medium leading-relaxed opacity-80">
                                        {selectedBooking.salon?.address?.street}, {selectedBooking.salon?.address?.city}, {selectedBooking.salon?.address?.state} - {selectedBooking.salon?.address?.pincode}
                                    </p>
                                </div>
                            </div>

                            {/* Customer Row */}
                            <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-[#1E4D8C] font-black text-xs">
                                        {selectedBooking.user?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase">{t('bookings.bookedBy')}</p>
                                        <p className="text-sm font-black text-slate-800">{selectedBooking.user?.name}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">{t('bookings.contact')}</p>
                                    <p className="text-xs font-bold text-slate-700">{selectedBooking.user?.phone}</p>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-2 space-y-3">
                                <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                                    {t('bookings.transactionId')} {selectedBooking.referenceId}
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full py-4 bg-[#1E4D8C] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                                >
                                    {t('bookings.closeDetails')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookingPage;