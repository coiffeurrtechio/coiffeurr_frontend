import React, { useEffect, useState, useRef } from "react";
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
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;
    // Date Filter State
    const [selectedDate, setSelectedDate] = useState<string>('');
    const dateInputRef = useRef<HTMLInputElement>(null);
    // Upcoming Bookings State
    const [showUpcoming, setShowUpcoming] = useState(false);

    useEffect(() => {
        fetchAppointmentBookings();
    }, [currentPage, selectedDate, showUpcoming]);

    const fetchAppointmentBookings = async () => {
        try {
            setloading(true);
            const authData = localStorage.getItem("authState");
            const parsedAuth = authData ? JSON.parse(authData) : null;
            const userid = parsedAuth?.user?.user?.id || parsedAuth?.user?.id;

            let url = `/bookings/user/${userid}?page=${currentPage}&limit=${itemsPerPage}`;
            if (selectedDate) {
                url += `&date=${selectedDate}`;
            }
            if (showUpcoming) {
                url += `&upcoming=true`;
            }

            const res = await userapiRequest<any>(url);
            if (res?.data) {
                setBookingData(res.data.bookings || []);
                setTotalPages(res.data.pagination?.totalPages || 1);
            }
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
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen pb-10" style={{ backgroundColor: 'var(--soft-ivory)' }}>
            <Loader isVisible={loading} />

            <header className="sticky top-0 z-30 shadow-lg" style={{ background: 'linear-gradient(135deg, var(--deep-charcoal) 0%, var(--muted-gold) 100%)' }}>
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => window.history.back()} className="p-3 bg-white/20 rounded-full text-white backdrop-blur-md hover:bg-white/30 active:scale-90 transition-all shadow-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xs font-black tracking-[0.2em] text-white typography-display">{t('bookings.appointmentHistory')}</h1>
                    <div className="w-8" />
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* Status Summary */}
                <div className="mb-8 flex flex-col gap-5 px-2">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="appearance-none rounded-2xl px-6 py-4 pr-12 text-base font-bold outline-none transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-52 typography-label-light"
                                style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
                            >
                                <option value="ALL">{t('bookings.allBookings')}</option>
                                <option value="PENDING">{t('bookings.pending')}</option>
                                <option value="CONFIRMED">{t('bookings.confirmed')}</option>
                                <option value="COMPLETED">{t('bookings.completed')}</option>
                                <option value="CANCELLED">{t('bookings.cancelled')}</option>
                            </select>
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200" style={{ color: '#666' }} />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => dateInputRef.current?.showPicker?.()}
                                className={`p-4 rounded-2xl outline-none transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${selectedDate ? 'ring-2' : ''}`}
                                style={{ backgroundColor: 'var(--light-greige)', border: selectedDate ? '1px solid var(--muted-gold)' : '1px solid var(--light-greige)', boxShadow: 'var(--inset-shadow)' }}
                                title={selectedDate || 'Filter by date'}
                            >
                                <Calendar size={20} className={`transition-colors`} style={{ color: selectedDate ? 'var(--deep-charcoal)' : '#666' }} />
                            </button>
                            <input
                                ref={dateInputRef}
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {selectedDate && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDate('');
                                    }}
                                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg hover:shadow-xl transition-all hover:scale-110"
                                    style={{ background: 'linear-gradient(135deg, var(--deep-charcoal) 0%, var(--muted-gold) 100%)', color: 'white' }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setShowUpcoming(!showUpcoming);
                                setCurrentPage(1);
                            }}
                            className={`px-6 py-4 border rounded-2xl outline-none transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2.5 typography-label-light ${showUpcoming ? '' : ''}`}
                            style={{
                                background: showUpcoming ? 'linear-gradient(135deg, var(--deep-charcoal) 0%, var(--muted-gold) 100%)' : 'var(--light-greige)',
                                borderColor: showUpcoming ? 'var(--muted-gold)' : 'var(--light-greige)',
                                color: showUpcoming ? 'white' : 'var(--deep-charcoal)',
                                boxShadow: showUpcoming ? '0 4px 20px rgba(212, 175, 55, 0.3)' : 'var(--inset-shadow)'
                            }}
                            title="Show upcoming bookings"
                        >
                            <Star size={18} className={showUpcoming ? 'text-white fill-white' : ''} style={{ color: showUpcoming ? 'white' : '#666' }} />
                            <span className={`text-sm font-bold transition-colors typography-label-light`}>Upcoming</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {bookingdata.length > 0 ? (
                        bookingdata
                            .filter(b => filterStatus === 'ALL' || b.status === filterStatus)
                            .map((booking, index) => (
                                <div
                                    key={booking.id || index}
                                    onClick={() => fetchBookingDetails(booking.id)}
                                    className="floating-tile hover-lift p-3 transition-all duration-300 ease active:scale-[0.98] group cursor-pointer overflow-hidden"
                                >
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: 'linear-gradient(135deg, var(--muted-gold) 0%, var(--deep-charcoal) 100%)' }}>
                                            <img
                                                src={booking.serviceData?.imageUrl || 'https://via.placeholder.com/150'}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease"
                                                alt="service"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h3 className="font-black truncate pr-2 text-sm typography-display" style={{ color: 'var(--deep-charcoal)' }}>{booking.serviceData?.serviceName}</h3>
                                                <span className="font-black whitespace-nowrap text-base typography-number" style={{ color: 'var(--muted-gold)' }}>₹{booking.price}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider typography-label-light" style={{ color: '#666' }}>
                                                <span className="flex items-center gap-0.5"><Calendar size={10} style={{ color: '#666' }} /> {booking.slot?.date}</span>
                                                <span className="flex items-center gap-0.5"><Clock size={10} style={{ color: '#666' }} /> {formatTo12Hour(booking.slot?.time)}</span>
                                            </div>
                                            <div className="mt-1.5 flex items-center justify-between">
                                                <Badge className={`text-[8px] font-black px-2 py-0.5 rounded-full border shadow-sm ${getStatusStyles(booking.status)}`}>
                                                    {booking.status}
                                                </Badge>
                                                <div className="p-1.5 rounded-full transition-all duration-300" style={{ backgroundColor: 'var(--light-greige)' }}>
                                                    <ChevronRight size={14} className="transition-colors" style={{ color: '#666' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="py-20 text-center font-bold tracking-widest text-xs typography-label-light" style={{ color: '#666' }}>{t('bookings.noRecordsFound')}</div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-10 flex justify-center items-center gap-3">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-4 rounded-2xl typography-label-light disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
                        >
                            <ChevronDown size={20} className="rotate-90" />
                        </button>
                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-12 h-12 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl typography-label-light ${
                                        currentPage === page
                                            ? ''
                                            : ''
                                    }`}
                                    style={
                                        currentPage === page
                                            ? { background: 'linear-gradient(135deg, var(--deep-charcoal) 0%, var(--muted-gold) 100%)', color: 'white', boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)' }
                                            : { backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }
                                    }
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-4 rounded-2xl typography-label-light disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            style={{ backgroundColor: 'var(--light-greige)', border: '1px solid var(--light-greige)', color: 'var(--deep-charcoal)', boxShadow: 'var(--inset-shadow)' }}
                        >
                            <ChevronDown size={20} className="-rotate-90" />
                        </button>
                    </div>
                )}
            </main>

            {/* --- BOOKING DETAIL MODAL --- */}
            {/* --- BOOKING DETAIL MODAL --- */}
            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)} />

                    {/* Content */}
                    <div className="relative w-full max-w-lg rounded-t-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar floating-tile">

                        {/* Modal Header/Banner with Service Image */}
                        <div className="relative h-56 sm:h-64" style={{ background: 'linear-gradient(135deg, var(--muted-gold) 0%, var(--deep-charcoal) 100%)' }}>
                            <img
                                src={selectedBooking.service?.imageUrl || selectedBooking.salon?.logoUrl}
                                className="w-full h-full object-cover"
                                alt="Service"
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 active:scale-90 transition-all z-20 shadow-xl"
                            >
                                <X size={20} className="sm:size-[22px]" />
                            </button>

                            <div className="absolute bottom-6 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-8 z-10 flex flex-col sm:flex-row justify-between items-end gap-3">
                                <div className="flex-1">
                                    <Badge className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest shadow-2xl border-none ${getStatusStyles(selectedBooking.status)}`}>
                                        {selectedBooking.statusLabel || selectedBooking.status}
                                    </Badge>
                                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-2 sm:mt-3 typography-display">{selectedBooking.service?.name}</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl sm:text-4xl font-black text-white typography-number">₹{selectedBooking.price}</p>
                                    <p className="text-[9px] sm:text-[10px] font-bold text-white/80 tracking-widest typography-label-light">{t('bookings.totalAmount')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">

                            {/* Included Items Tags */}
                            {selectedBooking.service?.includedItems?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedBooking.service.includedItems.map((item: string, idx: number) => (
                                        <span key={idx} className="px-3 py-1.5 sm:px-4 sm:py-2 text-[9px] sm:text-[10px] font-black rounded-xl border shadow-sm typography-label-light" style={{ backgroundColor: 'var(--light-greige)', borderColor: 'var(--light-greige)', color: 'var(--deep-charcoal)' }}>
                                            ✓ {item}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Info Grid: Date, Time & Staff with Image */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border shadow-lg floating-tile" style={{ backgroundColor: 'var(--light-greige)', borderColor: 'var(--light-greige)' }}>
                                    <p className="text-[9px] sm:text-[10px] font-black tracking-widest mb-3 sm:mb-4 flex items-center gap-2 typography-label-light" style={{ color: '#666' }}>
                                        <Calendar size={14} className="sm:size-16" style={{ color: '#666' }} /> {t('bookings.schedule')}
                                    </p>
                                    <p className="text-sm sm:text-base font-black typography-display" style={{ color: 'var(--deep-charcoal)' }}>{selectedBooking.slot?.date}</p>
                                    <p className="text-xs sm:text-sm font-bold mt-1 typography-label-light" style={{ color: '#666' }}>{formatTo12Hour(selectedBooking.slot?.time)}</p>
                                    <p className="text-[9px] sm:text-[10px] font-bold mt-2 tracking-wider typography-label-light" style={{ color: '#666' }}>{selectedBooking.slot?.duration} {t('bookings.minutesSession')}</p>
                                </div>

                                <div className="p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border shadow-lg floating-tile" style={{ backgroundColor: 'var(--light-greige)', borderColor: 'var(--light-greige)' }}>
                                    <p className="text-[9px] sm:text-[10px] font-black tracking-widest mb-3 sm:mb-4 flex items-center gap-2 typography-label-light" style={{ color: '#666' }}>
                                        <User size={14} className="sm:size-16" style={{ color: '#666' }} /> {t('bookings.specialist')}
                                    </p>
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <img
                                            src={selectedBooking.staff?.imageUrl}
                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-3 border-white shadow-lg"
                                            alt="Staff"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm sm:text-base font-black typography-display" style={{ color: 'var(--deep-charcoal)' }}>{selectedBooking.staff?.name}</p>
                                            <div className="flex items-center gap-1.5">
                                                <Star size={10} className="sm:size-12" style={{ fill: 'var(--muted-gold)', color: 'var(--muted-gold)' }} />
                                                <span className="text-[9px] sm:text-[10px] font-bold typography-label-light" style={{ color: '#666' }}>{selectedBooking.staff?.rating?.average} ({selectedBooking.staff?.experienceYears}{t('bookings.yearsExp')})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Salon Card with Logo */}
                            <div className="p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] text-white space-y-4 sm:space-y-5 shadow-2xl" style={{ background: 'linear-gradient(135deg, var(--deep-charcoal) 0%, var(--muted-gold) 100%)' }}>
                                <div className="flex items-center gap-3 sm:gap-5 border-b border-white/10 pb-4 sm:pb-5">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl p-1.5 shrink-0 overflow-hidden shadow-lg">
                                        <img src={selectedBooking.salon?.logoUrl} className="w-full h-full object-contain" alt="Salon Logo" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[8px] sm:text-[9px] font-black text-white/50 tracking-[0.2em] typography-label-light">{t('bookings.studio')}</p>
                                        <h4 className="text-sm sm:text-base font-black tracking-tight truncate typography-display">{selectedBooking.salon?.name}</h4>
                                    </div>
                                    <a
                                        href={selectedBooking.salon?.directionsUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95 shrink-0"
                                    >
                                        <Navigation size={18} className="sm:size-20 text-white" />
                                    </a>
                                </div>
                                <div className="flex gap-3 sm:gap-4">
                                    <MapPin size={16} className="sm:size-18 text-slate-400 shrink-0" />
                                    <p className="text-[10px] sm:text-[11px] font-medium leading-relaxed opacity-90 typography-label-light">
                                        {selectedBooking.salon?.address?.street}, {selectedBooking.salon?.address?.city}, {selectedBooking.salon?.address?.state} - {selectedBooking.salon?.address?.pincode}
                                    </p>
                                </div>
                            </div>

                            {/* Customer Row */}
                            <div className="p-4 sm:p-5 rounded-[2rem] sm:rounded-[2.5rem] border flex items-center justify-between shadow-lg floating-tile" style={{ backgroundColor: 'var(--light-greige)', borderColor: 'var(--light-greige)' }}>
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-base sm:text-lg shadow-lg shrink-0" style={{ background: 'linear-gradient(135deg, var(--deep-charcoal) 0%, var(--muted-gold) 100%)', color: 'white' }}>
                                        {selectedBooking.user?.name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[8px] sm:text-[9px] font-black tracking-widest typography-label-light" style={{ color: '#666' }}>{t('bookings.bookedBy')}</p>
                                        <p className="text-sm sm:text-base font-black truncate typography-display" style={{ color: 'var(--deep-charcoal)' }}>{selectedBooking.user?.name}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0 ml-2">
                                    <p className="text-[8px] sm:text-[9px] font-black tracking-widest typography-label-light" style={{ color: '#666' }}>{t('bookings.contact')}</p>
                                    <p className="text-xs sm:text-sm font-bold typography-label-light" style={{ color: '#666' }}>{selectedBooking.user?.phone}</p>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 space-y-4">
                                <p className="text-center text-[9px] font-bold tracking-[0.2em] typography-label-light" style={{ color: '#666' }}>
                                    Booking ID: {selectedBooking.bookingId}
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full py-5 text-white rounded-[2rem] font-black text-xs tracking-[0.2em] shadow-xl hover:shadow-2xl active:scale-95 transition-all typography-label-light"
                                    style={{ background: 'linear-gradient(135deg, var(--deep-charcoal) 0%, var(--muted-gold) 100%)' }}
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