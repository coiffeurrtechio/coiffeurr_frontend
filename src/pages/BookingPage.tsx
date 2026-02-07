import React, { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, MapPin, ChevronRight, Star } from "lucide-react";
import { useApi } from "../API/SalonsAPIs/ALLSalonAPI";
import type { BookingResponse } from "../Interfaces/BookingInterface";
import { Badge } from "../components/ui_components/badge";
import { Loader } from "../components/ui_components/Loader";

function BookingPage() {
    const { apiRequest } = useApi();
    const [bookingdata, setBookingData] = useState<BookingResponse[]>([]);
    const [loading, setloading] = useState(false);

    useEffect(() => {
        fetchAppointmentBookings();
    }, []);

    const fetchAppointmentBookings = async () => {
        try {
            setloading(true);
            const res = await apiRequest<BookingResponse[]>("/salon/appointments");
            if (res?.data) setBookingData(res.data);
        } catch (error) {
            console.error("Error fetching user bookings:", error);
        } finally {
            setloading(false);
        }
    };

    const formatAppointment = (isoString: string) => {
        const d = new Date(isoString);
        return {
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            fullDate: d.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
            time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
        };
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
            <Loader isVisible={loading} />

            {/* --- Minimalist User Header --- */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => window.history.back()}
                        className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <h1 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-800">My Appointments</h1>
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-[#1E4D8C]" />
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                
                {/* --- Quick Status Cards --- */}
                <div className="flex gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
                    <div className="min-w-[140px] bg-[#1E4D8C] p-4 rounded-2xl shadow-sm text-white">
                        <p className="text-[10px] opacity-80 uppercase font-bold tracking-wider">Total Visits</p>
                        <p className="text-2xl font-semibold mt-1">{bookingdata.length}</p>
                    </div>
                    <div className="min-w-[140px] bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pending</p>
                        <p className="text-2xl font-semibold mt-1 text-slate-700">
                            {bookingdata.filter(b => b.status === 'pending').length}
                        </p>
                    </div>
                </div>

                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Timeline</h2>

                {/* --- Elegant Booking List --- */}
                <div className="space-y-4">
                    {bookingdata.length > 0 ? (
                        bookingdata.map((booking, index) => {
                            const { date, fullDate, time } = formatAppointment(booking.appointmentDate);
                            const isConfirmed = booking.status.toLowerCase() === 'confirmed';

                            return (
                                <div 
                                    key={index}
                                    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                                >
                                    {/* Status Accent Bar */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isConfirmed ? 'bg-green-400' : 'bg-[#1E4D8C]'}`} />

                                    <div className="flex justify-between items-start">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className={`text-[9px] font-bold px-2 py-0.5 rounded-md border-none ${
                                                    isConfirmed ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-[#1E4D8C]'
                                                }`}>
                                                    {booking.status.toUpperCase()}
                                                </Badge>
                                                <span className="text-xs text-slate-300">#BK-00{index + 1}</span>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">{booking.serviceName}</h3>
                                                <div className="flex items-center gap-1 text-slate-400 mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="text-xs font-medium">Main Street Salon Suite</span>
                                                </div>
                                            </div>

                                            <div className="pt-2 flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-slate-50 rounded-lg">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-600">{date}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-slate-50 rounded-lg">
                                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-600">{time}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end justify-between h-full min-h-[100px]">
                                            <span className="text-lg font-bold text-slate-900">₹{booking.price}</span>
                                            <button className="text-[#1E4D8C] p-2 hover:bg-blue-50 rounded-xl transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium">You have no upcoming bookings.</p>
                            <button className="mt-4 text-sm font-bold text-[#1E4D8C]">Book an Appointment</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default BookingPage;