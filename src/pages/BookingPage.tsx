import React, { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useApi } from "../API/SalonsAPIs/ALLSalonAPI";
import type { BookingResponse } from "../Interfaces/BookingInterface";
import { Badge } from "../components/ui_components/badge";
import { Loader } from "../components/ui_components/Loader";

function BookingPage() {
    const { apiRequest } = useApi();
    const [bookingdata, setBookingData] = useState<BookingResponse[]>([]);
    const [loading, setloading] = useState(false)

    useEffect(() => {
        fetchAppointmentBookings();
    }, []);

    const fetchAppointmentBookings = async () => {
        try {
            setloading(true);
            const res = await apiRequest<BookingResponse[]>("/salon/appointments");
            if (res?.data) {
                setBookingData(res.data);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
        finally {
            setloading(false)
        }
    };

    /* ---------- Date & Time Formatter ---------- */
    function formatAppointment(isoString: string) {
        const dateObj = new Date(isoString);

        const date = dateObj.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

        const time = dateObj.toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });

        return { date, time };
    }

    /* ---------- Status Badge Color ---------- */
    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case "confirmed":
                return "border-green-500 text-green-600";
            case "cancelled":
                return "border-red-500 text-red-600";
            case "pending":
                return "border-yellow-500 text-yellow-600";
            default:
                return "border-border text-muted-foreground";
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Loader isVisible={loading} />

            {/* ---------- Sticky Header ---------- */}
            <div className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b">
                <div className="flex items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center h-9 w-9 rounded-full bg-muted hover:bg-muted/80 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div>
                        <h1 className="text-base font-semibold leading-tight">
                            Your Bookings
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Manage your appointments
                        </p>
                    </div>
                </div>
            </div>

            {/* ---------- Booking List ---------- */}
            <div className="px-4 py-4">
                {bookingdata.length > 0 ? (
                    <div className="bg-card rounded-xl border overflow-hidden">
                        {bookingdata.map((booking, index) => {
                            const { date, time } = formatAppointment(
                                booking.appointmentDate
                            );

                            return (
                                <div key={index}>
                                    <div className="px-4 py-4 flex items-start justify-between hover:bg-muted/40 active:bg-muted/60 transition cursor-pointer">
                                        {/* Left */}
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium">
                                                {booking.serviceName}
                                            </h4>

                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Appointment booked
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {time}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right */}
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] capitalize ${getStatusStyle(
                                                    booking.status
                                                )}`}
                                            >
                                                {booking.status}
                                            </Badge>
                                            <span className="text-sm font-semibold">
                                                ₹{booking.price}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    {index !== bookingdata.length - 1 && (
                                        <div className="h-px bg-border mx-4" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ---------- Empty State ---------- */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-sm font-medium">No bookings yet</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Your upcoming appointments will appear here
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookingPage;
