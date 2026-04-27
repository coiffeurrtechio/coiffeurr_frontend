import React, { useEffect, useState } from "react";
import {
  Star, Clock, Heart, Check, X,
  ArrowLeft, Loader2, Calendar, User
} from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

// UI Components
import { Button } from "../../components/ui_components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui_components/card";
import { Badge } from "../../components/ui_components/badge";
import { BookingLoader } from "../../components/ui_components/BookingLoader";
import { BookingRequestSuccess } from "../../components/Loaders/BookingRequestSuccess";

// API & Interfaces
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";
import { usersalonApi } from "../../API/SalonsAPIs/UserSalonAPI";

const SalonService: React.FC = () => {
  const navigate = useNavigate();
  const { salonId, serviceId } = useParams();
  const { apiRequest, apiCustomerpiPost } = useApi();
  const { userapiPost } = usersalonApi();

  const location = useLocation();
  const service = location.state?.serviceData;

  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingrequestsend, setbookingrequestsend] = useState(false);
  const [bookingrequestsuccess, setbookingrequestsuccess] = useState(false);
  const [isEditModalOpen, setisEditModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  const [salonservicedata, setsalonservicedata] = useState<any>(service);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  // Reviews State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    reviewText: "",
    targetType: "service"
  });

  const authState = localStorage.getItem("authState");
  const parsedUser = authState ? JSON.parse(authState) : null;
  const isloggedin = parsedUser?.isAuthenticated;

  // --- Logic for Next 10 Days ---
  const nextTenDays = [...Array(10)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  // --- MAIN PAGE SELECTION STATE ---
  const [mainPageSelectedStaffId, setMainPageSelectedStaffId] = useState<string>("");
  const [mainPageSelectedDate, setMainPageSelectedDate] = useState<string>(nextTenDays[0]);
  const [mainPageSelectedTime, setMainPageSelectedTime] = useState<string>("");
  const [mainPageSelectedSlotTime, setMainPageSelectedSlotTime] = useState<string>("");

  useEffect(() => {
    fetchService();
    // Restore booking state if user was redirected from login
    const pendingState = sessionStorage.getItem('pendingBookingState');
    if (pendingState) {
      try {
        const state = JSON.parse(pendingState);
        if (state.salonId === salonId && state.serviceId === serviceId) {
          setMainPageSelectedStaffId(state.mainPageSelectedStaffId);
          setMainPageSelectedDate(state.mainPageSelectedDate);
          setMainPageSelectedTime(state.mainPageSelectedTime);
          setMainPageSelectedSlotTime(state.mainPageSelectedSlotTime);
          // Clear the saved state after restoring
          sessionStorage.removeItem('pendingBookingState');
        }
      } catch (error) {
        console.error('Error restoring booking state:', error);
      }
    }
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (mainPageSelectedDate) {
      fetchAvailableSlots(mainPageSelectedDate);
    }
  }, [mainPageSelectedDate]);

  const fetchAvailableSlots = async (date: string) => {
    try {
      const res = await apiRequest(`/salons/${salonId}/slots?date=${date}&service_id=${serviceId}`);
      if (res?.data?.slots) {
        setAvailableSlots(res.data.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      setAvailableSlots([]);
    }
  };

  // Format time from "10:00" to "10:00 AM"
  const formatTimeTo12Hour = (timeString: string) => {
    const [hour, minute] = timeString.split(':').map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return minute === 0 ? `${h} ${ampm}` : `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const fetchService = async () => {
    try {
      const res = await apiRequest(`/salons/${salonId}/services/${serviceId}`);
      if (res.data) setsalonservicedata(res.data);
    } catch (error) { console.error(error); }
  };

  const handlePostReview = async () => {
    if (!reviewData.reviewText.trim()) return alert("Please write a review.");
    setIsReviewSubmitting(true);
    setReviewError(null);
    try {
      const payload = {
        rating: reviewData.rating,
        reviewText: reviewData.reviewText,
        targetType: "SERVICE",
        targetId: serviceId
      };
      const res = await userapiPost<any>(`/reviews`, payload);

      if (res.status === 400 || res?.error) {
        setReviewError(res?.data?.detail || "An unexpected error occurred.");
        return;
      }

      if (res.data) {
        setReviewData({ ...reviewData, reviewText: "", rating: 5 });
        setIsReviewModalOpen(false);
      }
    } catch (error: any) {
      setReviewError(error.response?.data?.detail || "Review failed.");
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    // Save booking state before redirecting to login
    sessionStorage.setItem('pendingBookingState', JSON.stringify({
      salonId,
      serviceId,
      mainPageSelectedStaffId,
      mainPageSelectedDate,
      mainPageSelectedTime,
      mainPageSelectedSlotTime,
      returnUrl: location.pathname
    }));
    setShowLoginRequiredModal(false);
    navigate("/login");
  };

  const BookAppointment = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (!isloggedin) {
      setShowLoginRequiredModal(true);
      return;
    }

    if (!mainPageSelectedDate || !mainPageSelectedSlotTime || !mainPageSelectedStaffId) {
      alert("Please select a Stylist, Date and Time slot.");
      return;
    }

    try {
      setbookingrequestsend(true);
      const userid = parsedUser?.user?.user?.id || parsedUser?.user?.id;

      // Ensure all values are properly stringified for iOS compatibility
      const userIdString = String(userid || "");
      const salonIdString = String(salonId || "");
      const serviceIdString = String(salonservicedata?.service_id || serviceId || "");
      const staffIdString = String(mainPageSelectedStaffId || "");
      const dateString = String(mainPageSelectedDate || "");
      const timeString = String(mainPageSelectedSlotTime || "");
      const priceNumber = Number(salonservicedata?.price || 0) || 0;

      // Ensure no undefined/null values in request body
      const data = {
        userId: userIdString,
        salonId: salonIdString,
        service_id: serviceIdString,
        staffId: staffIdString,
        slot: {
          date: dateString,
          time: timeString
        },
        price: priceNumber,
      };

      console.log("Booking Data:", data); // Debug log for iOS troubleshooting

      const res = await apiCustomerpiPost(`/bookings/`, data);

      console.log("Booking Response:", res); // Debug log

      if (!res?.error) {
        setisEditModalOpen(false);
        setbookingrequestsuccess(true);
        setTimeout(() => {
          setbookingrequestsuccess(false);
          navigate("/bookings");
        }, 2000);
      } else {
        alert(res?.error || "Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setbookingrequestsend(false);
    }
  };

  const toggleWishlist = async () => {
    if (!isloggedin) {
      navigate("/login");
      return;
    }

    const userId = parsedUser?.user?.user?.id || parsedUser?.user?.id;
    const newFavoriteStatus = !isFavorite;

    // Optimistic UI update
    setIsFavorite(newFavoriteStatus);

    try {
      // API Format: wishlist/{userId}/{salonId}
      const res = await userapiPost(`/wishlist/${userId}/${salonId}`, {
        // If your API requires a body, add it here; 
        // otherwise, the URL parameters handle the identification.
        serviceId: serviceId
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      // Show the notification
      setNotification({
        message: "Added to wishlist" ,
        type: 'success'
      });

      // Auto-hide after 3 seconds
      setTimeout(() => setNotification(null), 3000);

      console.log("Wishlist updated successfully");
    } catch (error) {
      console.error("Wishlist sync failed:", error);
      // Rollback UI state if the request fails
      setIsFavorite(!newFavoriteStatus);
      alert("Could not update wishlist. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-100">

      {/* --- Floating Notification --- */}
      {notification && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 bg-white border-l-4 ${notification.type === 'success' ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}>
          {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
          <span className="text-sm font-bold uppercase tracking-wider">{notification.message}</span>
        </div>
      )}

      {/* --- Minimal Header --- */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Service Curated</span>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist();
              }}
              className="p-2 hover:bg-slate-50 rounded-full transition-all group"
            >
              <Heart
                className={`w-5 h-5 transition-all duration-300 ${isFavorite
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-slate-300 group-hover:text-slate-600"
                  }`}
              />
            </button>          </div>
        </div>
      </nav>

      <div className="pt-16 lg:pt-0 grid grid-cols-1 lg:grid-cols-2 min-h-screen">

        {/* --- Left Hero Section --- */}
        <section className="relative h-[50vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden bg-slate-100">
          <img src={salonservicedata?.imageUrl} alt="Service Detail" className="w-full h-full object-cover" />
          <div className="absolute bottom-10 left-10 z-10 hidden lg:block">
            <Badge className="bg-white/20 backdrop-blur-lg border-none text-white text-[10px] tracking-[0.2em] px-4 py-2 uppercase font-black">
              Premium Quality Assured
            </Badge>
          </div>
        </section>

        {/* --- Right Content Section --- */}
        <section className="px-6 py-12 lg:px-10 lg:py-32 overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-12">

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-light tracking-tight text-balance leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                {salonservicedata?.serviceName || "Luxury Experience"}
              </h1>
              <div className="flex items-center gap-4 text-sm bg-slate-50 border border-slate-100 rounded-full px-6 py-3 inline-flex">
                <span className="text-2xl font-light text-slate-900 self-center" style={{ fontFamily: 'Playfair Display, serif' }}>₹{salonservicedata?.price}</span>
                <div className="h-4 w-px bg-slate-300" />
                <div className="flex items-center gap-2 text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>{salonservicedata?.durationMinutes} MINS</span>
                </div>
                <div className="h-4 w-px bg-slate-300" />
                <span className="text-slate-600 font-bold uppercase text-[10px] tracking-widest">PREMIUM QUALITY</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* --- NEW: Staff Display on Main Page --- */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#888888]">1. Choose Your Professional</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 relative after:absolute after:right-0 after:top-0 after:bottom-4 after:w-8 after:bg-gradient-to-l after:from-white after:to-transparent">
                {salonservicedata?.staff?.map((person: any, index: number) => {
                  const isSelected = mainPageSelectedStaffId === person.staff_id;
                  return (
                    <div
                      key={person.staff_id}
                      className={`relative flex flex-col items-center min-w-[140px] p-4 bg-white border rounded-2xl shadow-sm transition-all duration-300 cursor-pointer group animate-in slide-in-from-bottom-4 fade-in duration-500
                        ${isSelected 
                          ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-lg scale-105 shadow-[#D4AF37]/20" 
                          : "border-slate-100 hover:border-slate-200 hover:shadow-lg"}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setMainPageSelectedStaffId(person.staff_id)}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg z-10">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="relative mb-3">
                        <img
                          src={person.image_url || "/placeholder-user.png"}
                          alt={person.name}
                          className="w-24 h-28 object-cover rounded-xl ring-1 ring-slate-100 transition-all duration-300"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 text-center capitalize mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {person.name}
                      </h4>
                      {!isSelected && (
                        <div className="flex items-center gap-1">
                          <Star size={10} className="fill-orange-400 text-orange-400" />
                          <span className="text-[10px] font-bold text-slate-600">{person.rating?.average || "5.0"}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {mainPageSelectedStaffId && (
                <div className="text-center py-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm text-slate-600 italic font-light" style={{ fontFamily: 'Playfair Display, serif' }}>
                    You've chosen {salonservicedata?.staff?.find((s: any) => s.staff_id === mainPageSelectedStaffId)?.name}'s expertise
                  </p>
                </div>
              )}
            </div>

            {/* --- Date Selection on Main Page --- */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#888888]">2. Choose Your Date</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
                {nextTenDays.map((dateStr, index) => {
                  const date = new Date(dateStr);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNumber = date.getDate();
                  const isSelected = mainPageSelectedDate === dateStr;
                  return (
                    <button
                      key={index}
                      onClick={() => setMainPageSelectedDate(dateStr)}
                      className={`flex flex-col items-center justify-center min-w-[70px] h-20 transition-all border rounded-xl
                        ${isSelected 
                          ? "bg-[#1a1a1a] border-[#1a1a1a] text-[#D4AF37] shadow-lg scale-105" 
                          : "bg-white/60 backdrop-blur-sm border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md"}`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">{dayName}</span>
                      <span className="text-2xl font-light">{dayNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- Time Selection on Main Page --- */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#888888]">3. Choose Your Time</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot: any, index: number) => {
                    const isAvailable = slot?.availableCapacity > 0;
                    const formattedTime = formatTimeTo12Hour(slot.time);
                    const isSelected = mainPageSelectedTime === formattedTime;
                    return (
                      <button
                        key={index}
                        disabled={!isAvailable}
                        onClick={() => {
                          setMainPageSelectedTime(formattedTime);
                          setMainPageSelectedSlotTime(slot.time);
                        }}
                        className={`px-4 py-2 lg:px-6 lg:py-3 text-[10px] lg:text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 whitespace-nowrap
                          ${!isAvailable 
                            ? "opacity-20 cursor-not-allowed bg-slate-100 text-slate-400" 
                            : isSelected 
                              ? "bg-slate-900 text-white shadow-lg scale-105" 
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                      >
                        {formattedTime}
                      </button>
                    );
                  })
                ) : (
                  <div className="w-full text-center py-8 text-slate-400 text-sm italic">
                    Select a date to see available time slots
                  </div>
                )}
              </div>
            </div>

            {/* --- Included Items (Conditional) --- */}
            {salonservicedata?.includedItems?.length > 0 && (
              <div className="bg-slate-50 p-8 rounded-none border-l-4 border-slate-900">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6">Included in Package</h3>
                <ul className="space-y-4">
                  {salonservicedata?.includedItems?.map((item: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <Check className="w-4 h-4 text-slate-900 mt-1 shrink-0" />
                      <span className="text-sm text-slate-600 font-light group-hover:text-black transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-8 pb-32">
              {/* --- Description (THE EXPERIENCE) - Moved to bottom --- */}
              <div className="space-y-2 pt-8 border-t border-slate-100">
                <h3 className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400">The Experience</h3>
                <p className="text-xs text-slate-500 font-light leading-relaxed italic" style={{ fontFamily: 'Playfair Display, serif' }}>
                  A signature session tailored to your unique aesthetic.
                </p>
              </div>
            </div>

            {/* --- Scroll Indicator --- */}
            {(!mainPageSelectedStaffId || !mainPageSelectedDate || !mainPageSelectedSlotTime) && (
              <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-bounce">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Scroll to continue</span>
                  <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center pt-2">
                    <div className="w-1 h-2 bg-slate-400 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>
      </div>

      {/* --- BOOKING MODAL (Confirmation Only) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setisEditModalOpen(false)} />
          <BookingLoader isVisible={bookingrequestsend} salonName={salonservicedata?.salonName} />

          <Card className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] lg:rounded-[2rem] border-none shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <CardHeader className="p-8 pb-6 border-b border-slate-100">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-2">
                  <Calendar className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <CardTitle className="text-3xl font-light tracking-tight text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Confirm Booking
                </CardTitle>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#888888]">
                  Review your appointment details
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">

              {/* BOOKING SUMMARY */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Professional</p>
                      <p className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {salonservicedata?.staff?.find((s: any) => s.staff_id === mainPageSelectedStaffId)?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Date</p>
                      <p className="text-sm font-bold text-slate-900">
                        {new Date(mainPageSelectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Time</p>
                      <p className="text-sm font-bold text-slate-900">{mainPageSelectedTime}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Total Amount</p>
                    <p className="text-2xl font-light text-white" style={{ fontFamily: 'Playfair Display, serif' }}>₹{salonservicedata?.price}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={BookAppointment}
                className="w-full h-16 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
              >
                Confirm Appointment
              </Button>

              <p className="text-center text-[10px] text-slate-400 italic" style={{ fontFamily: 'Playfair Display, serif' }}>
                A signature session tailored to your unique aesthetic.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- REVIEW MODAL --- */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800">Rate Service</h3>
              <button onClick={() => { setIsReviewModalOpen(false); setReviewError(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            {reviewError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-black uppercase text-red-600 tracking-wider">
                {reviewError}
              </div>
            )}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={36}
                  className={`cursor-pointer transition-all ${star <= reviewData.rating ? "fill-orange-400 text-orange-400 scale-110" : "text-gray-100"}`}
                  onClick={() => { setReviewData({ ...reviewData, rating: star }); setReviewError(null); }}
                />
              ))}
            </div>
            <textarea
              disabled={isReviewSubmitting}
              className="w-full p-5 bg-gray-50 border-none rounded-3xl text-sm outline-none focus:ring-4 focus:ring-blue-50 min-h-[140px]"
              placeholder="How was your experience?"
              value={reviewData.reviewText}
              onChange={(e) => { setReviewData({ ...reviewData, reviewText: e.target.value }); if (reviewError) setReviewError(null); }}
            />
            <button
              disabled={isReviewSubmitting}
              onClick={handlePostReview}
              className="w-full py-4 bg-[#1E4D8C] text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center"
            >
              {isReviewSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</> : "Submit Review"}
            </button>
          </div>
        </div>
      )}

      {/* --- LOGIN REQUIRED MODAL --- */}
      {showLoginRequiredModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800">Login Required</h3>
              <button onClick={() => setShowLoginRequiredModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-600 font-light leading-relaxed">
              Please login to make your reservation. Your selections will be saved and restored after login.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleLoginRedirect}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
              >
                Login to Continue
              </Button>
              <Button
                onClick={() => setShowLoginRequiredModal(false)}
                variant="outline"
                className="w-full py-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <BookingRequestSuccess isVisible={bookingrequestsuccess} salonName={salonservicedata?.salonName || ""} />

      {/* --- STICKY FOOTER WITH BOOKING SUMMARY --- */}
      {(mainPageSelectedStaffId || mainPageSelectedDate || mainPageSelectedSlotTime) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-[15px] border-t border-slate-200/50 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex-1">
              {mainPageSelectedStaffId && mainPageSelectedDate && mainPageSelectedSlotTime ? (
                <>
                  <p className="text-sm font-bold text-slate-900 italic" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Reserve {salonservicedata?.staff?.find((s: any) => s.staff_id === mainPageSelectedStaffId)?.name} for {mainPageSelectedTime}
                  </p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    {new Date(mainPageSelectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • Total: ₹{salonservicedata?.price}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500 font-medium">
                  {!mainPageSelectedStaffId ? "Choose your professional" : !mainPageSelectedDate ? "Choose your date" : "Choose your time"}
                </p>
              )}
            </div>
            <Button 
              onClick={() => setisEditModalOpen(true)} 
              disabled={!mainPageSelectedStaffId || !mainPageSelectedDate || !mainPageSelectedSlotTime}
              className={`ml-4 px-8 h-12 transition-all duration-500 text-xs font-bold uppercase tracking-[0.3em]
                ${!mainPageSelectedStaffId || !mainPageSelectedDate || !mainPageSelectedSlotTime
                  ? "bg-transparent border-2 border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-500"
                  : "bg-slate-900 text-white border-slate-900 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"}`}
            >
              {!mainPageSelectedStaffId || !mainPageSelectedDate || !mainPageSelectedSlotTime 
                ? "Complete" 
                : "CONFIRM"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};

export default SalonService;